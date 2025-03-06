module.exports = (sequelize, Sequelize) => {
  const VideoContent = sequelize.define(
    "video_contents",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      video_url: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        comment: "Duration in seconds",
      },
      transcript: {
        type: Sequelize.TEXT,
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

  return VideoContent;
};
