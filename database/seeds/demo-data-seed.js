const db = require("../../server/models");

const createDemoData = async () => {
  try {
    // Create demo evaluation template
    const templateExists = await db.evaluationTemplates.findOne({});

    if (!templateExists) {
      const template = await db.evaluationTemplates.create({
        title: "Course Completion Evaluation",
        description:
          "Evaluation template for assessing user performance after completing a course",
        created_by: 1, // Admin user
      });

      // Create criteria
      const criteria1 = await db.evaluationCriteria.create({
        template_id: template.id,
        name: "Technical Skills",
        min_score: 0,
        max_score: 100,
      });

      const criteria2 = await db.evaluationCriteria.create({
        template_id: template.id,
        name: "Communication",
        min_score: 0,
        max_score: 100,
      });

      const criteria3 = await db.evaluationCriteria.create({
        template_id: template.id,
        name: "Problem Solving",
        min_score: 0,
        max_score: 100,
      });

      // Create score ranges for criteria
      await db.scoreRanges.create({
        criteria_id: criteria1.id,
        min_value: 0,
        max_value: 30,
        label: "Needs Improvement",
      });

      await db.scoreRanges.create({
        criteria_id: criteria1.id,
        min_value: 31,
        max_value: 50,
        label: "Satisfactory",
      });

      await db.scoreRanges.create({
        criteria_id: criteria1.id,
        min_value: 51,
        max_value: 70,
        label: "Good",
      });

      await db.scoreRanges.create({
        criteria_id: criteria1.id,
        min_value: 71,
        max_value: 100,
        label: "Excellent",
      });

      // Similar ranges for other criteria...

      console.log("Demo evaluation template created");
    }
  } catch (error) {
    console.error("Error creating demo data:", error);
  }
};

module.exports = {
  createDemoData,
};
