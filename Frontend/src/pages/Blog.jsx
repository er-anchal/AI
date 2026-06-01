import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  TextField,
  InputAdornment,
  Chip,
  Drawer,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import Diamond from "@mui/icons-material/Diamond";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "./auth/AuthContext";
import axios from "axios";
import Footer from "../components/Footer";

const Blog = ({ isAdminView = false }) => {
  const { darkMode } = useThemeContext();
  const { user, token } = useAuth();

  const userRole = (user?.role || localStorage.getItem("role") || "").toUpperCase().trim();
  const isManager = isAdminView && (userRole === "ADMIN" || userRole === "SUPER ADMIN");

  console.log("DEBUG BLOG AUTH:", {
    userObject: user,
    localStorageRole: localStorage.getItem("role"),
    computedUserRole: userRole,
    isManagerEvaluatedTo: isManager
  });

  // Dynamic states
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeArticle, setActiveArticle] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const dynamicCategories = ["All", ...new Set(posts.map((p) => p.category).filter(Boolean))];

  // Admin Editor States
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // null if creating a new post
  const [imageUploading, setImageUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "Jewelry Studio",
    readTime: "5 min read",
    author: "",
    authorRole: "",
    image: "",
    authorAvatar: "/image/clay_avatar.png",
    content: "",
    featured: false
  });

  // Fetch blogs on mount
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${baseUrl}/blogs`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error loading blog posts:", err);
      setToast({ open: true, message: "Could not fetch dynamic blog articles.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Theme-aware tokens matching Home.jsx
  const bgThemeColor = darkMode ? "#030712" : "#f8fafc";
  const textThemeColor = darkMode ? "#ffffff" : "#0f172a";
  const textMutedThemeColor = darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(15, 23, 42, 0.6)";
  const cardBgColor = darkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.85)";
  const cardBorderColor = darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.06)";
  const gridDotColor = darkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.04)";

  // Glowing lights backdrop
  const blurOverlay1 = darkMode
    ? "radial-gradient(circle, rgba(182, 255, 42, 0.06) 0%, rgba(0, 0, 0, 0) 70%)"
    : "radial-gradient(circle, rgba(182, 255, 42, 0.03) 0%, rgba(255, 255, 255, 0) 75%)";
  const blurOverlay2 = darkMode
    ? "radial-gradient(circle, rgba(0, 230, 118, 0.05) 0%, rgba(0, 0, 0, 0) 75%)"
    : "radial-gradient(circle, rgba(0, 230, 118, 0.02) 0%, rgba(255, 255, 255, 0) 80%)";

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setToast({
      open: true,
      message: "Successfully subscribed to our newsletter! Stay tuned for AI design insights.",
      severity: "success"
    });
    setNewsletterEmail("");
  };

  // Helper to resolve dynamic source URLs
  const getImageSrc = (imagePath, defaultFallback = "") => {
    if (!imagePath) return defaultFallback;
    if (imagePath.startsWith("/uploads")) {
      const apiBase = import.meta.env.VITE_API_URL;
      // Remove trailing /api if present to get the base domain for static assets
      const origin = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
      return `${origin}${imagePath}`;
    }
    return imagePath;
  };

  // Image Upload helper
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("imageFile", file);

    try {
      setImageUploading(true);
      const baseUrl = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${baseUrl}/upload/image`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      // Set uploaded path in form state
      setFormData((prev) => ({ ...prev, image: res.data.filePath }));
      setToast({ open: true, message: "Cover image uploaded successfully!", severity: "success" });
    } catch (err) {
      console.error("Cover image upload failed:", err);
      setToast({ open: true, message: "Could not upload the image file.", severity: "error" });
    } finally {
      setImageUploading(false);
    }
  };

  // Avatar Image Upload helper
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("imageFile", file);

    try {
      setAvatarUploading(true);
      const baseUrl = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${baseUrl}/upload/image`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      // Set uploaded avatar path in form state
      setFormData((prev) => ({ ...prev, authorAvatar: res.data.filePath }));
      setToast({ open: true, message: "Author profile photo uploaded successfully!", severity: "success" });
    } catch (err) {
      console.error("Avatar image upload failed:", err);
      setToast({ open: true, message: "Could not upload the profile photo.", severity: "error" });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Open creation editor
  const handleAddClick = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      excerpt: "",
      category: "Jewelry Studio",
      readTime: "5 min read",
      author: user?.name || "",
      authorRole: "Author",
      image: "",
      authorAvatar: "/image/clay_avatar.png",
      content: "",
      featured: false
    });
    setEditorOpen(true);
  };

  // Open update editor
  const handleEditClick = (e, post) => {
    e.stopPropagation();
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      readTime: post.readTime,
      author: post.author,
      authorRole: post.authorRole,
      image: post.image,
      authorAvatar: post.authorAvatar || "/image/clay_avatar.png",
      content: post.content,
      featured: post.featured
    });
    setEditorOpen(true);
  };

  // Delete Article handler
  const handleDeleteClick = async (e, id, title) => {
    e.stopPropagation();
    const confirmMessage = `Are you sure you want to delete the article "${title}"? This cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      await axios.delete(`${baseUrl}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ open: true, message: "Article deleted successfully!", severity: "success" });
      fetchBlogs();
    } catch (err) {
      console.error("Failed to delete article:", err);
      setToast({ open: true, message: "Failed to delete the article.", severity: "error" });
    }
  };

  // Save changes handler
  const handleSavePost = async () => {
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim() || !formData.author.trim() || !formData.image.trim()) {
      alert("Please fill in all required fields and upload a cover photo.");
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const headers = { Authorization: `Bearer ${token}` };

      if (editingPost) {
        // Edit Mode
        await axios.put(`${baseUrl}/blogs/${editingPost._id || editingPost.id}`, formData, { headers });
        setToast({ open: true, message: "Article updated successfully!", severity: "success" });
      } else {
        // Creation Mode
        await axios.post(`${baseUrl}/blogs`, formData, { headers });
        setToast({ open: true, message: "New article published successfully!", severity: "success" });
      }

      setEditorOpen(false);
      fetchBlogs();
    } catch (err) {
      console.error("Save blog post failed:", err);
      setToast({ open: true, message: "Could not save the article. Check permissions.", severity: "error" });
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts.find((p) => p.featured) || filteredPosts[0];
  const regularPosts = featuredPost
    ? filteredPosts.filter((p) => (p._id || p.id) !== (featuredPost._id || featuredPost.id) || selectedCategory !== "All")
    : filteredPosts;

  return (
    <>
      <Box
        sx={{
          backgroundColor: bgThemeColor,
          color: textThemeColor,
          fontFamily: "'Inter', sans-serif",
          position: "relative",
          minHeight: isAdminView ? "auto" : "100vh",
          pt: isAdminView ? 2 : 6,
          pb: 0,
          overflowX: "hidden",
          transition: "background-color 0.3s ease, color 0.3s ease"
        }}
        className="luxury-grid"
      >
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        .premium-font {
          font-family: 'Outfit', 'Inter', sans-serif !important;
        }
        
        .body-font {
          font-family: 'Inter', sans-serif !important;
        }

        .luxury-grid {
          background-image: radial-gradient(${gridDotColor} 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .text-glow-neon {
          text-shadow: ${darkMode ? "0 0 45px rgba(182, 255, 42, 0.45)" : "0 0 30px rgba(0, 230, 118, 0.25)"};
        }

        .hover-translate-y {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .hover-translate-y:hover {
          transform: translateY(-8px) scale(1.01) !important;
          border-color: ${darkMode ? "rgba(182, 255, 42, 0.25)" : "rgba(0, 230, 118, 0.25)"} !important;
          box-shadow: ${darkMode ? "0 20px 40px rgba(0, 0, 0, 0.4)" : "0 15px 30px rgba(15, 23, 42, 0.05)"} !important;
        }

        .pill-register-btn {
          background: linear-gradient(135deg, #B6FF2A 0%, #00E676 100%) !important;
          color: #030712 !important;
          font-weight: 700 !important;
          box-shadow: ${darkMode ? "0 4px 20px rgba(182, 255, 42, 0.3)" : "0 4px 15px rgba(0, 230, 118, 0.2)"} !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          text-transform: none !important;
          border-radius: 50px !important;
        }

        .pill-register-btn:hover {
          box-shadow: ${darkMode ? "0 8px 30px rgba(182, 255, 42, 0.5)" : "0 6px 20px rgba(0, 230, 118, 0.35)"} !important;
          transform: translateY(-2px) scale(1.02) !important;
        }

        /* Modal/Drawer styling */
        .drawer-content-box blockquote {
          border-left: 4px solid #B6FF2A;
          padding-left: 16px;
          margin: 24px 0;
          font-style: italic;
          color: ${darkMode ? "rgba(255,255,255,0.85)" : "rgba(15,23,42,0.85)"};
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
        }
        .drawer-content-box h4 {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          margin-top: 28px;
          margin-bottom: 12px;
          color: ${textThemeColor};
        }
        .drawer-content-box p {
          line-height: 1.8;
          margin-bottom: 18px;
          color: ${textMutedThemeColor};
          font-size: 1.02rem;
        }
      `}</style>

        {/* Floating backdrop blur elements */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            background: blurOverlay1,
            top: "-100px",
            left: "-100px",
            zIndex: 0,
            pointerEvents: "none"
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "700px",
            height: "700px",
            background: blurOverlay2,
            bottom: "10%",
            right: "-150px",
            zIndex: 0,
            pointerEvents: "none"
          }}
        />

        <Box sx={{ container: true, maxWidth: "1200px", mx: "auto", px: { xs: 2.5, md: 4 }, position: "relative", zIndex: 1 }}>

          {/* HERO SECTION */}
          <Box sx={{ textAlign: "center", mb: 6, mt: 2 }}>
            <Box className="d-flex align-items-center gap-2 justify-content-center mb-3">
              <AutoAwesome sx={{ color: "#B6FF2A", fontSize: "1.3rem" }} />
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "2.5px",
                  fontWeight: 800,
                  color: "#00E676",
                  fontSize: "0.78rem"
                }}
              >
                Ekodex Design Insights
              </Typography>
            </Box>
            <Typography
              variant="h2"
              className="premium-font"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2.2rem", md: "3.5rem" },
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                mb: 2.5
              }}
            >
              Stay Ahead with{" "}
              <span
                className="text-glow-neon"
                style={{
                  background: "linear-gradient(90deg, #B6FF2A 0%, #00E676 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                AI Staging
              </span>
            </Typography>
            <Typography
              className="body-font"
              sx={{
                maxWidth: "600px",
                mx: "auto",
                fontSize: "1.05rem",
                lineHeight: 1.7,
                color: textMutedThemeColor,
                mb: 3
              }}
            >
              Insights, tutorials, and trend analyses exploring product photography,
              AI fashion modeling, and high-conversion e-commerce visuals.
            </Typography>

            {/* Admin "Add Post" Button */}
            {isManager && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                className="pill-register-btn"
                sx={{
                  px: 4.5,
                  py: 1.2,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.95rem"
                }}
              >
                Add New Article
              </Button>
            )}
          </Box>

          {/* SEARCH AND FILTERS */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 3,
              mb: 6,
              p: 1.5,
              borderRadius: "20px",
              backgroundColor: cardBgColor,
              border: `1px solid ${cardBorderColor}`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)"
            }}
          >
            {/* Categories */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, width: { xs: "100%", md: "auto" } }}>
              {dynamicCategories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    px: 1,
                    py: 2,
                    borderRadius: "50px",
                    cursor: "pointer",
                    bgcolor: selectedCategory === cat
                      ? (darkMode ? "rgba(182, 255, 42, 0.15)" : "rgba(0, 230, 118, 0.15)")
                      : "transparent",
                    color: selectedCategory === cat
                      ? (darkMode ? "#B6FF2A" : "#00C853")
                      : textMutedThemeColor,
                    border: `1px solid ${selectedCategory === cat
                      ? (darkMode ? "rgba(182, 255, 42, 0.35)" : "rgba(0, 230, 118, 0.35)")
                      : "transparent"}`,
                    transition: "all 0.25s ease",
                    "&:hover": {
                      bgcolor: darkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.04)",
                      color: textThemeColor
                    }
                  }}
                />
              ))}
            </Box>

            {/* Search bar */}
            <TextField
              placeholder="Search articles..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: { xs: "100%", md: "300px" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "50px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.88rem",
                  color: textThemeColor,
                  bgcolor: darkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.4)",
                  "& fieldset": {
                    borderColor: cardBorderColor,
                  },
                  "&:hover fieldset": {
                    borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(15, 23, 42, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: darkMode ? "#B6FF2A" : "#00E676",
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: textMutedThemeColor, fontSize: "1.15rem" }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* LOADING INDICATOR */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: darkMode ? "#B6FF2A" : "#00E676" }} />
            </Box>
          ) : (
            <>
              {/* FEATURED POST */}
              {selectedCategory === "All" && !searchTerm && featuredPost && (
                <Box sx={{ mb: 7 }}>
                  <Typography variant="h5" className="premium-font" sx={{ fontWeight: 800, mb: 3, opacity: 0.9 }}>
                    Featured Story
                  </Typography>
                  <Card
                    onClick={() => setActiveArticle(featuredPost)}
                    className="hover-translate-y"
                    sx={{
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: { xs: "column", lg: "row" },
                      borderRadius: "28px",
                      border: `1px solid ${cardBorderColor}`,
                      bgcolor: cardBgColor,
                      backdropFilter: "blur(15px)",
                      WebkitBackdropFilter: "blur(15px)",
                      overflow: "hidden",
                      position: "relative"
                    }}
                  >
                    {/* Image Box */}
                    <Box sx={{ width: { xs: "100%", lg: "55%" }, height: { xs: "250px", sm: "350px", lg: "auto" }, position: "relative" }}>
                      <img
                        src={getImageSrc(featuredPost.image)}
                        alt={featuredPost.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "20px",
                          left: "20px",
                          bgcolor: "rgba(3,7,18,0.85)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "50px",
                          px: 2,
                          py: 0.6,
                          display: "flex",
                          alignItems: "center",
                          gap: 1
                        }}
                      >
                        <Diamond sx={{ color: "#B6FF2A", fontSize: "14px" }} />
                        <Typography variant="caption" sx={{ color: "#ffffff", fontWeight: 700, letterSpacing: "1px" }}>
                          {featuredPost.category}
                        </Typography>
                      </Box>

                      {/* Admin Action Badges on Card */}
                      {isManager && (
                        <Box sx={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: 1, zIndex: 10 }}>
                          <IconButton
                            onClick={(e) => handleEditClick(e, featuredPost)}
                            sx={{
                              bgcolor: "rgba(3,7,18,0.85)",
                              color: "#B6FF2A",
                              border: "1px solid rgba(255,255,255,0.1)",
                              "&:hover": { bgcolor: "rgba(3,7,18,0.95)" }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={(e) => handleDeleteClick(e, featuredPost._id || featuredPost.id, featuredPost.title)}
                            sx={{
                              bgcolor: "rgba(3,7,18,0.85)",
                              color: "#ef4444",
                              border: "1px solid rgba(255,255,255,0.1)",
                              "&:hover": { bgcolor: "rgba(3,7,18,0.95)" }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    {/* Text Box */}
                    <Box sx={{ p: { xs: 4, md: 5 }, width: { xs: "100%", lg: "45%" }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, color: textMutedThemeColor, fontSize: "0.82rem" }}>
                        <Box className="d-flex align-items-center gap-1">
                          <CalendarTodayIcon sx={{ fontSize: "14px" }} />
                          <span className="body-font">{featuredPost.date}</span>
                        </Box>
                        <span>•</span>
                        <Box className="d-flex align-items-center gap-1">
                          <AccessTimeIcon sx={{ fontSize: "14px" }} />
                          <span className="body-font">{featuredPost.readTime}</span>
                        </Box>
                      </Box>

                      <Typography
                        variant="h3"
                        className="premium-font"
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: "1.5rem", md: "2.1rem" },
                          letterSpacing: "-0.02em",
                          lineHeight: 1.2,
                          mb: 2,
                          transition: "color 0.2s ease",
                          "&:hover": {
                            color: darkMode ? "#B6FF2A" : "#00C853"
                          }
                        }}
                      >
                        {featuredPost.title}
                      </Typography>

                      <Typography
                        className="body-font"
                        sx={{
                          color: textMutedThemeColor,
                          fontSize: "0.98rem",
                          lineHeight: 1.6,
                          mb: 4
                        }}
                      >
                        {featuredPost.excerpt}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
                        <Box className="d-flex align-items-center gap-3">
                          <Avatar
                            src={getImageSrc(featuredPost.authorAvatar, "/image/clay_avatar.png")}
                            alt={featuredPost.author}
                            sx={{ width: 38, height: 38 }}
                          />
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }} className="premium-font">
                              {featuredPost.author}
                            </Typography>
                            <Typography sx={{ color: textMutedThemeColor, fontSize: "0.75rem" }} className="body-font">
                              {featuredPost.authorRole}
                            </Typography>
                          </Box>
                        </Box>

                        <Button
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            textTransform: "none",
                            color: darkMode ? "#B6FF2A" : "#00C853",
                            fontWeight: 700,
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "0.95rem",
                            p: 0,
                            "& .MuiButton-endIcon": {
                              transition: "transform 0.2s ease"
                            },
                            "&:hover": {
                              bgcolor: "transparent",
                              "& .MuiButton-endIcon": {
                                transform: "translateX(4px)"
                              }
                            }
                          }}
                        >
                          Read Story
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              )}

              {/* ARTICLES GRID */}
              <Typography variant="h5" className="premium-font" sx={{ fontWeight: 800, mb: 3, opacity: 0.9 }}>
                {searchTerm || selectedCategory !== "All" ? "Search Results" : "Latest Articles"}
              </Typography>

              {filteredPosts.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8, bgcolor: cardBgColor, border: `1px solid ${cardBorderColor}`, borderRadius: "24px", backdropFilter: "blur(10px)" }}>
                  <Typography variant="h6" className="premium-font" sx={{ fontWeight: 600, color: textMutedThemeColor, mb: 1 }}>
                    No articles found
                  </Typography>
                  <Typography variant="body2" sx={{ color: textMutedThemeColor }}>
                    Try searching with another phrase or changing the selected category.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={4}>
                  {regularPosts.map((post) => (
                    <Grid item xs={12} md={6} lg={4} key={post._id || post.id}>
                      <Card
                        onClick={() => setActiveArticle(post)}
                        className="hover-translate-y"
                        sx={{
                          cursor: "pointer",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: "24px",
                          border: `1px solid ${cardBorderColor}`,
                          bgcolor: cardBgColor,
                          backdropFilter: "blur(15px)",
                          WebkitBackdropFilter: "blur(15px)",
                          overflow: "hidden",
                          position: "relative"
                        }}
                      >
                        {/* Card Image */}
                        <Box sx={{ height: "200px", position: "relative", overflow: "hidden" }}>
                          <img
                            src={getImageSrc(post.image)}
                            alt={post.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <Chip
                            label={post.category}
                            size="small"
                            sx={{
                              position: "absolute",
                              top: "16px",
                              left: "16px",
                              fontFamily: "'Outfit', sans-serif",
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              bgcolor: "rgba(3,7,18,0.85)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "#ffffff"
                            }}
                          />

                          {/* Admin Action Badges on Card */}
                          {isManager && (
                            <Box sx={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: 0.8, zIndex: 10 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => handleEditClick(e, post)}
                                sx={{
                                  bgcolor: "rgba(3,7,18,0.85)",
                                  color: "#B6FF2A",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  "&:hover": { bgcolor: "rgba(3,7,18,0.95)" }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => handleDeleteClick(e, post._id || post.id, post.title)}
                                sx={{
                                  bgcolor: "rgba(3,7,18,0.85)",
                                  color: "#ef4444",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  "&:hover": { bgcolor: "rgba(3,7,18,0.95)" }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>

                        {/* Card Content */}
                        <Box sx={{ p: 3, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, color: textMutedThemeColor, fontSize: "0.78rem" }}>
                            <Box className="d-flex align-items-center gap-1">
                              <CalendarTodayIcon sx={{ fontSize: "12px" }} />
                              <span className="body-font">{post.date}</span>
                            </Box>
                            <span>•</span>
                            <Box className="d-flex align-items-center gap-1">
                              <AccessTimeIcon sx={{ fontSize: "12px" }} />
                              <span className="body-font">{post.readTime}</span>
                            </Box>
                          </Box>

                          <Typography
                            variant="h6"
                            className="premium-font"
                            sx={{
                              fontWeight: 700,
                              fontSize: "1.15rem",
                              lineHeight: 1.3,
                              mb: 1.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden"
                            }}
                          >
                            {post.title}
                          </Typography>

                          <Typography
                            className="body-font"
                            sx={{
                              color: textMutedThemeColor,
                              fontSize: "0.88rem",
                              lineHeight: 1.5,
                              mb: 3,
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden"
                            }}
                          >
                            {post.excerpt}
                          </Typography>

                          {/* Bottom row */}
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 1.5, borderTop: `1px solid ${darkMode ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)"}` }}>
                            <Box className="d-flex align-items-center gap-2">
                              <Avatar
                                src={getImageSrc(post.authorAvatar, "/image/clay_avatar.png")}
                                alt={post.author}
                                sx={{ width: 28, height: 28 }}
                              />
                              <Typography sx={{ fontWeight: 600, fontSize: "0.78rem" }} className="premium-font">
                                {post.author}
                              </Typography>
                            </Box>

                            <Button
                              endIcon={<ArrowForwardIcon sx={{ fontSize: "14px !important" }} />}
                              sx={{
                                textTransform: "none",
                                color: darkMode ? "#B6FF2A" : "#00C853",
                                fontWeight: 700,
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: "0.82rem",
                                p: 0,
                                minWidth: 0,
                                "& .MuiButton-endIcon": {
                                  transition: "transform 0.2s ease"
                                },
                                "&:hover": {
                                  bgcolor: "transparent",
                                  "& .MuiButton-endIcon": {
                                    transform: "translateX(3px)"
                                  }
                                }
                              }}
                            >
                              Read
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* NEWSLETTER SECTION */}
          <Box
            sx={{
              mt: 10,
              p: { xs: 4, md: 6 },
              borderRadius: "28px",
              border: `1px solid ${cardBorderColor}`,
              bgcolor: cardBgColor,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Subtle design element */}
            <div
              style={{
                position: "absolute",
                top: "-50px",
                left: "-50px",
                width: "150px",
                height: "150px",
                background: "radial-gradient(circle, rgba(182,255,42,0.08) 0%, transparent 70%)",
                pointerEvents: "none"
              }}
            />

            <Typography
              variant="h4"
              className="premium-font"
              sx={{ fontWeight: 800, mb: 1.5, letterSpacing: "-0.01em" }}
            >
              Subscribe to Ekodex Insights
            </Typography>
            <Typography
              className="body-font"
              sx={{
                maxWidth: "500px",
                mx: "auto",
                color: textMutedThemeColor,
                fontSize: "0.95rem",
                lineHeight: 1.6,
                mb: 4
              }}
            >
              Get the latest updates on AI photo staging techniques, design templates, and platform features sent directly to your inbox.
            </Typography>

            <form onSubmit={handleNewsletterSubmit} style={{ maxWidth: "480px", margin: "0 auto" }}>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
                <TextField
                  required
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  sx={{
                    flexGrow: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "50px",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      bgcolor: darkMode ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.5)",
                      color: textThemeColor,
                      px: 1.5,
                      "& fieldset": {
                        borderColor: cardBorderColor,
                      },
                      "&:hover fieldset": {
                        borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(15, 23, 42, 0.2)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: darkMode ? "#B6FF2A" : "#00E676",
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  className="pill-register-btn"
                  sx={{
                    px: 4,
                    py: { xs: 1.5, sm: 0 },
                    height: "46px",
                    fontSize: "0.9rem"
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            </form>
          </Box>
        </Box>

        {/* ARTICLE PREVIEW DRAWER */}
        <Drawer
          anchor="right"
          open={activeArticle !== null}
          onClose={() => setActiveArticle(null)}
          PaperProps={{
            sx: {
              width: { xs: "100%", md: "600px", lg: "700px" },
              bgcolor: darkMode ? "#0b1120" : "#ffffff",
              borderLeft: `1px solid ${cardBorderColor}`,
              p: 0,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-10px 0 40px rgba(0,0,0,0.2)"
            }
          }}
        >
          {activeArticle && (
            <Box className="drawer-content-box" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>

              {/* Drawer Image Header */}
              <Box sx={{ position: "relative", height: { xs: "250px", md: "380px" }, width: "100%" }}>
                <img
                  src={getImageSrc(activeArticle.image)}
                  alt={activeArticle.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                {/* Blur gradient overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: darkMode
                      ? "linear-gradient(to bottom, rgba(11, 17, 32, 0.4) 0%, rgba(11, 17, 32, 0.95) 100%)"
                      : "linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.98) 100%)"
                  }}
                />

                {/* Close Button */}
                <IconButton
                  onClick={() => setActiveArticle(null)}
                  sx={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    bgcolor: "rgba(3, 7, 18, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    "&:hover": {
                      bgcolor: "rgba(3, 7, 18, 0.95)",
                      transform: "rotate(90deg)"
                    },
                    transition: "all 0.3s ease",
                    zIndex: 10
                  }}
                >
                  <CloseIcon />
                </IconButton>

                {/* Heading elements inside image base */}
                <Box sx={{ position: "absolute", bottom: 0, left: 0, w: "100%", p: 4, pr: 5, zIndex: 2 }}>
                  <Chip
                    label={activeArticle.category}
                    size="small"
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 800,
                      bgcolor: darkMode ? "rgba(182, 255, 42, 0.15)" : "rgba(0, 230, 118, 0.15)",
                      color: darkMode ? "#B6FF2A" : "#00C853",
                      border: `1px solid ${darkMode ? "rgba(182, 255, 42, 0.3)" : "rgba(0, 230, 118, 0.3)"}`,
                      mb: 2
                    }}
                  />
                  <Typography
                    variant="h4"
                    className="premium-font"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "1.6rem", md: "2.2rem" },
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                      color: textThemeColor
                    }}
                  >
                    {activeArticle.title}
                  </Typography>
                </Box>
              </Box>

              {/* Drawer Article Body */}
              <Box sx={{ p: 4, pt: 2, flexGrow: 1 }}>

                {/* Meta details bar */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 4,
                    pb: 3,
                    borderBottom: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}`
                  }}
                >
                  {/* Author Info */}
                  <Box className="d-flex align-items-center gap-3">
                    <Avatar
                      src={getImageSrc(activeArticle.authorAvatar, "/image/clay_avatar.png")}
                      alt={activeArticle.author}
                      sx={{ width: 42, height: 42 }}
                    />
                    <Box>
                      <Typography className="premium-font" sx={{ fontWeight: 700, fontSize: "0.92rem", color: textThemeColor }}>
                        {activeArticle.author}
                      </Typography>
                      <Typography className="body-font" sx={{ fontSize: "0.75rem", color: textMutedThemeColor }}>
                        {activeArticle.authorRole}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Date & Read time */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: textMutedThemeColor, fontSize: "0.85rem" }}>
                    <Box className="d-flex align-items-center gap-1">
                      <CalendarTodayIcon sx={{ fontSize: "14px" }} />
                      <span className="body-font">{activeArticle.date}</span>
                    </Box>
                    <Box className="d-flex align-items-center gap-1">
                      <AccessTimeIcon sx={{ fontSize: "14px" }} />
                      <span className="body-font">{activeArticle.readTime}</span>
                    </Box>
                  </Box>
                </Box>

                {/* Rich-text content */}
                <Box
                  className="body-font"
                  dangerouslySetInnerHTML={{ __html: activeArticle.content }}
                  sx={{ color: textThemeColor }}
                />

                {/* Footer inside drawer */}
                <Box
                  sx={{
                    mt: 6,
                    pt: 3,
                    borderTop: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Typography variant="body2" className="body-font" sx={{ color: textMutedThemeColor }}>
                    Share this article:
                  </Typography>
                  <Box className="d-flex gap-2">
                    {["Twitter", "LinkedIn", "Facebook"].map((network) => (
                      <Button
                        key={network}
                        size="small"
                        sx={{
                          textTransform: "none",
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          color: textMutedThemeColor,
                          "&:hover": {
                            color: darkMode ? "#B6FF2A" : "#00C853",
                            bgcolor: "transparent"
                          }
                        }}
                        onClick={() => {
                          setToast({
                            open: true,
                            message: `Copied share link for ${network}!`,
                            severity: "success"
                          });
                        }}
                      >
                        {network}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Drawer>

        {/* DYNAMIC FORM MODAL - FLOW WIDTH RESPONSIVE DESIGN */}
        <Dialog
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          maxWidth="md"
          fullWidth
          disableScrollLock
          PaperProps={{
            sx: {
              borderRadius: "24px",
              bgcolor: darkMode ? "#0b1120" : "#ffffff",
              border: `1px solid ${cardBorderColor}`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              p: 1.5
            }
          }}
        >
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.45rem", color: textThemeColor }}>
            {editingPost ? "Modify Dynamic Article Details" : "Publish a Fresh Insight Article"}
          </DialogTitle>
          <DialogContent>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3.5, fontFamily: "'Inter', sans-serif" }}>
              This editor formats your story dynamically. Use client-friendly values to explain your ideas.
            </Typography>

            <Grid container spacing={3}>
              {/* ARTICLE TITLE - Full Width Flow */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: darkMode ? '#8a99ad' : '#475569', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>
                  What is the title of your article? (Article Title) *
                </Typography>
                <TextField
                  required
                  fullWidth
                  size="small"
                  placeholder="e.g., The Future of AI in Jewelry Photography"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", color: textThemeColor } }}
                />
              </Grid>

              {/* ARTICLE EXCERPT - Full Width Flow */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: darkMode ? '#8a99ad' : '#475569', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>
                  Short Summary / Catchy Intro (Shown on the listing card) *
                </Typography>
                <TextField
                  required
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="e.g., Discover how generative AI models capture macro gold reflections..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", color: textThemeColor } }}
                />
              </Grid>

              {/* AUTHOR NAME - Proportional Split Width (xs=12, sm=6) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: darkMode ? '#8a99ad' : '#475569', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>
                  Who is the Author of this article? (Author Name) *
                </Typography>
                <TextField
                  required
                  fullWidth
                  size="small"
                  placeholder="e.g., Elena Rostova"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", color: textThemeColor } }}
                />
              </Grid>

              {/* AUTHOR ROLE - Proportional Split Width (xs=12, sm=6) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: darkMode ? '#8a99ad' : '#475569', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>
                  What is the Author's Professional Title / Role?
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g., Lead Jewelry Designer"
                  value={formData.authorRole}
                  onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", color: textThemeColor } }}
                />
              </Grid>

              {/* CATEGORY TEXTFIELD - Proportional Split Width (xs=12, sm=6) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: darkMode ? '#8a99ad' : '#475569', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>
                  Category Tag / Topic Name *
                </Typography>
                <TextField
                  required
                  fullWidth
                  size="small"
                  placeholder="e.g., Jewelry Studio, AI Staging, or create your own!"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", color: textThemeColor } }}
                />
              </Grid>

              {/* READ TIME - Proportional Split Width (xs=12, sm=6) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: darkMode ? '#8a99ad' : '#475569', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>
                  Estimated Read Time
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g., 5 min read"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", color: textThemeColor } }}
                />
              </Grid>

              {/* COVER IMAGE FILE UPLOADER - Proportional Split Width (xs=12, sm=6) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: darkMode ? '#8a99ad' : '#475569', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>
                  Upload Article Cover Photo *
                </Typography>
                <Box
                  onClick={() => !imageUploading && fileInputRef.current.click()}
                  sx={{
                    border: `2px dashed ${cardBorderColor}`,
                    borderRadius: "16px",
                    p: 3,
                    textAlign: "center",
                    cursor: imageUploading ? "default" : "pointer",
                    bgcolor: darkMode ? "rgba(0,0,0,0.15)" : "rgba(15,23,42,0.02)",
                    "&:hover": { borderColor: imageUploading ? cardBorderColor : (darkMode ? "#B6FF2A" : "#00E676") },
                    transition: "border-color 0.25s ease",
                    height: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  {imageUploading ? (
                    <Box sx={{ py: 1 }}>
                      <CircularProgress size={24} sx={{ mb: 1, color: darkMode ? "#B6FF2A" : "#00E676" }} />
                      <Typography variant="body2" color="text.secondary">Saving cover photo to disk...</Typography>
                    </Box>
                  ) : formData.image ? (
                    <Box>
                      <img
                        src={getImageSrc(formData.image)}
                        alt="Cover Preview"
                        style={{ maxHeight: "110px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
                        Cover image set! Click to replace.
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <AutoAwesome sx={{ fontSize: 32, mb: 1, color: darkMode ? "#B6FF2A" : "#00E676" }} />
                      <Typography variant="body2" sx={{ color: textThemeColor, fontWeight: 600 }}>
                        Drop cover photo or click
                      </Typography>
                      <Typography variant="caption" sx={{ color: textMutedThemeColor, mt: 0.5, display: "block" }}>
                        Supports PNG, JPG, WebP.
                      </Typography>
                    </Box>
                  )}
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Grid>

              {/* AUTHOR PROFILE PHOTO UPLOADER - Proportional Split Width (xs=12, sm=6) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: darkMode ? '#8a99ad' : '#475569', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>
                  Upload Author's Profile Photo
                </Typography>
                <Box
                  onClick={() => !avatarUploading && avatarInputRef.current.click()}
                  sx={{
                    border: `2px dashed ${cardBorderColor}`,
                    borderRadius: "16px",
                    p: 3,
                    textAlign: "center",
                    cursor: avatarUploading ? "default" : "pointer",
                    bgcolor: darkMode ? "rgba(0,0,0,0.15)" : "rgba(15,23,42,0.02)",
                    "&:hover": { borderColor: avatarUploading ? cardBorderColor : (darkMode ? "#B6FF2A" : "#00E676") },
                    transition: "border-color 0.25s ease",
                    height: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  {avatarUploading ? (
                    <Box sx={{ py: 1 }}>
                      <CircularProgress size={24} sx={{ mb: 1, color: darkMode ? "#B6FF2A" : "#00E676" }} />
                      <Typography variant="body2" color="text.secondary">Saving profile photo to disk...</Typography>
                    </Box>
                  ) : formData.authorAvatar ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Avatar
                        src={getImageSrc(formData.authorAvatar, "/image/clay_avatar.png")}
                        alt="Avatar Preview"
                        sx={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid ${darkMode ? '#B6FF2A' : '#00E676'}` }}
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1.5, color: "text.secondary" }}>
                        Profile photo set! Click to replace.
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Avatar sx={{ width: 48, height: 48, mx: "auto", mb: 1, bgcolor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)", color: darkMode ? "#B6FF2A" : "#00E676" }}>
                        <AutoAwesome />
                      </Avatar>
                      <Typography variant="body2" sx={{ color: textThemeColor, fontWeight: 600 }}>
                        Drop profile photo or click
                      </Typography>
                      <Typography variant="caption" sx={{ color: textMutedThemeColor, mt: 0.5, display: "block" }}>
                        Supports square formats for best look.
                      </Typography>
                    </Box>
                  )}
                </Box>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                />
              </Grid>

              {/* ARTICLE CONTENT - Full Width Flow */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: darkMode ? '#8a99ad' : '#475569', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>
                  Main Story Details (Rich HTML formatting like &lt;p&gt;, &lt;h4&gt;, &lt;blockquote&gt; is allowed) *
                </Typography>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={8}
                  placeholder="e.g., <p>Write your beautiful jewelry story details here...</p>"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", color: textThemeColor } }}
                />
              </Grid>

              {/* FEATURED SWITCH - Full Width Flow */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      sx={{ color: darkMode ? "rgba(255,255,255,0.3)" : "rgba(15,23,42,0.3)", "&.Mui-checked": { color: darkMode ? "#B6FF2A" : "#00E676" } }}
                    />
                  }
                  label="Set as Featured Article (Highlight this post prominently at the top)"
                  sx={{ "& .MuiFormControlLabel-label": { fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: textMutedThemeColor } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setEditorOpen(false)}
              sx={{
                borderRadius: "50px",
                fontFamily: "'Outfit', sans-serif",
                textTransform: "none",
                fontWeight: 700,
                px: 3.5,
                color: textThemeColor,
                borderColor: cardBorderColor,
                "&:hover": { borderColor: textThemeColor }
              }}
            >
              Discard
            </Button>
            <Button
              variant="contained"
              onClick={handleSavePost}
              className="pill-register-btn"
              sx={{
                px: 4.5,
                py: 1,
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              Publish Live
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Alert Feedback */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToast({ ...toast, open: false })}
            severity={toast.severity}
            sx={{ width: "100%", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>

      {!isAdminView && <Footer />}
    </>
  );
};

export default Blog;
