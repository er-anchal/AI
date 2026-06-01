import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Card, TextField, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import Diamond from "@mui/icons-material/Diamond";
import Layers from "@mui/icons-material/Layers";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Speed from "@mui/icons-material/Speed";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import WbSunny from "@mui/icons-material/WbSunny";
import Bedtime from "@mui/icons-material/Bedtime";
import SearchIcon from "@mui/icons-material/Search";
import TemplateIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Categories from "../components/Categories";
import EkodexLogoImg from "../assets/images/EkodexLogo.jpg";

// EKODEX Logo Component
const EkodexLogo = ({ isDark }) => (
  <div className="d-flex align-items-center text-decoration-none" style={{ cursor: "pointer" }}>
    <img
      src={EkodexLogoImg}
      alt="Ekodex Logo"
      style={{
        height: "36px",
        borderRadius: "8px",
        boxShadow: isDark ? "0 0 15px rgba(255, 255, 255, 0.05)" : "0 0 10px rgba(0, 0, 0, 0.05)"
      }}
    />
  </div>
);

const Home = () => {
  const { token, logout, user } = useAuth();
  const isLoggedIn = !!token;
  const navigate = useNavigate();
  const { darkMode, toggleTheme, bgColor, cardColor, textColor, borderColor } = useThemeContext();

  // EKODEX Landing Page states
  const [activeSlide, setActiveSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rawView, setRawView] = useState(false); // before-after toggle

  // MERN template library states
  const [searchResults, setSearchResults] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSearch = async (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await axios.get(
        `${API_URL}/search?q=${encodeURIComponent(value)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const formattedResults = {
        subcategories: res.data.subcategories || res.data.categories || [],
        templates: res.data.templates || [],
      };
      setSearchResults(formattedResults);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({
        subcategories: [],
        templates: [],
      });
    }
  };

  // Theme-aware tokens for landing page:
  const bgThemeColor = darkMode ? "#030712" : "#f8fafc";
  const textThemeColor = darkMode ? "#ffffff" : "#0f172a";
  const textMutedThemeColor = darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(15, 23, 42, 0.6)";
  const navBgColor = darkMode ? "rgba(3, 7, 18, 0.75)" : "rgba(248, 250, 252, 0.85)";
  const navBorderColor = darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)";
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

  const slides = [
    {
      image: "/image/ekodex_jewelry.png",
      tag: "Jewellery",
      title: "Ekodex Luxury Necklaces",
      desc: "Studio-quality macro staging for jewellery renders"
    },
    {
      image: "/image/ekodex_model.png",
      tag: "Fashion",
      title: "Premium Knits Lookbook",
      desc: "Hyperrealistic model placement on demand"
    }
  ];

  // Carousel slide timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic Redirection when logged in to prevent seeing templates page on / (homepage)
  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === "SUPER ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isLoggedIn, user, navigate]);

  if (isLoggedIn) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: bgColor,
          color: textColor,
        }}
      >
        <Typography variant="h6" className="premium-font" fontWeight={600}>
          Redirecting to dashboard...
        </Typography>
      </Box>
    );
  }

  if (!isLoggedIn) {
    return (
      <Box
        sx={{
          backgroundColor: bgThemeColor,
          color: textThemeColor,
          fontFamily: "'Inter', sans-serif",
          overflowX: "hidden",
          minHeight: "100vh",
          position: "relative",
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

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          .floating-element {
            animation: float 6s ease-in-out infinite;
          }

          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }

          .marquee-inner {
            display: flex;
            animation: marquee 30s linear infinite;
            white-space: nowrap;
          }

          .glass-navbar {
            background: ${navBgColor} !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
            border-bottom: 1px solid ${navBorderColor} !important;
            transition: all 0.3s ease !important;
          }

          .hover-nav-link {
            position: relative;
            color: ${darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(15, 23, 42, 0.6)"} !important;
            transition: color 0.25s ease !important;
            font-weight: 500 !important;
          }

          .hover-nav-link:hover {
            color: ${darkMode ? "#ffffff" : "#0f172a"} !important;
          }

          .hover-nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -4px;
            left: 50%;
            background: linear-gradient(90deg, #B6FF2A 0%, #00E676 100%);
            transition: all 0.25s ease;
            transform: translateX(-50%);
          }

          .hover-nav-link:hover::after {
            width: 80%;
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

          .outlined-login-btn {
            border: 1px solid ${darkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 23, 42, 0.15)"} !important;
            color: ${darkMode ? "#e5e7eb" : "#0f172a"} !important;
            background: transparent !important;
            transition: all 0.3s ease !important;
            text-transform: none !important;
            border-radius: 50px !important;
          }

          .outlined-login-btn:hover {
            background: ${darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.05)"} !important;
            border-color: ${darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(15, 23, 42, 0.3)"} !important;
            transform: translateY(-1px) !important;
          }

          .hover-translate-y {
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }

          .hover-translate-y:hover {
            transform: translateY(-8px) scale(1.01) !important;
            border-color: ${darkMode ? "rgba(182, 255, 42, 0.25)" : "rgba(0, 230, 118, 0.25)"} !important;
            box-shadow: ${darkMode ? "0 20px 40px rgba(0, 0, 0, 0.4)" : "0 15px 30px rgba(15, 23, 42, 0.05)"} !important;
          }
        `}</style>

        {/* Floating background gradient blurs */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            background: blurOverlay1,
            top: "-150px",
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
            bottom: "20%",
            right: "-150px",
            zIndex: 0,
            pointerEvents: "none"
          }}
        />

        {/* Global Navbar.jsx is rendered via PublicLayout on all public routes */}

        {/* --- HERO SECTION --- */}
        <section className="position-relative py-5 py-lg-6" style={{ zIndex: 1 }}>
          <div className="container">
            <div className="row align-items-center min-vh-75 py-4">

              {/* Left Side Content */}
              <div className="col-12 col-lg-6 pr-lg-5 mb-5 mb-lg-0 text-center text-lg-start">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Category Pills */}
                  <div className="d-flex align-items-center gap-2 justify-content-center justify-content-lg-start mb-4">
                    <div
                      className="d-flex align-items-center px-3 py-1.5"
                      style={{
                        backgroundColor: "rgba(182, 255, 42, 0.08)",
                        border: "1px solid rgba(182, 255, 42, 0.3)",
                        borderRadius: "50px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "#00E676"
                      }}
                    >
                      <Diamond sx={{ fontSize: "14px", marginRight: "6px" }} />
                      Jewellery
                    </div>
                    <span style={{ color: textMutedThemeColor }}>+</span>
                    <div
                      className="d-flex align-items-center px-3 py-1.5"
                      style={{
                        backgroundColor: darkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.04)",
                        border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)"}`,
                        borderRadius: "50px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: textThemeColor
                      }}
                    >
                      <Layers sx={{ fontSize: "14px", marginRight: "6px" }} />
                      Fashion
                    </div>
                  </div>

                  {/* Main Title */}
                  <h1
                    className="premium-font fw-extrabold mb-4"
                    style={{
                      fontSize: "calc(1.8rem + 2.5vw)",
                      lineHeight: "1.1",
                      letterSpacing: "-0.03em",
                      fontWeight: 900,
                      color: textThemeColor
                    }}
                  >
                    AI Product Photography for{" "}
                    <span
                      className="text-glow-neon"
                      style={{
                        background: "linear-gradient(90deg, #B6FF2A 0%, #00E676 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}
                    >
                      Fashion
                    </span>{" "}
                    and{" "}
                    <span
                      className="text-glow-neon"
                      style={{
                        background: "linear-gradient(90deg, #B6FF2A 0%, #00E676 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}
                    >
                      Jewellery
                    </span>
                  </h1>

                  {/* Subtext */}
                  <p
                    className="body-font lead mb-5"
                    style={{
                      fontSize: "1.12rem",
                      lineHeight: "1.8",
                      maxWidth: "520px",
                      color: textMutedThemeColor
                    }}
                  >
                    Create product photos, AI model images, and lookbooks without booking a studio — for fashion brands and jewellery businesses.
                  </p>

                  {/* CTA Buttons */}
                  <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-lg-start gap-3">
                    <Button
                      onClick={() => navigate("/register")}
                      className="pill-register-btn"
                      sx={{
                        fontSize: "1rem",
                        px: 5,
                        py: 1.8,
                        width: { xs: "100%", sm: "auto" }
                      }}
                    >
                      Start Creating Now
                    </Button>
                    <Button
                      onClick={() => navigate("/register")}
                      className="outlined-login-btn"
                      sx={{
                        fontSize: "1rem",
                        px: 5,
                        py: 1.8,
                        width: { xs: "100%", sm: "auto" }
                      }}
                    >
                      Get Pricing
                    </Button>
                  </div>
                </motion.div>
              </div>
              {/* Right Side Showcase */}
              <div className="col-12 col-lg-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                  className="position-relative"
                >
                  {/* Backdrop glowing border ring */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10%",
                      left: "10%",
                      width: "80%",
                      height: "80%",
                      border: darkMode ? "2px solid rgba(182, 255, 42, 0.15)" : "2px solid rgba(0, 230, 118, 0.12)",
                      borderRadius: "32px",
                      filter: "blur(8px)",
                      zIndex: -1
                    }}
                  />

                  {/* Image showcase frame */}
                  <div
                    className="overflow-hidden position-relative mx-auto floating-element"
                    style={{
                      width: "100%",
                      maxWidth: "540px",
                      aspectRatio: "4/5",
                      borderRadius: "32px",
                      border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.12)"}`,
                      boxShadow: darkMode ? "0 25px 60px rgba(0, 0, 0, 0.7)" : "0 20px 45px rgba(15, 23, 42, 0.12)",
                      background: cardBgColor
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-100 h-100 position-relative"
                      >
                        <img
                          src={slides[activeSlide].image}
                          alt={slides[activeSlide].title}
                          className="w-100 h-100 object-fit-cover"
                          style={{
                            display: "block"
                          }}
                        />
                        {/* Cinematic vignette gradient overlay */}
                        <div
                          className="position-absolute inset-0"
                          style={{
                            background: darkMode
                              ? "linear-gradient(to top, rgba(3, 7, 18, 0.95) 0%, rgba(3, 7, 18, 0.2) 30%, transparent 100%)"
                              : "linear-gradient(to top, rgba(248, 250, 252, 0.95) 0%, rgba(248, 250, 252, 0.2) 30%, transparent 100%)",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0
                          }}
                        />

                        {/* Slide tag and details */}
                        <div
                          className="position-absolute bottom-0 left-0 w-100 p-4 d-flex flex-column align-items-start"
                          style={{ zIndex: 5 }}
                        >
                          <div
                            className="px-2.5 py-1 mb-2 rounded fw-bold text-uppercase"
                            style={{
                              fontSize: "0.65rem",
                              letterSpacing: "1px",
                              backgroundColor: slides[activeSlide].tag === "Jewellery"
                                ? (darkMode ? "rgba(182, 255, 42, 0.15)" : "rgba(0, 230, 118, 0.15)")
                                : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(15, 23, 42, 0.08)"),
                              color: slides[activeSlide].tag === "Jewellery"
                                ? (darkMode ? "#B6FF2A" : "#00C853")
                                : textThemeColor,
                              border: slides[activeSlide].tag === "Jewellery"
                                ? `1px solid ${darkMode ? "rgba(182, 255, 42, 0.3)" : "rgba(0, 230, 118, 0.3)"}`
                                : `1px solid ${darkMode ? "rgba(255,255,255,0.15)" : "rgba(15, 23, 42, 0.15)"}`
                            }}
                          >
                            {slides[activeSlide].tag} SHOWCASE
                          </div>
                          <h3 className="premium-font fs-4 fw-bold mb-1" style={{ color: textThemeColor }}>{slides[activeSlide].title}</h3>
                          <p className="body-font mb-0" style={{ fontSize: "0.85rem", color: textMutedThemeColor }}>{slides[activeSlide].desc}</p>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Pagination indicators */}
                    <div
                      className="position-absolute d-flex gap-2"
                      style={{
                        top: "24px",
                        right: "24px",
                        zIndex: 10
                      }}
                    >
                      {slides.map((_, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveSlide(idx)}
                          style={{
                            width: idx === activeSlide ? "24px" : "8px",
                            height: "8px",
                            borderRadius: "100px",
                            backgroundColor: idx === activeSlide
                              ? (darkMode ? "#B6FF2A" : "#00E676")
                              : (darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(15, 23, 42, 0.3)"),
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: idx === activeSlide ? `0 0 8px ${darkMode ? "#B6FF2A" : "#00E676"}` : "none"
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* --- INFINITE SCROLLING TEXT --- */}
        <section
          className="w-100 py-3 overflow-hidden"
          style={{
            backgroundColor: darkMode ? "#060913" : "#f1f5f9",
            borderTop: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.04)"}`,
            borderBottom: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.04)"}`
          }}
        >
          <div className="d-flex" style={{ width: "fit-content" }}>
            <style>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .marquee-inner {
              display: flex;
              animation: marquee 25s linear infinite;
              white-space: nowrap;
            }
          `}</style>
            <div className="marquee-inner gap-5">
              {[1, 2].map((loop) => (
                <div
                  className="d-flex align-items-center gap-5 fw-semibold uppercase"
                  style={{
                    fontSize: "0.95rem",
                    color: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(15, 23, 42, 0.5)"
                  }}
                  key={loop}
                >
                  <span>FROM SAREES AND KURTAS TO RINGS AND NECKLACES</span>
                  <span style={{ color: "#B6FF2A" }}>•</span>
                  <span>GENERATE CLEAN REALISTIC PRODUCT PHOTOGRAPHY</span>
                  <span style={{ color: "#00E676" }}>•</span>
                  <span>ZERO STUDIO RENTAL FEES</span>
                  <span style={{ color: "#B6FF2A" }}>•</span>
                  <span>INSTANT DEPLOYMENT ON SOCIALS AND LOOKBOOKS</span>
                  <span style={{ color: "#00E676" }}>•</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- BEFORE / AFTER VIEWFINDER INTERACTIVE SECTION --- */}
        <section className="py-5 py-lg-6 position-relative">
          <div className="container">
            <div className="row text-center mb-5 justify-content-center">
              <div className="col-12 col-md-8">
                <span className="text-uppercase tracking-wider fw-bold" style={{ fontSize: "0.78rem", color: "#B6FF2A" }}>Staging Presets</span>
                <h2 className="display-6 fw-extrabold mt-2" style={{ color: textThemeColor }}>Interactive Viewfinder</h2>
                <p style={{ color: textMutedThemeColor, marginTop: "1rem" }}>
                  Witness raw apparel placements instantly transformed into ready-to-use, high-fidelity model lookbook assets.
                </p>
              </div>
            </div>

            <div className="row align-items-center g-5">
              {/* Left Column: Interactive Image Frame */}
              <div className="col-12 col-lg-6">
                <div
                  className="position-relative overflow-hidden mx-auto"
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    aspectRatio: "4/5",
                    borderRadius: "24px",
                    border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.1)"}`,
                    boxShadow: darkMode ? "0 20px 40px rgba(0,0,0,0.5)" : "0 15px 30px rgba(15, 23, 42, 0.08)"
                  }}
                >
                  {/* Viewfinder Grid overlay */}
                  <div
                    className="position-absolute w-100 h-100 pointer-events-none"
                    style={{
                      border: "1.5px solid rgba(255,255,255,0.06)",
                      top: 0,
                      left: 0,
                      zIndex: 10
                    }}
                  >
                    {/* crosshair center */}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "12px", height: "12px", border: "1px solid rgba(182, 255, 42, 0.4)", borderRadius: "50%" }} />
                    <div style={{ position: "absolute", top: "10%", left: "10%", borderLeft: "2px solid #ffffff", borderTop: "2px solid #ffffff", width: "16px", height: "16px" }} />
                    <div style={{ position: "absolute", top: "10%", right: "10%", borderRight: "2px solid #ffffff", borderTop: "2px solid #ffffff", width: "16px", height: "16px" }} />
                    <div style={{ position: "absolute", bottom: "10%", left: "10%", borderLeft: "2px solid #ffffff", borderBottom: "2px solid #ffffff", width: "16px", height: "16px" }} />
                    <div style={{ position: "absolute", bottom: "10%", right: "10%", borderRight: "2px solid #ffffff", borderBottom: "2px solid #ffffff", width: "16px", height: "16px" }} />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={rawView}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="w-100 h-100"
                    >
                      <img
                        src={rawView ? "/image/clay_avatar.png" : "/image/ekodex_model.png"}
                        alt="interactive demo"
                        className="w-100 h-100 object-fit-cover"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Top banner tag */}
                  <div
                    className="position-absolute d-flex align-items-center gap-1.5 px-3 py-1"
                    style={{
                      top: "16px",
                      left: "16px",
                      backgroundColor: "rgba(3,7,18,0.8)",
                      borderRadius: "100px",
                      zIndex: 10,
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "0.72rem",
                      color: "#ffffff"
                    }}
                  >
                    <div style={{ width: "6px", height: "6px", backgroundColor: rawView ? "#ff3333" : "#00ff33", borderRadius: "50%", marginRight: "6px" }} />
                    {rawView ? "RAW INPUT CAPTURE" : "AI RENDERED STUDIO SHOT"}
                  </div>
                </div>
              </div>

              {/* Right Column: Toggle Controls */}
              <div className="col-12 col-lg-6 text-start">
                <div className="ps-lg-4">
                  <span className="text-uppercase tracking-wider fw-bold" style={{ fontSize: "0.78rem", color: "#00E676" }}>Dynamic Presets</span>
                  <h4 className="fw-bold mt-1.5 mb-3" style={{ color: textThemeColor }}>Compare Renders</h4>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: textMutedThemeColor, marginBottom: "1.8rem" }}>
                    Click the options below to switch between the raw input layout and the high-end studio model generator pipeline.
                  </p>

                  <div className="d-flex flex-column gap-3">
                    {/* Option 1: Raw Staging Frame */}
                    <div
                      onClick={() => setRawView(true)}
                      className="d-flex align-items-center p-3 cursor-pointer transition-all"
                      style={{
                        borderRadius: "12px",
                        border: rawView
                          ? (darkMode ? "1px solid #B6FF2A" : "1px solid #00E676")
                          : `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(15, 23, 42, 0.06)"}`,
                        backgroundColor: rawView
                          ? (darkMode ? "rgba(182, 255, 42, 0.04)" : "rgba(0, 230, 118, 0.04)")
                          : "transparent",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div className="me-3">
                        <PhotoCamera sx={{ color: rawView ? (darkMode ? "#B6FF2A" : "#00E676") : textMutedThemeColor }} />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold" style={{ fontSize: "0.95rem", color: textThemeColor }}>Raw Staging Frame</h6>
                        <span style={{ fontSize: "0.8rem", color: textMutedThemeColor }}>Basic outline on white canvas background</span>
                      </div>
                    </div>

                    {/* Option 2: AI Rendered */}
                    <div
                      onClick={() => setRawView(false)}
                      className="d-flex align-items-center p-3 cursor-pointer transition-all"
                      style={{
                        borderRadius: "12px",
                        border: !rawView
                          ? (darkMode ? "1px solid #B6FF2A" : "1px solid #00E676")
                          : `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(15, 23, 42, 0.06)"}`,
                        backgroundColor: !rawView
                          ? (darkMode ? "rgba(182, 255, 42, 0.04)" : "rgba(0, 230, 118, 0.04)")
                          : "transparent",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div className="me-3">
                        <AutoAwesome sx={{ color: !rawView ? (darkMode ? "#B6FF2A" : "#00E676") : textMutedThemeColor }} />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold" style={{ fontSize: "0.95rem", color: textThemeColor }}>AI Model Production Render</h6>
                        <span style={{ fontSize: "0.8rem", color: textMutedThemeColor }}>Synthesized look with lighting and textures</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PREMIUM FEATURE GRID --- */}
        <section className="py-5 pb-lg-5 pt-lg-4" style={{ backgroundColor: darkMode ? "#040711" : "#f1f5f9", transition: "background-color 0.3s ease" }}>
          <div className="container">
            <div className="row text-center mb-5 justify-content-center">
              <div className="col-12 col-md-8">
                <span className="text-uppercase tracking-wider fw-bold" style={{ fontSize: "0.78rem", color: "#00E676" }}>SaaS Ecosystem</span>
                <h2 className="display-5 fw-extrabold mt-2" style={{ color: textThemeColor }}>Built for Scaling Catalogs</h2>
                <p className="mt-3 fs-5" style={{ color: textMutedThemeColor }}>
                  Generate hyperrealistic assets across lookbooks, online shops, and social media without delay.
                </p>
              </div>
            </div>

            <div className="row g-4">
              {[
                {
                  icon: <Speed sx={{ fontSize: "2rem", color: "#B6FF2A" }} />,
                  title: "Instant Turnaround",
                  desc: "Skip studio scheduling, model recruitment, and photography edits. Deliver production assets in seconds."
                },
                {
                  icon: <AutoAwesome sx={{ fontSize: "2rem", color: "#00E676" }} />,
                  title: "Intelligent Staging",
                  desc: "EKODEX maps shadows, reflections, and surface textures directly into environments automatically."
                },
                {
                  icon: <Diamond sx={{ fontSize: "2rem", color: "#B6FF2A" }} />,
                  title: "Jewellery Rendering",
                  desc: "Advanced WebGL models highlight gold weight, diamond facets, and gemstone Index of Refraction details."
                },
                {
                  icon: <Layers sx={{ fontSize: "2rem", color: "#00E676" }} />,
                  title: "Infinite Aspect Ratios",
                  desc: "Export customized layouts tailored directly to catalog pages, Instagram feeds, and billboards."
                }
              ].map((feat, idx) => (
                <div className="col-12 col-md-6 col-lg-3" key={idx}>
                  <div
                    className="p-4 h-100 transition-all hover-translate-y"
                    style={{
                      backgroundColor: cardBgColor,
                      border: `1px solid ${cardBorderColor}`,
                      borderRadius: "20px"
                    }}
                  >
                    <div className="mb-3">{feat.icon}</div>
                    <h5 className="fw-bold mb-2.5" style={{ color: textThemeColor }}>{feat.title}</h5>
                    <p className="mb-0" style={{ fontSize: "0.88rem", lineHeight: "1.6", color: textMutedThemeColor }}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS STEPS --- */}
        <section className="py-5 py-lg-5" style={{ backgroundColor: bgThemeColor, transition: "background-color 0.3s ease" }}>
          <div className="container">
            <div className="row text-center mb-5 justify-content-center">
              <div className="col-12 col-md-8">
                <span className="text-uppercase tracking-wider fw-bold" style={{ fontSize: "0.78rem", color: "#B6FF2A" }}>Workflow</span>
                <h2 className="display-5 fw-extrabold mt-2" style={{ color: textThemeColor }}>How EKODEX works</h2>
              </div>
            </div>

            <div className="row justify-content-center gap-4 gap-lg-5">
              {[
                { step: "01", title: "Upload Layouts", desc: "Drop your raw product layouts or flat lay photos onto the configurator." },
                { step: "02", title: "Customize Staging", desc: "Choose templates, staging materials, or virtual models representing your brand." },
                { step: "03", title: "Generate & Export", desc: "Click compile to retrieve 4K, studio-quality, high-contrast assets instantly." }
              ].map((step, idx) => (
                <div
                  className="col-12 col-lg-3.5 p-4"
                  key={idx}
                  style={{
                    backgroundColor: cardBgColor,
                    border: `1px solid ${cardBorderColor}`,
                    borderRadius: "20px",
                    flex: "1 1 300px",
                    maxWidth: "380px"
                  }}
                >
                  <div
                    className="fw-bold mb-3 display-6"
                    style={{
                      background: "linear-gradient(90deg, #B6FF2A 0%, #00E676 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    {step.step}
                  </div>
                  <h5 className="fw-bold mb-2" style={{ color: textThemeColor }}>{step.title}</h5>
                  <p className="mb-0" style={{ fontSize: "0.88rem", lineHeight: "1.6", color: textMutedThemeColor }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- BOTTOM CALLED CTA BANNER --- */}
        <section className="py-5 py-lg-6 position-relative" style={{ backgroundColor: bgThemeColor, transition: "background-color 0.3s ease" }}>
          <div className="container">
            <div
              className="p-5 p-lg-6 text-center position-relative overflow-hidden"
              style={{
                borderRadius: "32px",
                background: darkMode
                  ? "radial-gradient(ellipse at center, rgba(182, 255, 42, 0.08) 0%, rgba(3,7,18,0) 80%)"
                  : "radial-gradient(ellipse at center, rgba(0, 230, 118, 0.06) 0%, rgba(255,255,255,0) 80%)",
                border: `1px solid ${darkMode ? "rgba(182, 255, 42, 0.2)" : "rgba(0, 230, 118, 0.2)"}`,
                backgroundColor: cardBgColor
              }}
            >
              <h2 className="display-4 fw-extrabold mb-3" style={{ color: textThemeColor }}>Elevate Your Product Catalog</h2>
              <p className="fs-5 mb-4.5 mx-auto" style={{ maxWidth: "600px", color: textMutedThemeColor }}>
                Sign up today to access unlimited mockups, models, and renders. Experience luxury photography in seconds.
              </p>

              <div className="d-flex justify-content-center">
                <Button
                  onClick={() => navigate("/register")}
                  sx={{
                    background: "linear-gradient(90deg, #B6FF2A 0%, #00E676 100%)",
                    color: "#030712",
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    px: 5,
                    py: 1.8,
                    borderRadius: "50px",
                    boxShadow: "0 8px 30px rgba(182, 255, 42, 0.4)",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      boxShadow: "0 10px 40px rgba(182, 255, 42, 0.6)",
                      transform: "scale(1.03)"
                    }
                  }}
                >
                  Start Creating Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* --- PREMIUM Footer --- */}
        <footer
          className="pt-5 pb-2"
          style={{
            backgroundColor: darkMode ? "#02040a" : "#f8fafc",
            borderTop: `1px solid ${cardBorderColor}`,
            transition: "background-color 0.3s ease, border-color 0.3s ease"
          }}
        >
          <div className="container">
            <div className="row align-items-center justify-content-between">
              <div className="col-12 col-md-4 mb-3 mb-md-0 text-center text-md-start">
                <EkodexLogo isDark={darkMode} />
                <p className="mt-3" style={{ fontSize: "0.8rem", color: textMutedThemeColor }}>
                  © {new Date().getFullYear()} EKODEX Technologies Private limited company. All rights reserved.
                </p>
              </div>
              <div className="col-12 col-md-6 text-center text-md-end">
                <div className="d-flex gap-4 justify-content-center justify-content-md-end">
                  {["Studio", "Pricing", "Terms", "Privacy"].map((link) => (
                    <a
                      href="#"
                      className="text-decoration-none transition-all"
                      style={{
                        fontSize: "0.85rem",
                        color: textMutedThemeColor
                      }}
                      key={link}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </Box>
    );
  }

  // ---------------- RENDERING THE DYNAMIC MERN TEMPLATE EDITOR (LOGGED IN) ----------------
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        transition: "0.3s ease",
      }}
    >
      <Box
        sx={{
          px: { xs: 4, sm: 4, md: 6 },
          py: { xs: 4, sm: 3, md: 4 },
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Image Editor
            </Typography>
            <Typography color={textColor}>
              Create banners, posters & reusable templates
            </Typography>
          </Box>

          {/* SEARCH */}
          <Box sx={{ position: "relative", width: 500 }}>
            <TextField
              placeholder="Search templates..."
              size="small"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/templates?search=${searchText}`);
                }
              }}
              sx={{
                width: "100%",
                backgroundColor: "#fff",
                borderRadius: 1,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* SEARCH RESULTS DROPDOWN */}
            {searchResults &&
              ((searchResults.subcategories?.length || 0) > 0 ||
                (searchResults.templates?.length || 0) > 0) && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    backgroundColor: cardColor,
                    boxShadow: 3,
                    borderRadius: 2,
                    mt: 1,
                    p: 1,
                    zIndex: 1000,
                    maxHeight: 350,
                    overflowY: "auto",
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  {searchResults.templates?.map((template, index) => {
                    const subcategoryName =
                      template.subcategoryName ||
                      template.subCategory?.name ||
                      "Other";

                    const subcategorySlug =
                      template.subcategorySlug ||
                      template.subCategory?.slug ||
                      subcategoryName.toLowerCase().replace(/\s+/g, "-");

                    const alreadyShown = searchResults.templates
                      .slice(0, index)
                      .some((t) => {
                        const prevName =
                          t.subcategoryName || t.subCategory?.name || "Other";
                        return prevName === subcategoryName;
                      });

                    if (alreadyShown) return null;

                    return (
                      <Box
                        key={subcategorySlug}
                        onClick={() => {
                          setSearchText(subcategoryName);
                          setSearchResults(null);
                          navigate(
                            `/templates?subcategory=${encodeURIComponent(
                              subcategorySlug,
                            )}`,
                          );
                        }}
                        sx={{
                          px: 2,
                          py: 1.5,
                          cursor: "pointer",
                          borderRadius: 1,
                          transition: "0.2s",
                          "&:hover": {
                            backgroundColor: darkMode ? "#1e293b" : "#f5f5f5",
                          },
                        }}
                      >
                        <Typography fontWeight={600}>
                          📂 {subcategoryName}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
          </Box>

          {/* ADMIN BUTTON */}
          {user?.role === "ADMIN" && (
            <Card
              sx={{
                height: 60,
                display: "flex",
                alignItems: "center",
                bgcolor: bgColor,
                color: textColor,
                px: 2,
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TemplateIcon />
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography fontWeight={600} sx={{ whiteSpace: "nowrap" }}>
                    Create Template
                  </Typography>
                  <Typography variant="body2">
                    Design reusable layouts
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => navigate("/templates/add")}
                  sx={{
                    minWidth: "auto",
                    px: 1,
                    bgcolor: darkMode ? "#1e293b" : "#1976d2",
                    color: "#fff",
                    border: `0.1px solid ${textColor}`,
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
            </Card>
          )}
        </Box>

        {/* TEMPLATE LIBRARY */}
        <Categories selectedCategory={selectedCategory} />
      </Box>
    </Box>
  );
};

export default Home;
