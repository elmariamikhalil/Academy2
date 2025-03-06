const db = require("../models");
const Course = db.courses;
const Section = db.sections;
const Content = db.contentTypes;
const VideoContent = db.videoContents;
const TextContent = db.textContents;
const User = db.users;
const Enrollment = db.enrollments;
const ContentProgress = db.contentProgress;
const { Op } = require("sequelize");

// Get all published courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: {
        is_published: true,
      },
      attributes: {
        exclude: ["created_by"],
      },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });

    res.status(200).send(courses);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get featured/recommended courses for homepage
exports.getFeaturedCourses = async (req, res) => {
  try {
    // For simplicity, we'll just get the most enrolled courses
    const courses = await Course.findAll({
      where: {
        is_published: true,
      },
      attributes: {
        include: [
          [
            db.sequelize.literal(`(
            SELECT COUNT(*) FROM user_enrollments 
            WHERE course_id = courses.id
          )`),
            "enrollmentCount",
          ],
        ],
      },
      order: [[db.sequelize.literal("enrollmentCount"), "DESC"]],
      limit: 6,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });

    res.status(200).send(courses);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });

    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }

    // For non-admin users, only allow access to published courses
    if (!course.is_published && req.userRole !== "admin") {
      return res.status(403).send({
        message: "This course is not published yet",
      });
    }

    // Get enrollment count
    const enrollmentCount = await Enrollment.count({
      where: { course_id: course.id },
    });

    // Check if user is enrolled
    let isEnrolled = false;
    let userProgress = 0;

    if (req.userId) {
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: req.userId,
          course_id: course.id,
        },
      });

      isEnrolled = !!enrollment;
      userProgress = enrollment ? enrollment.progress : 0;
    }

    // Return course with additional info
    res.status(200).send({
      ...course.toJSON(),
      enrollmentCount,
      isEnrolled,
      userProgress,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get course sections and content
exports.getCourseSections = async (req, res) => {
  try {
    const courseId = req.params.id;

    // First check if course exists and is published (for non-admins)
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }

    if (!course.is_published && req.userRole !== "admin") {
      return res.status(403).send({
        message: "This course is not published yet",
      });
    }

    // Get sections with content
    const sections = await Section.findAll({
      where: { course_id: courseId },
      order: [["position", "ASC"]],
      include: [
        {
          model: Content,
          as: "contentTypes",
          order: [["position", "ASC"]],
          include: [
            { model: VideoContent, as: "videoContent" },
            { model: TextContent, as: "textContent" },
          ],
        },
      ],
    });

    // If user is authenticated, get their progress for each content
    if (req.userId) {
      // Get all content type IDs from the sections
      const contentTypeIds = [];
      sections.forEach((section) => {
        section.contentTypes.forEach((content) => {
          contentTypeIds.push(content.id);
        });
      });

      // Get progress for these content items
      if (contentTypeIds.length > 0) {
        const progress = await ContentProgress.findAll({
          where: {
            user_id: req.userId,
            content_type_id: {
              [Op.in]: contentTypeIds,
            },
          },
        });

        // Map progress to sections/content
        const progressMap = {};
        progress.forEach((p) => {
          progressMap[p.content_type_id] = p;
        });

        // Add progress to the response
        sections.forEach((section) => {
          section.contentTypes.forEach((content) => {
            const userProgress = progressMap[content.id];
            content.dataValues.userProgress = userProgress
              ? {
                  isCompleted: userProgress.is_completed,
                  lastPosition: userProgress.last_position,
                  completionDate: userProgress.completion_date,
                }
              : null;
          });
        });
      }
    }

    res.status(200).send(sections);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Enroll in a course
exports.enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.userId;

    // Check if course exists and is published
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }

    if (!course.is_published) {
      return res.status(403).send({
        message: "This course is not published yet",
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });

    if (existingEnrollment) {
      return res.status(400).send({
        message: "You are already enrolled in this course",
      });
    }

    // Create enrollment
    await Enrollment.create({
      user_id: userId,
      course_id: courseId,
      enrollment_date: new Date(),
    });

    res.status(200).send({
      message: "Successfully enrolled in the course",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get enrolled courses for current user
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.userId;

    const enrollments = await Enrollment.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Course,
          include: [
            {
              model: User,
              as: "creator",
              attributes: ["id", "first_name", "last_name"],
            },
          ],
        },
      ],
    });

    res.status(200).send(enrollments);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update content progress
exports.updateContentProgress = async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.userId;
    const { isCompleted, lastPosition } = req.body;

    // Validate content exists
    const content = await Content.findByPk(contentId);

    if (!content) {
      return res.status(404).send({ message: "Content not found" });
    }

    // Check if progress record exists
    const progressRecord = await ContentProgress.findOne({
      where: {
        user_id: userId,
        content_type_id: contentId,
      },
    });

    if (progressRecord) {
      // Update existing record
      await progressRecord.update({
        is_completed:
          isCompleted !== undefined ? isCompleted : progressRecord.is_completed,
        last_position:
          lastPosition !== undefined
            ? lastPosition
            : progressRecord.last_position,
        completion_date: isCompleted
          ? new Date()
          : progressRecord.completion_date,
      });
    } else {
      // Create new record
      await ContentProgress.create({
        user_id: userId,
        content_type_id: contentId,
        is_completed: isCompleted || false,
        last_position: lastPosition || 0,
        completion_date: isCompleted ? new Date() : null,
      });
    }

    // Update course progress overall
    await updateCourseProgress(userId, content.section_id);

    res.status(200).send({
      message: "Progress updated successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Helper function to update overall course progress
const updateCourseProgress = async (userId, sectionId) => {
  try {
    // Get the section to find the course
    const section = await Section.findByPk(sectionId);
    if (!section) return;

    const courseId = section.course_id;

    // Get all content for this course
    const sections = await Section.findAll({
      where: { course_id: courseId },
      include: [
        {
          model: Content,
          as: "contentTypes",
        },
      ],
    });

    // Count total content items
    let totalContentItems = 0;
    const contentIds = [];

    sections.forEach((section) => {
      section.contentTypes.forEach((content) => {
        totalContentItems++;
        contentIds.push(content.id);
      });
    });

    // Count completed content items
    const completedItems = await ContentProgress.count({
      where: {
        user_id: userId,
        content_type_id: {
          [Op.in]: contentIds,
        },
        is_completed: true,
      },
    });

    // Calculate progress percentage
    const progressPercentage =
      totalContentItems > 0
        ? Math.round((completedItems / totalContentItems) * 100)
        : 0;

    // Check if course is completed
    const isCompleted =
      totalContentItems > 0 && completedItems === totalContentItems;

    // Update enrollment record
    await Enrollment.update(
      {
        progress: progressPercentage,
        completed: isCompleted,
        completion_date: isCompleted ? new Date() : null,
      },
      {
        where: {
          user_id: userId,
          course_id: courseId,
        },
      }
    );

    return { progressPercentage, isCompleted };
  } catch (error) {
    console.error("Error updating course progress:", error);
  }
};

// Admin Controllers

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      thumbnail,
      difficulty_level,
      duration,
      is_published,
    } = req.body;

    // Create course
    const course = await Course.create({
      title,
      description,
      thumbnail,
      difficulty_level: difficulty_level || "beginner",
      duration: duration || 0,
      is_published: is_published || false,
      created_by: req.userId,
    });

    res.status(201).send({
      message: "Course created successfully",
      courseId: course.id,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check if course exists
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }

    // Update course fields
    await course.update({
      title: req.body.title || course.title,
      description: req.body.description || course.description,
      thumbnail: req.body.thumbnail || course.thumbnail,
      difficulty_level: req.body.difficulty_level || course.difficulty_level,
      duration: req.body.duration || course.duration,
      is_published:
        req.body.is_published !== undefined
          ? req.body.is_published
          : course.is_published,
    });

    res.status(200).send({
      message: "Course updated successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check if course exists
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }

    // Delete course (will cascade delete sections, content, enrollments)
    await course.destroy();

    res.status(200).send({
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Create a section for a course
exports.createSection = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { title, description, position } = req.body;

    // Check if course exists
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }

    // Get max position if not provided
    let sectionPosition = position;
    if (!sectionPosition) {
      const maxPosition = await Section.max("position", {
        where: { course_id: courseId },
      });
      sectionPosition = (maxPosition || 0) + 1;
    }

    // Create section
    const section = await Section.create({
      course_id: courseId,
      title,
      description,
      position: sectionPosition,
    });

    res.status(201).send({
      message: "Section created successfully",
      sectionId: section.id,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update a section
exports.updateSection = async (req, res) => {
  try {
    const sectionId = req.params.sectionId;

    // Check if section exists
    const section = await Section.findByPk(sectionId);

    if (!section) {
      return res.status(404).send({ message: "Section not found" });
    }

    // Update section fields
    await section.update({
      title: req.body.title || section.title,
      description: req.body.description || section.description,
      position: req.body.position || section.position,
    });

    res.status(200).send({
      message: "Section updated successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete a section
exports.deleteSection = async (req, res) => {
  try {
    const sectionId = req.params.sectionId;

    // Check if section exists
    const section = await Section.findByPk(sectionId);

    if (!section) {
      return res.status(404).send({ message: "Section not found" });
    }

    // Delete section (will cascade delete content)
    await section.destroy();

    res.status(200).send({
      message: "Section deleted successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Create content for a section
exports.createContent = async (req, res) => {
  try {
    const sectionId = req.params.sectionId;
    const {
      title,
      content_type,
      position,
      video_url,
      duration,
      transcript,
      text_content,
    } = req.body;

    // Check if section exists
    const section = await Section.findByPk(sectionId);

    if (!section) {
      return res.status(404).send({ message: "Section not found" });
    }

    // Get max position if not provided
    let contentPosition = position;
    if (!contentPosition) {
      const maxPosition = await Content.max("position", {
        where: { section_id: sectionId },
      });
      contentPosition = (maxPosition || 0) + 1;
    }

    // Create content type
    const contentType = await Content.create({
      section_id: sectionId,
      title,
      content_type,
      position: contentPosition,
    });

    // Create specific content based on type
    if (content_type === "video") {
      await VideoContent.create({
        content_type_id: contentType.id,
        video_url,
        duration,
        transcript,
      });
    } else if (content_type === "text") {
      await TextContent.create({
        content_type_id: contentType.id,
        content: text_content,
      });
    }

    res.status(201).send({
      message: "Content created successfully",
      contentId: contentType.id,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update content
exports.updateContent = async (req, res) => {
  try {
    const contentId = req.params.contentId;

    // Check if content exists
    const contentType = await Content.findByPk(contentId, {
      include: [
        { model: VideoContent, as: "videoContent" },
        { model: TextContent, as: "textContent" },
      ],
    });

    if (!contentType) {
      return res.status(404).send({ message: "Content not found" });
    }

    // Update content type fields
    await contentType.update({
      title: req.body.title || contentType.title,
      position: req.body.position || contentType.position,
    });

    // Update specific content based on type
    if (contentType.content_type === "video" && contentType.videoContent) {
      await contentType.videoContent.update({
        video_url: req.body.video_url || contentType.videoContent.video_url,
        duration: req.body.duration || contentType.videoContent.duration,
        transcript: req.body.transcript || contentType.videoContent.transcript,
      });
    } else if (contentType.content_type === "text" && contentType.textContent) {
      await contentType.textContent.update({
        content: req.body.text_content || contentType.textContent.content,
      });
    }

    res.status(200).send({
      message: "Content updated successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete content
exports.deleteContent = async (req, res) => {
  try {
    const contentId = req.params.contentId;

    // Check if content exists
    const contentType = await Content.findByPk(contentId);

    if (!contentType) {
      return res.status(404).send({ message: "Content not found" });
    }

    // Delete content (will cascade delete specific content)
    await contentType.destroy();

    res.status(200).send({
      message: "Content deleted successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
