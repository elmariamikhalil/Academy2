module.exports = (sequelize, Sequelize) => {
  const UserEvaluation = sequelize.define(
    "user_evaluations",
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
      criteria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      evaluated_by: {
        type: Sequelize.INTEGER,
      },
      comments: {
        type: Sequelize.TEXT,
      },
      evaluation_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      timestamps: false,
    }
  );

  return UserEvaluation;
};
