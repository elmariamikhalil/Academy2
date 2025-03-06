const config = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,
    logging: false,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

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
db.contentProgress = require("./content-progress.model.js")(sequelize, Sequelize);
db.evaluationTemplates = require("./evaluation-template.model.js")(sequelize, Sequelize);
db.evaluationCriteria = require("./evaluation-criteria.model.js")(sequelize, Sequelize);
db.scoreRanges = require("./score-range.model.js")(sequelize, Sequelize);
db.userEvaluations = require("./user-evaluation.model.js")(sequelize, Sequelize);

// Relationships
// User - Course (created by)
db.users.hasMany(db.courses, { foreignKey: 'created_by', as: 'createdCourses' });
db.courses.belongsTo(db.users, { foreignKey: 'created_by', as: 'creator' });

// Additional relationships...

module.exports = db;