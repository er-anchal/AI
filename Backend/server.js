// Force nodemon restart to apply .env key updates - corrected GEMINI_API_KEY
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config({ override: true }); // always load .env values, even if already set by dotenvx

import path from "path";
import uploadRoutes from "./routes/uploadRoute.js";

import authRoutes from "./routes/authRoutes.js";

import templateRoutes from "./routes/templateRoutes.js";
import templateCategoryRoutes from "./routes/templateCategoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import templateShotRoutes from "./routes/templateShotRoutes.js";
import { globalSearch } from "./controllers/globalSearch.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import subscriptionPlanRoutes from "./routes/subscriptionPlanRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import userQueryRoutes from "./routes/userQueryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import subModuleRoutes from "./routes/subModuleRoutes.js";
import roleAccessRoutes from "./routes/roleAccessRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

import UserDesignRoutes from "./routes/userDesignRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import flipBookRoutes from "./routes/flipBookRoutes.js";


const app = express();
app.use(cors());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "..", "n_frontend", "public", "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);


// Fallback to backend local uploads folder
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);
connectDB();
app.use("/api/pricing", pricingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/templates", templateRoutes);
app.get("/api/search", globalSearch);
app.use("/api/template-categories", templateCategoryRoutes);
app.use("/api/template-subcategories", subCategoryRoutes);
app.use("/api/template-shots", templateShotRoutes);
app.use("/api/subscription-plans", subscriptionPlanRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/user-queries", userQueryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/submodules", subModuleRoutes);
app.use("/api/role-access", roleAccessRoutes);
app.use("/api/blogs", blogRoutes);

app.use("/api/user-designs", UserDesignRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/flipbooks", flipBookRoutes);



app.get("/", (req, res) => {
  res.send("EKODEX Backend Running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
