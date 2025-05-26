const passport = require("passport");

async function loginUser(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        message: "Login successful",
        user: { id: user.id, email: user.email },
      });
    });
  })(req, res, next);
}

module.exports = { loginUser };
