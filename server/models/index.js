const config = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  operatorsAliases: false,
  logging: false,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.users = require("./user.model.js")(sequelize, Sequelize);
db.courses = require("./course.model.js")(sequelize, Sequelize);
db.sections = require("./section.model.js")(sequelize, Sequelize);
db.contentTypes = require("./content.model.js")(sequelize, Sequelize);
db.videoContents = require("./video.model.js")(sequelize, Sequelize);
db.textContents = require("./text.model.js")(sequelize, Sequelize);
db.enrollments = require("./enrollment.model.js")(sequelize, Sequelize);
db.contentProgress = require("./content-progress.model.js")(
  sequelize,
  Sequelize
);
db.evaluationTemplates = require("./evaluation-template.model.js")(
  sequelize,
  Sequelize
);
db.evaluationCriteria = require("./evaluation-criteria.model.js")(
  sequelize,
  Sequelize
);
db.scoreRanges = require("./score-range.model.js")(sequelize, Sequelize);
db.userEvaluations = require("./user-evaluation.model.js")(
  sequelize,
  Sequelize
);

// Relationships
// User - Course (created by)
db.users.hasMany(db.courses, {
  foreignKey: "created_by",
  as: "createdCourses",
});
db.courses.belongsTo(db.users, { foreignKey: "created_by", as: "creator" });

// Course - Section
db.courses.hasMany(db.sections, { foreignKey: "course_id", as: "sections" });
db.sections.belongsTo(db.courses, { foreignKey: "course_id" });

// Section - Content Types
db.sections.hasMany(db.contentTypes, {
  foreignKey: "section_id",
  as: "contentTypes",
});
db.contentTypes.belongsTo(db.sections, { foreignKey: "section_id" });

// Content Types - Video Content
db.contentTypes.hasOne(db.videoContents, {
  foreignKey: "content_type_id",
  as: "videoContent",
});
db.videoContents.belongsTo(db.contentTypes, { foreignKey: "content_type_id" });

// Content Types - Text Content
db.contentTypes.hasOne(db.textContents, {
  foreignKey: "content_type_id",
  as: "textContent",
});
db.textContents.belongsTo(db.contentTypes, { foreignKey: "content_type_id" });

// User - Enrollment - Course
db.users.hasMany(db.enrollments, { foreignKey: "user_id", as: "enrollments" });
db.courses.hasMany(db.enrollments, {
  foreignKey: "course_id",
  as: "enrolledUsers",
});
db.enrollments.belongsTo(db.users, { foreignKey: "user_id" });
db.enrollments.belongsTo(db.courses, { foreignKey: "course_id" });

// User - Content Progress
db.users.hasMany(db.contentProgress, {
  foreignKey: "user_id",
  as: "contentProgress",
});
db.contentTypes.hasMany(db.contentProgress, {
  foreignKey: "content_type_id",
  as: "userProgress",
});
db.contentProgress.belongsTo(db.users, { foreignKey: "user_id" });
db.contentProgress.belongsTo(db.contentTypes, {
  foreignKey: "content_type_id",
});

// Evaluation Template - Criteria
db.evaluationTemplates.hasMany(db.evaluationCriteria, {
  foreignKey: "template_id",
  as: "criteria",
});
db.evaluationCriteria.belongsTo(db.evaluationTemplates, {
  foreignKey: "template_id",
});

// Evaluation Criteria - Score Ranges
db.evaluationCriteria.hasMany(db.scoreRanges, {
  foreignKey: "criteria_id",
  as: "scoreRanges",
});
db.scoreRanges.belongsTo(db.evaluationCriteria, { foreignKey: "criteria_id" });

// User - Evaluations
db.users.hasMany(db.userEvaluations, {
  foreignKey: "user_id",
  as: "evaluations",
});
db.evaluationCriteria.hasMany(db.userEvaluations, {
  foreignKey: "criteria_id",
  as: "userEvaluations",
});
db.userEvaluations.belongsTo(db.users, { foreignKey: "user_id" });
db.userEvaluations.belongsTo(db.evaluationCriteria, {
  foreignKey: "criteria_id",
});
db.userEvaluations.belongsTo(db.users, {
  foreignKey: "evaluated_by",
  as: "evaluator",
});

// User - Evaluation Templates (created by)
db.users.hasMany(db.evaluationTemplates, {
  foreignKey: "created_by",
  as: "createdTemplates",
});
db.evaluationTemplates.belongsTo(db.users, {
  foreignKey: "created_by",
  as: "creator",
});

module.exports = db;
