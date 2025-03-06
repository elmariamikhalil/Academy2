import api from "./api";

class CourseService {
  // Public methods (for both users and admins)
  getAllCourses() {
    return api.get("/courses");
  }

  getCourseById(id) {
    return api.get(`/courses/${id}`);
  }

  getFeaturedCourses() {
    return api.get("/courses/featured");
  }

  getCourseSections(courseId) {
    return api.get(`/courses/${courseId}/sections`);
  }

  // User methods
  enrollInCourse(courseId) {
    return api.post(`/courses/${courseId}/enroll`);
  }

  getEnrolledCourses() {
    return api.get("/user/enrollments");
  }

  updateContentProgress(contentId, data) {
    return api.post(`/learning/content/${contentId}/progress`, data);
  }

  // Admin methods
  getAllCoursesAdmin() {
    return api.get("/admin/courses");
  }

  createCourse(courseData) {
    return api.post("/admin/courses", courseData);
  }

  updateCourse(courseId, courseData) {
    return api.put(`/admin/courses/${courseId}`, courseData);
  }

  deleteCourse(courseId) {
    return api.delete(`/admin/courses/${courseId}`);
  }

  // Section management
  createSection(courseId, sectionData) {
    return api.post(`/admin/courses/${courseId}/sections`, sectionData);
  }

  updateSection(sectionId, sectionData) {
    return api.put(`/admin/sections/${sectionId}`, sectionData);
  }

  deleteSection(sectionId) {
    return api.delete(`/admin/sections/${sectionId}`);
  }

  // Content management
  createContent(sectionId, contentData) {
    return api.post(`/admin/sections/${sectionId}/content`, contentData);
  }

  updateContent(contentId, contentData) {
    return api.put(`/admin/content/${contentId}`, contentData);
  }

  deleteContent(contentId) {
    return api.delete(`/admin/content/${contentId}`);
  }
}

export default new CourseService();
