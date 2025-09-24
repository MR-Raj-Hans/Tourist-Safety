// Timeout middleware to prevent hanging requests
const timeout = (ms) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Request timeout',
          error: 'The request took too long to complete'
        });
      }
    }, ms);

    // Clear timeout when response is sent
    const originalSend = res.send;
    res.send = function(...args) {
      clearTimeout(timer);
      return originalSend.apply(this, args);
    };

    const originalJson = res.json;
    res.json = function(...args) {
      clearTimeout(timer);
      return originalJson.apply(this, args);
    };

    next();
  };
};

module.exports = timeout;