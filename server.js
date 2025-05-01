const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Budgeting API is running!");
});

app.get("/hello", (req, res) => {
  console.log("Hello endpoint was hit");
  res.send("Check the console!");
});

app.listen(port, () => {
  console.log(`Budgeting API listening at http://localhost:${port}`);
});
