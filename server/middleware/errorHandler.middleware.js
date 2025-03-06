// Global error handler
module.exports = (err, req, res, next) => {
    console.error(err.stack);
    
    // Check if the error has a status code, otherwise use 500
    const statusCode = err.statusCode || 500;
    
    // Send error response
    res.status(statusCode).json({
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };