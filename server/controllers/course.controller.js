const db = require('../models');
const Course = db.courses;
const Section = db.sections;
const Content = db.contentTypes;
const VideoContent = db.videoContents;
const TextContent = db.textContents;
const User = db.users;
const Enrollment = db.enrollments;

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: {
        is_published: true
      },
      attributes: {
        exclude: ['created_by']
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'first_name', 'last_name']
      }]
    });
    
    res.status(200).send(courses);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// More controller methods...