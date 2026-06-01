import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    readTime: { type: String, default: "5 min read" },
    date: { type: String, required: true },
    author: { type: String, required: true },
    authorRole: { type: String, default: "Author" },
    image: { type: String, required: true },
    authorAvatar: { type: String, default: "/image/clay_avatar.png" },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Blog", BlogSchema);
