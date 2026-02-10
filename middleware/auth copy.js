const JWT = require("jsonwebtoken");
const db = require("../schema");
const { ROLE } = require("./enum"); 


// 1 : true , false y add karvanu for wishlist ( login hoi to wishlist item batavo else common product )
// 2 : role multiple y hoi sake

module.exports = (roles = Object.values(ROLE)) => {

  return async (req, res, next) => {
    try {
      console.log("req.header :", req.headers.authorization);

      let token = req.headers.authorization;

      // CHANGE: safety check
      if (!token) {
        return res.status(401).json({
          success: false,
          status: 401,
          message: "Token Required 🫡",
        });
      }

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

      // CHANGE: role validation
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
      return res.status(401).json({
        success: false,
        status: 401,
        message: err.message,
      });
    }
  };
};
