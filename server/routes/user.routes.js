const { verifyToken, isAdmin, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const controller = require('../controllers/user.controller');
const uploadMiddleware = require('../middleware/upload.middleware');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // User profile routes
  app.get('/api/user/profile', verifyToken, controller.getCurrentUserProfile);
  app.put('/api/user/profile', verifyToken, controller.updateCurrentUserProfile);
  app.put('/api/user/password', verifyToken, controller.changePassword);
  app.post('/api/user/profile-image', [verifyToken, uploadMiddleware.single('image')], controller.uploadProfileImage);
  
  // More routes...
};