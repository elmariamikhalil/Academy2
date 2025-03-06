const db = require("../models");
const { Op } = require("sequelize");
const { Parser } = require("json2csv");
const User = db.users;
const Course = db.courses;
const Enrollment = db.enrollments;
const UserEvaluation = db.userEvaluations;
const EvaluationCriteria = db.evaluationCriteria;
const EvaluationTemplate = db.evaluationTemplates;

// Helper to get date range
const getDateRange = (period) => {
  const today = new Date();
  const startDate = new Date();

  switch (period) {
    case "week":
      startDate.setDate(today.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(today.getMonth() - 1);
      break;
    case "quarter":
      startDate.setMonth(today.getMonth() - 3);
      break;
    case "year":
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    default:
      // Default to last 30 days
      startDate.setDate(today.getDate() - 30);
  }

  return { startDate, today };
};

// Generate users report
exports.getUsersReport = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.count();

    // Get admins
    const totalAdmins = await User.count({
      where: { role: "admin" },
    });

    // Get recent users
    const recentUsers = await User.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "created_at",
      ],
    });

    // Get enrollment count
    const enrollmentCount = await Enrollment.count();

    // Get completed course count
    const completedCourseCount = await Enrollment.count({
      where: { completed: true },
    });

    // Calculate completion rate
    const completionRate =
      enrollmentCount > 0 ? (completedCourseCount / enrollmentCount) * 100 : 0;

    // Return report data
    res.status(200).send({
      totalUsers,
      totalAdmins,
      recentUsers,
      enrollmentCount,
      completedCourseCount,
      completionRate,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Generate courses report
exports.getCoursesReport = async (req, res) => {
  try {
    // Get total courses
    const totalCourses = await Course.count();

    // Get published courses
    const publishedCourses = await Course.count({
      where: { is_published: true },
    });

    // Get popular courses (most enrollments)
    const popularCourses = await Course.findAll({
      attributes: [
        "id",
        "title",
        "thumbnail",
        "difficulty_level",
        [
          db.sequelize.literal(
            "(SELECT COUNT(*) FROM user_enrollments WHERE course_id = courses.id)"
          ),
          "enrollmentCount",
        ],
      ],
      order: [[db.sequelize.literal("enrollmentCount"), "DESC"]],
      limit: 5,
      raw: true,
    });

    // Return report data
    res.status(200).send({
      totalCourses,
      publishedCourses,
      popularCourses,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Generate evaluation report for a specific template
exports.getEvaluationReport = async (req, res) => {
  try {
    const templateId = req.params.templateId;

    // Get template details
    const template = await EvaluationTemplate.findByPk(templateId, {
      include: [
        {
          model: EvaluationCriteria,
          as: "criteria",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!template) {
      return res.status(404).send({ message: "Template not found" });
    }

    // Get evaluations for this template
    const criteriaIds = template.criteria.map((c) => c.id);

    const evaluations = await UserEvaluation.findAll({
      where: {
        criteria_id: {
          [Op.in]: criteriaIds,
        },
      },
      include: [
        {
          model: User,
          attributes: ["id", "username", "first_name", "last_name"],
        },
        {
          model: EvaluationCriteria,
          include: [
            {
              model: EvaluationTemplate,
              attributes: ["id", "title"],
            },
          ],
        },
        {
          model: User,
          as: "evaluator",
          attributes: ["id", "username", "first_name", "last_name"],
        },
      ],
    });

    // Aggregate data for report
    const evaluationsByUser = {};

    evaluations.forEach((eval) => {
      const userId = eval.user_id;
      if (!evaluationsByUser[userId]) {
        evaluationsByUser[userId] = {
          userId,
          username: eval.user.username,
          firstName: eval.user.first_name,
          lastName: eval.user.last_name,
          criteria: {},
        };
      }

      evaluationsByUser[userId].criteria[eval.criteria_id] = {
        criteriaName: eval.evaluation_criterion.name,
        score: eval.score,
        comments: eval.comments,
        evaluator: `${eval.evaluator.first_name} ${eval.evaluator.last_name}`,
        date: eval.evaluation_date,
      };
    });

    // Convert to array
    const report = Object.values(evaluationsByUser);

    // Calculate average score per criteria
    const criteriaAverages = {};
    template.criteria.forEach((c) => {
      const scores = evaluations
        .filter((e) => e.criteria_id === c.id)
        .map((e) => e.score);

      criteriaAverages[c.id] = {
        criteriaName: c.name,
        averageScore:
          scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0,
        evaluationCount: scores.length,
      };
    });

    // Return report data
    res.status(200).send({
      templateName: template.title,
      templateDescription: template.description,
      criteria: template.criteria,
      criteriaAverages: Object.values(criteriaAverages),
      userEvaluations: report,
      totalEvaluations: evaluations.length,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Generate enrollment report
exports.getEnrollmentReport = async (req, res) => {
  try {
    const { period } = req.query;
    const { startDate, today } = getDateRange(period);

    // Get enrollments over time
    const enrollments = await Enrollment.findAll({
      where: {
        enrollment_date: {
          [Op.between]: [startDate, today],
        },
      },
      attributes: [
        [db.sequelize.fn("DATE", db.sequelize.col("enrollment_date")), "date"],
        [db.sequelize.fn("COUNT", "*"), "count"],
      ],
      group: [db.sequelize.fn("DATE", db.sequelize.col("enrollment_date"))],
      order: [
        [db.sequelize.fn("DATE", db.sequelize.col("enrollment_date")), "ASC"],
      ],
      raw: true,
    });

    // Get courses with most enrollments in period
    const topCourses = await Course.findAll({
      attributes: [
        "id",
        "title",
        [
          db.sequelize.literal(`(
          SELECT COUNT(*) FROM user_enrollments 
          WHERE course_id = courses.id 
          AND enrollment_date BETWEEN '${startDate.toISOString()}' AND '${today.toISOString()}'
        )`),
          "enrollmentCount",
        ],
      ],
      having: db.sequelize.literal("enrollmentCount > 0"),
      order: [[db.sequelize.literal("enrollmentCount"), "DESC"]],
      limit: 10,
      raw: true,
    });

    // Return report data
    res.status(200).send({
      period,
      startDate,
      endDate: today,
      dailyEnrollments: enrollments,
      topCourses,
      totalEnrollments: enrollments.reduce(
        (sum, item) => sum + parseInt(item.count),
        0.0
      ),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Generate completion rate report
exports.getCompletionRateReport = async (req, res) => {
  try {
    // Get completion rate by course
    const courseCompletionRates = await Course.findAll({
      attributes: [
        "id",
        "title",
        [
          db.sequelize.literal(`(
          SELECT COUNT(*) FROM user_enrollments 
          WHERE course_id = courses.id
        )`),
          "totalEnrollments",
        ],
        [
          db.sequelize.literal(`(
          SELECT COUNT(*) FROM user_enrollments 
          WHERE course_id = courses.id AND completed = true
        )`),
          "completedEnrollments",
        ],
      ],
      having: db.sequelize.literal("totalEnrollments > 0"),
      order: [[db.sequelize.col("title"), "ASC"]],
      raw: true,
    });

    // Calculate completion rate for each course
    const coursesWithRate = courseCompletionRates.map((course) => ({
      ...course,
      completionRate:
        course.totalEnrollments > 0
          ? (course.completedEnrollments / course.totalEnrollments) * 100
          : 0,
    }));

    // Get average completion time (in days) for completed courses
    const completionTimes = await Enrollment.findAll({
      attributes: [
        "course_id",
        [
          db.sequelize.fn(
            "AVG",
            db.sequelize.literal("DATEDIFF(completion_date, enrollment_date)")
          ),
          "avgCompletionDays",
        ],
      ],
      where: {
        completed: true,
        completion_date: {
          [Op.not]: null,
        },
      },
      group: ["course_id"],
      raw: true,
    });

    // Merge completion times with rates
    const coursesWithData = coursesWithRate.map((course) => {
      const completionTime = completionTimes.find(
        (c) => c.course_id === course.id
      );
      return {
        ...course,
        avgCompletionDays: completionTime
          ? parseFloat(completionTime.avgCompletionDays).toFixed(1)
          : null,
      };
    });

    // Calculate overall completion rate
    const overallStats = {
      totalEnrollments: coursesWithRate.reduce(
        (sum, c) => sum + parseInt(c.totalEnrollments),
        0
      ),
      totalCompletions: coursesWithRate.reduce(
        (sum, c) => sum + parseInt(c.completedEnrollments),
        0
      ),
    };

    overallStats.overallCompletionRate =
      overallStats.totalEnrollments > 0
        ? (overallStats.totalCompletions / overallStats.totalEnrollments) * 100
        : 0;

    // Return report data
    res.status(200).send({
      courseData: coursesWithData,
      overallStats,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Export report to CSV
exports.exportReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    let data = [];
    let fields = [];
    let filename = "";

    switch (reportType) {
      case "users":
        // Get all users for export
        data = await User.findAll({
          attributes: [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "created_at",
          ],
          raw: true,
        });

        fields = [
          { label: "ID", value: "id" },
          { label: "Username", value: "username" },
          { label: "Email", value: "email" },
          { label: "First Name", value: "first_name" },
          { label: "Last Name", value: "last_name" },
          { label: "Role", value: "role" },
          { label: "Created At", value: "created_at" },
        ];

        filename = "users_report.csv";
        break;

      case "courses":
        // Get all courses with enrollment info
        data = await Course.findAll({
          attributes: [
            "id",
            "title",
            "description",
            "difficulty_level",
            "duration",
            "is_published",
            "created_at",
            [
              db.sequelize.literal(`(
              SELECT COUNT(*) FROM user_enrollments 
              WHERE course_id = courses.id
            )`),
              "totalEnrollments",
            ],
            [
              db.sequelize.literal(`(
              SELECT COUNT(*) FROM user_enrollments 
              WHERE course_id = courses.id AND completed = true
            )`),
              "completedEnrollments",
            ],
          ],
          raw: true,
        });

        fields = [
          { label: "ID", value: "id" },
          { label: "Title", value: "title" },
          { label: "Description", value: "description" },
          { label: "Difficulty Level", value: "difficulty_level" },
          { label: "Duration (minutes)", value: "duration" },
          { label: "Published", value: "is_published" },
          { label: "Created At", value: "created_at" },
          { label: "Total Enrollments", value: "totalEnrollments" },
          { label: "Completed Enrollments", value: "completedEnrollments" },
        ];

        filename = "courses_report.csv";
        break;

      case "enrollments":
        // Get all enrollments with user and course info
        data = await Enrollment.findAll({
          include: [
            {
              model: User,
              attributes: ["username", "first_name", "last_name"],
            },
            {
              model: Course,
              attributes: ["title"],
            },
          ],
          raw: true,
          nest: true,
        });

        // Transform data for CSV
        data = data.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          username: item.user.username,
          full_name: `${item.user.first_name} ${item.user.last_name}`,
          course_id: item.course_id,
          course_title: item.course.title,
          progress: item.progress,
          completed: item.completed,
          enrollment_date: item.enrollment_date,
          completion_date: item.completion_date,
        }));

        fields = [
          { label: "ID", value: "id" },
          { label: "User ID", value: "user_id" },
          { label: "Username", value: "username" },
          { label: "Full Name", value: "full_name" },
          { label: "Course ID", value: "course_id" },
          { label: "Course Title", value: "course_title" },
          { label: "Progress (%)", value: "progress" },
          { label: "Completed", value: "completed" },
          { label: "Enrollment Date", value: "enrollment_date" },
          { label: "Completion Date", value: "completion_date" },
        ];

        filename = "enrollments_report.csv";
        break;

      default:
        return res.status(400).send({ message: "Invalid report type" });
    }

    // Generate CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    // Set headers for file download
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.set("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
