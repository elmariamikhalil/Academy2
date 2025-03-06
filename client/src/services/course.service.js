import api from './api';

class CourseService {
  // Public methods (for both users and admins)
  getAllCourses() {
    return api.get('/courses');
  }
  
  getCourseById(id) {
    return api.get(`/courses/${id}`);
  }
  
  getFeaturedCourses() {
    return api.get('/courses/featured');
  }
  
  // More methods
  // ...
}

export default new CourseService();