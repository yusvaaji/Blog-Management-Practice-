const userRoute = require("express").Router();
const { UserController } = require("../controllers");
// const { authJwt } = require("../helpers");

userRoute.get("/", UserController.getAllUsers);
userRoute.get("/account/:UserId", UserController.getUserAccount);
userRoute.post("/register", UserController.register);
userRoute.post("/login", UserController.login);

userRoute.delete("/remove/:UserId", UserController.remove);
userRoute.put("/edit/:UserId", UserController.edit);

userRoute.get("/account/:UserId/posts", UserController.getPostByUser);
// userRoute.get(
//     "/admin",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     UserController.adminBoard
//   );
module.exports = userRoute;
