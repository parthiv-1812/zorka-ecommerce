const JWT = require("jsonwebtoken");
const db = require("../schema");
const { ROLE } = require("./enum");

// roles = allowed roles
// optional = true → token na hoy to pan request allow
module.exports = (roles = Object.values(ROLE), optional = false) => {

  return async (req, res, next) => {
    try {
      console.log("req.header :", req.headers.authorization);

      let token = req.headers.authorization;

      // 🔹 TOKEN NATHI
      if (!token) {

        // ✅ OPTIONAL LOGIN → PUBLIC ACCESS
        if (optional) {
          req.user = null;
          return next();
        }

        // ❌ TOKEN REQUIRED
        return res.status(401).json({
          success: false,
          status: 401,
          message: "Token Required 🫡",
        });
      }

      // 🔹 Bearer TOKEN
      token = token.split(" ")?.[1];

      const payload = JWT.verify(token, process.env.JWT_SECRET);
      const user = await db.user.findById(payload._id);

      if (!user) {
        return res.status(401).json({
          success: false,
          status: 401,
          message: "User Not Found 🫤",
        });
      }

      // 🔹 ROLE CHECK
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          status: 403,
          message: "Access Denied 🚫",
        });
      }

      console.log("User Token Verify Successfully 🥳", user.email);

      req.user = user;
      next();

    } catch (err) {

      // 🔹 TOKEN INVALID PAN OPTIONAL TRUE
      if (optional) {
        req.user = null;
        return next();
      }

      return res.status(401).json({
        success: false,
        status: 401,
        message: err.message,
      });
    }
  };
};
