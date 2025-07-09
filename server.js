const express = require("express");
const app = express();
const port = 3000;

const envelopesRouter = require("./envelopes");
const transactionRouter = require("./transactions");
app.use("/transactions", transactionRouter);

app.use(express.json());

// Test route to check if the server is running
app.get("/", (req, res) => {
  res.send("Budgeting API is running!");
});

app.get("/hello", (req, res) => {
  console.log("Hello endpoint was hit");
  res.send("Check the console!");
});

app.use("/envelopes", envelopesRouter);

app.listen(port, () => {
  console.log(`Budgeting API listening at http://localhost:${port}`);
});
