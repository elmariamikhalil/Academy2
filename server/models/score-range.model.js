module.exports = (sequelize, Sequelize) => {
  const ScoreRange = sequelize.define(
    "score_ranges",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      criteria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      min_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      max_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "e.g. Poor, Fair, Good, Excellent",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return ScoreRange;
};
