module.exports = function multerWrapper(multerMiddleware) {
  return function (req, res, next) {
    multerMiddleware(req, res, function (err) {
      if (err?.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ message: "File too large. Max is 50MB." });
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};
