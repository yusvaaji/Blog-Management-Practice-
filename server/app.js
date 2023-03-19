const express = require("express");
const app = express();
const PORT = process.env.PORT || 4300;
const cors = require("cors");

app.use(cors())
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const routes = require("./routes");
app.use(routes);

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
