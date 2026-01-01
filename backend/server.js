import dotenv from "dotenv";
dotenv.config(); // ✅ MUST be first (fixes undefined URI)

import app from "./src/app.js";
import connectDB from "./src/config/db.js"; // ✅ DB connection logic

// Connect MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
