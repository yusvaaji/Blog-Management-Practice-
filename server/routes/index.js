const { Router } = require("express");
const route = Router();
const mainEndpoint = "/api"

route.get(mainEndpoint, (req, res) => {
  res.status(200).json({
    message: "API for FS Applications",
  });
});

// Routes
const userRoutes = require("./user");
const postRoutes = require("./post");
// Endpoints
route.use(`${mainEndpoint}/users`, userRoutes);
route.use(`${mainEndpoint}/posts`, postRoutes);

module.exports = route;
