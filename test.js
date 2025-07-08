const pool = require("./db");
(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Connected to database at:", result.rows[0].now);
  } catch (err) {
    console.log("Database connection error:", err);
  }
})();
