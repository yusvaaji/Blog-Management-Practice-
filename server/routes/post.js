const postRoute = require("express").Router();
const { PostController } = require("../controllers");

postRoute.get("/", PostController.getPost);
postRoute.post("/store", PostController.store);
postRoute.put("/edit/:id", PostController.edit);
postRoute.delete("/destroy/:id", PostController.destroy);

postRoute.get("/details/:id", PostController.getDetailsById);

module.exports = postRoute;
