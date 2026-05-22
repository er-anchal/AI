import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();
import path from "path";
import subscriptionPlanRoutes from "./routes/subscriptionPlanRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import userQueryRoutes from "./routes/userQueryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import searchRoute from "./routes/searchRoute.js";
import roleAccessRoutes from "./routes/roleAccessRoutes.js";
const app = express();
app.use(cors());
// app.use(express.json());

// app.use(express.json({ limit: "15mb" })); // IMPORTANT for base64 thumbnails
// app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);
connectDB();
app.use("/api", searchRoute);
app.use("/api/role-access", roleAccessRoutes);
app.use("/api/modules", moduleRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/subscription-plans", subscriptionPlanRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/user-queries", userQueryRoutes);
app.get("/", (req, res) => {
  res.send("Banner App Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
