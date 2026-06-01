import React, { useState } from "react";
import { Box, Typography, TextField, Button, Grid, Paper, Snackbar, Alert, CircularProgress, Accordion, AccordionSummary, AccordionDetails, IconButton } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import BusinessCenter from "@mui/icons-material/BusinessCenter";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { motion } from "framer-motion";
import axios from "axios";
import { useThemeContext } from "../context/ThemeContext";
import Footer from "../components/Footer";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ContactUs = () => {
  const { darkMode } = useThemeContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Theme-aware tokens matching Home.jsx
  const bgThemeColor = darkMode ? "#030712" : "#f8fafc";
  const textThemeColor = darkMode ? "#ffffff" : "#0f172a";
  const textMutedThemeColor = darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(15, 23, 42, 0.6)";
  const cardBgColor = darkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.85)";
  const cardBorderColor = darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.06)";
  const gridDotColor = darkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.04)";

  // Glowing lights backdrop
  const blurOverlay1 = darkMode
    ? "radial-gradient(circle, rgba(182, 255, 42, 0.05) 0%, rgba(0, 0, 0, 0) 70%)"
    : "radial-gradient(circle, rgba(182, 255, 42, 0.02) 0%, rgba(255, 255, 255, 0) 75%)";
  const blurOverlay2 = darkMode
    ? "radial-gradient(circle, rgba(0, 230, 118, 0.04) 0%, rgba(0, 0, 0, 0) 75%)"
    : "radial-gradient(circle, rgba(0, 230, 118, 0.01) 0%, rgba(255, 255, 255, 0) 80%)";

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/user-queries`,
        formData
      );
      if (data.success) {
        setToast({
          open: true,
          message: "Your message has been submitted successfully!",
          severity: "success",
        });
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch (error) {
      setToast({
        open: true,
        message:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: bgThemeColor,
          color: textThemeColor,
          fontFamily: "'Inter', sans-serif",
          position: "relative",
          py: 8,
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

          .glass-card {
            background: ${cardBgColor} !important;
            border: 1px solid ${cardBorderColor} !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-radius: 24px !important;
            transition: all 0.3s ease;
          }
          
          .glass-card:hover {
            border-color: ${darkMode ? "rgba(182, 255, 42, 0.2)" : "rgba(0, 230, 118, 0.2)"} !important;
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
            bottom: "20%",
            right: "-150px",
            zIndex: 0,
            pointerEvents: "none"
          }}
        />

        <Box sx={{ maxWidth: "1200px", mx: "auto", px: { xs: 2.5, md: 4 }, position: "relative", zIndex: 1 }}>

          {/* HEADER */}
          <Box textAlign="center" mb={8}>
            <Box className="d-flex align-items-center gap-2 justify-content-center mb-2">
              <AutoAwesome sx={{ color: "#B6FF2A", fontSize: "1.2rem" }} />
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
                Get In Touch
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
              Let's Create Together
            </Typography>

            <Typography
              className="body-font"
              sx={{
                maxWidth: "620px",
                mx: "auto",
                fontSize: "1.05rem",
                lineHeight: 1.7,
                color: textMutedThemeColor
              }}
            >
              Need premium product photography or studio-grade visuals without the overhead?
              We help jewelry brands, fashion labels, and e-commerce stores scale catalog production.
            </Typography>
          </Box>

          {/* TWO-COLUMN GRID */}
          <Grid container spacing={5} alignItems="stretch" sx={{ mb: 10 }}>

            {/* LEFT COLUMN: CONTACT DETAILS */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, height: "100%" }}>

                {/* Email Info Card */}
                <Box
                  className="glass-card hover-translate-y"
                  sx={{ p: 4.5, display: "flex", gap: 3, alignItems: "flex-start", flexGrow: 1, borderRadius: "24px" }}
                >
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: "16px",
                      bgcolor: darkMode ? "rgba(182, 255, 42, 0.08)" : "rgba(0, 230, 118, 0.08)",
                      border: `1px solid ${darkMode ? "rgba(182, 255, 42, 0.25)" : "rgba(0, 230, 118, 0.25)"}`,
                      color: darkMode ? "#B6FF2A" : "#00C853"
                    }}
                  >
                    <EmailIcon sx={{ fontSize: "1.5rem" }} />
                  </Box>
                  <Box>
                    <Typography className="premium-font" sx={{ fontWeight: 800, fontSize: "1.08rem", mb: 0.5 }}>
                      Email Us
                    </Typography>
                    <Typography className="body-font" sx={{ fontSize: "0.92rem", color: textMutedThemeColor, fontWeight: 500 }}>
                      ekodexproductions@gmail.com
                    </Typography>
                    <Typography className="body-font" sx={{ fontSize: "0.82rem", color: textMutedThemeColor, mt: 1 }}>
                      Replies within 24 hours.
                    </Typography>
                  </Box>
                </Box>

                {/* Call Info Card */}
                <Box
                  className="glass-card hover-translate-y"
                  sx={{ p: 4.5, display: "flex", gap: 3, alignItems: "flex-start", flexGrow: 1, borderRadius: "24px" }}
                >
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: "16px",
                      bgcolor: darkMode ? "rgba(182, 255, 42, 0.08)" : "rgba(0, 230, 118, 0.08)",
                      border: `1px solid ${darkMode ? "rgba(182, 255, 42, 0.25)" : "rgba(0, 230, 118, 0.25)"}`,
                      color: darkMode ? "#B6FF2A" : "#00C853"
                    }}
                  >
                    <PhoneIcon sx={{ fontSize: "1.5rem" }} />
                  </Box>
                  <Box>
                    <Typography className="premium-font" sx={{ fontWeight: 800, fontSize: "1.08rem", mb: 0.5 }}>
                      Call Us
                    </Typography>
                    <Typography className="body-font" sx={{ fontSize: "0.92rem", color: textMutedThemeColor, fontWeight: 500 }}>
                      +91 90720 20601
                    </Typography>
                    <Typography className="body-font" sx={{ fontSize: "0.82rem", color: textMutedThemeColor, mt: 1 }}>
                      Mon - Fri, 9:00 AM - 6:00 PM IST
                    </Typography>
                  </Box>
                </Box>

                {/* Office Info Card */}
                <Box
                  className="glass-card hover-translate-y"
                  sx={{ p: 4.5, display: "flex", gap: 3, alignItems: "flex-start", flexGrow: 1, borderRadius: "24px" }}
                >
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: "16px",
                      bgcolor: darkMode ? "rgba(182, 255, 42, 0.08)" : "rgba(0, 230, 118, 0.08)",
                      border: `1px solid ${darkMode ? "rgba(182, 255, 42, 0.25)" : "rgba(0, 230, 118, 0.25)"}`,
                      color: darkMode ? "#B6FF2A" : "#00C853"
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: "1.5rem" }} />
                  </Box>
                  <Box>
                    <Typography className="premium-font" sx={{ fontWeight: 800, fontSize: "1.08rem", mb: 0.5 }}>
                      Our Office
                    </Typography>
                    <Typography className="body-font" sx={{ fontSize: "0.9rem", color: textMutedThemeColor, lineHeight: 1.5 }}>
                      2nd Floor UL Cyber Park, Nellikode <br />
                      Kozhikode, Kerala, 673016
                    </Typography>
                  </Box>
                </Box>

              </Box>
            </Grid>

            {/* RIGHT COLUMN: CONTACT FORM */}
            <Grid item xs={12} lg={8}>
              <Paper
                className="glass-card"
                sx={{
                  p: { xs: 4, md: 5 },
                  height: "100%",
                }}
              >
                <Typography variant="h5" className="premium-font" sx={{ fontWeight: 800, mb: 3.5 }}>
                  Send us a Message
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Box display="flex" flexDirection="column" gap={3.5}>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="name"
                          label="Full Name *"
                          value={formData.name}
                          onChange={handleFormChange}
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              fontFamily: "'Inter', sans-serif",
                              color: textThemeColor,
                              "& fieldset": { borderColor: cardBorderColor },
                              "&:hover fieldset": { borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.2)" },
                              "&.Mui-focused fieldset": { borderColor: darkMode ? "#B6FF2A" : "#00E676" }
                            },
                            "& .MuiInputLabel-root": {
                              fontFamily: "'Inter', sans-serif",
                              color: textMutedThemeColor,
                              "&.Mui-focused": { color: darkMode ? "#B6FF2A" : "#00E676" }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="email"
                          type="email"
                          label="Email Address *"
                          value={formData.email}
                          onChange={handleFormChange}
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              fontFamily: "'Inter', sans-serif",
                              color: textThemeColor,
                              "& fieldset": { borderColor: cardBorderColor },
                              "&:hover fieldset": { borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.2)" },
                              "&.Mui-focused fieldset": { borderColor: darkMode ? "#B6FF2A" : "#00E676" }
                            },
                            "& .MuiInputLabel-root": {
                              fontFamily: "'Inter', sans-serif",
                              color: textMutedThemeColor,
                              "&.Mui-focused": { color: darkMode ? "#B6FF2A" : "#00E676" }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      name="phone"
                      label="Phone Number *"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          fontFamily: "'Inter', sans-serif",
                          color: textThemeColor,
                          "& fieldset": { borderColor: cardBorderColor },
                          "&:hover fieldset": { borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.2)" },
                          "&.Mui-focused fieldset": { borderColor: darkMode ? "#B6FF2A" : "#00E676" }
                        },
                        "& .MuiInputLabel-root": {
                          fontFamily: "'Inter', sans-serif",
                          color: textMutedThemeColor,
                          "&.Mui-focused": { color: darkMode ? "#B6FF2A" : "#00E676" }
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      name="message"
                      multiline
                      rows={5}
                      label="Message Details *"
                      value={formData.message}
                      onChange={handleFormChange}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          fontFamily: "'Inter', sans-serif",
                          color: textThemeColor,
                          "& fieldset": { borderColor: cardBorderColor },
                          "&:hover fieldset": { borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.2)" },
                          "&.Mui-focused fieldset": { borderColor: darkMode ? "#B6FF2A" : "#00E676" }
                        },
                        "& .MuiInputLabel-root": {
                          fontFamily: "'Inter', sans-serif",
                          color: textMutedThemeColor,
                          "&.Mui-focused": { color: darkMode ? "#B6FF2A" : "#00E676" }
                        }
                      }}
                    />

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="pill-register-btn"
                      sx={{
                        py: 1.8,
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        width: "100%",
                        mt: 1
                      }}
                    >
                      {submitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>Send Message</span>
                          <ArrowForwardIcon sx={{ fontSize: "16px" }} />
                        </Box>
                      )}
                    </Button>
                  </Box>
                </form>
              </Paper>
            </Grid>

          </Grid>

          {/* TWO-COLUMN INFORMATIONAL GRID */}
          <Grid container spacing={4} sx={{ mb: 10 }}>

            {/* Brands Use cases */}
            <Grid item xs={12} md={6}>
              <Box
                className="glass-card p-5 h-100 hover-translate-y"
              >
                <Box className="d-flex align-items-center gap-3 mb-3">
                  <AutoAwesome sx={{ color: "#B6FF2A", fontSize: "1.8rem" }} />
                  <Typography variant="h5" className="premium-font" sx={{ fontWeight: 800 }}>
                    What Brands Use Us For
                  </Typography>
                </Box>
                <Typography className="body-font" sx={{ color: textMutedThemeColor, fontSize: "0.95rem", lineHeight: 1.7 }}>
                  Create luxury AI jewelry staging renders, hyperrealistic model placements,
                  fashion lookbooks, and high-fidelity bulk catalogs without renting studios or shipping samples.
                </Typography>
              </Box>
            </Grid>

            {/* Enterprise Solutions */}
            <Grid item xs={12} md={6}>
              <Box
                className="glass-card p-5 h-100 hover-translate-y"
              >
                <Box className="d-flex align-items-center gap-3 mb-3">
                  <BusinessCenter sx={{ color: "#00E676", fontSize: "1.8rem" }} />
                  <Typography variant="h5" className="premium-font" sx={{ fontWeight: 800 }}>
                    Enterprise Solutions
                  </Typography>
                </Box>
                <Typography className="body-font" sx={{ color: textMutedThemeColor, fontSize: "0.95rem", lineHeight: 1.7 }}>
                  For high-volume catalogs, creative agencies, and multi-brand jewelry retail chains,
                  we deliver custom rendering endpoints, dedicated support structures, and custom model training pipelines.
                </Typography>
              </Box>
            </Grid>

          </Grid>

          {/* FAQ ACCORDION SECTION */}
          <Box sx={{ mb: 6 }}>
            <Box textAlign="center" mb={5}>
              <Typography variant="h4" className="premium-font" sx={{ fontWeight: 800, mb: 1.5 }}>
                Frequently Asked Questions
              </Typography>
              <Typography className="body-font" sx={{ color: textMutedThemeColor, fontSize: "0.95rem" }}>
                Quick answers to common inquiries about our services and pipelines.
              </Typography>
            </Box>

            <Box sx={{ maxWidth: "800px", mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                {
                  q: "How quickly does EKODEX respond?",
                  a: "We respond to all inquiries submitted via this form within one business day. For immediate enterprise staging assistance, contact our WhatsApp hotline.",
                },
                {
                  q: "Can I use EKODEX for jewelry and fashion?",
                  a: "Yes. EKODEX supports both jewelry and fashion photography staging, featuring specialized material models for reflective metals and custom drape-aware garment models.",
                },
                {
                  q: "Do you offer custom pricing?",
                  a: "Yes. We offer custom plans tailored for marketing agencies, ecommerce stores, and bulk catalogs. Reach out via email or schedule a discovery call.",
                },
              ].map((item, i) => (
                <Accordion
                  key={i}
                  sx={{
                    bgcolor: cardBgColor,
                    border: `1px solid ${cardBorderColor}`,
                    borderRadius: "16px !important",
                    backdropFilter: "blur(20px)",
                    boxShadow: "none",
                    overflow: "hidden",
                    "&::before": { display: "none" },
                    transition: "all 0.25s ease",
                    "&:hover": {
                      borderColor: darkMode ? "rgba(182, 255, 42, 0.2)" : "rgba(0, 230, 118, 0.2)",
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: textThemeColor }} />}
                    sx={{
                      px: 3,
                      py: 1,
                      "& .MuiAccordionSummary-content": {
                        display: "flex",
                        alignItems: "center",
                        gap: 2
                      }
                    }}
                  >
                    <QuestionAnswerIcon sx={{ color: darkMode ? "#B6FF2A" : "#00C853", fontSize: "1.15rem" }} />
                    <Typography className="premium-font" sx={{ fontWeight: 700, fontSize: "0.98rem", color: textThemeColor }}>
                      {item.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0, ml: 4.3 }}>
                    <Typography className="body-font" sx={{ color: textMutedThemeColor, fontSize: "0.92rem", lineHeight: 1.6 }}>
                      {item.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>

        </Box>

      </Box>

      <Footer />

      {/* Snackbar feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
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
    </>
  );
};

export default ContactUs;
