const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const controller = require('../controllers/course.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Public routes
  app.get('/api/courses', controller.getAllCourses);
  app.get('/api/courses/:id', controller.getCourseById);
  app.get('/api/courses/:id/sections', controller.getCourseSections);
  
  // User routes (requires authentication)
  app.post('/api/courses/:id/enroll', verifyToken, controller.enrollInCourse);
  app.get('/api/user/enrollments', verifyToken, controller.getEnrolledCourses);
  
  // Admin routes (requires admin role)
  app.post('/api/admin/courses', [verifyToken, isAdmin], controller.createCourse);
  app.put('/api/admin/courses/:id', [verifyToken, isAdmin], controller.updateCourse);
  app.delete('/api/admin/courses/:id', [verifyToken, isAdmin], controller.deleteCourse);
  
  // More routes...
};