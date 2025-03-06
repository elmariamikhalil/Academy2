module.exports = (sequelize, Sequelize) => {
  const Enrollment = sequelize.define(
    "user_enrollments",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      progress: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "Progress percentage",
      },
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      enrollment_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      completion_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return Enrollment;
};
