module.exports = (sequelize, Sequelize) => {
  const ContentProgress = sequelize.define(
    "content_progress",
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
      content_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      last_position: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "Last position in video (seconds)",
      },
      completion_date: {
        type: Sequelize.DATE,
        allowNull: true,
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

  return ContentProgress;
};
