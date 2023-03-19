const jwt = require("jsonwebtoken");
const secretCode = process.env.SECRET_CODE || "blogiki";
const db = require("../models");
const User = db.User;
const tokenGenerator = (data) => {
  const { id, username, email, image } = data;
  return jwt.sign(
    {
      id,
      username,
      email,
      image,
    },
    secretCode
  );
};

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
   if(user.username.contains("admin"))
   {
     return;
   }
   else
   {
      res.status(403).send({
        message: "Require Admin Role!",
      });
      return;
    };
  });
};
const authJwt = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
  };
module.exports = {
  tokenGenerator,
  authJwt
};
