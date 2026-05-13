import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { useThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const categories = [
  "All",
  "General",
  "Product Shoot",
  "Pricing",
  "Jewellery",
  "Images & Videos",
  "Account & Usage",
];

const FaqPage = () => {
  const { bgColor, textColor, cardColor, borderColor, darkMode } = useThemeContext();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const greenAccent = "#c6ff00";

  useEffect(() => {
    fetchFaqs();
  }, [activeCategory, searchQuery]);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/faqs?`;
      if (activeCategory !== "All") url += `category=${encodeURIComponent(activeCategory)}&`;
      if (searchQuery) url += `search=${searchQuery}`;

      const { data } = await axios.get(url);
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpandedId(isExpanded ? panel : false);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/user-queries`, formData);
      if (data.success) {
        setToast({ open: true, message: "Your query has been submitted successfully!", severity: "success" });
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch (error) {
      setToast({
        open: true,
        message: error.response?.data?.message || "Something went wrong. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: textColor,
      bgcolor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
      borderRadius: "12px",
      transition: "all 0.3s ease",
      "& fieldset": { 
        borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      },
      "&:hover fieldset": { 
        borderColor: "rgba(198, 255, 0, 0.4)",
      },
      "&.Mui-focused fieldset": { 
        borderColor: greenAccent,
        borderWidth: "1px",
      },
      "&.Mui-focused": {
        boxShadow: `0 0 15px ${greenAccent}20`,
      }
    },
    "& .MuiInputLabel-root": { color: "text.secondary" },
    "& .MuiInputLabel-root.Mui-focused": { color: greenAccent },
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor, color: textColor }}>
   
      <Box sx={{ pt: 8, pb: 12, px: 2 }}>
        <Container maxWidth="md">
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: greenAccent, fontWeight: 700, letterSpacing: 1.5, mb: 2, textTransform: "uppercase" }}
            >
              Help Center
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 4, maxWidth: "600px", mx: "auto" }}>
              Find answers about AIVX, jewellery product shoots, pricing, and usage.
            </Typography>

            {/* Search Bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: darkMode ? "#1A2027" : "#fff",
                borderRadius: "50px",
                px: 3,
                py: 1,
                width: "100%",
                maxWidth: "600px",
                mx: "auto",
                border: `1px solid ${borderColor}`,
                mb: 6,
              }}
            >
              <SearchIcon sx={{ color: "text.secondary", mr: 2 }} />
              <TextField
                variant="standard"
                placeholder="Search for answers..."
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  style: { color: textColor },
                }}
              />
            </Box>

            {/* Category Pills */}
            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, mb: 6 }}>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  sx={{
                    borderRadius: "50px",
                    px: 3,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: activeCategory === cat ? greenAccent : darkMode ? "#1A2027" : "#e2e8f0",
                    color: activeCategory === cat ? "#000" : textColor,
                    "&:hover": {
                      bgcolor: activeCategory === cat ? greenAccent : darkMode ? "#2D3748" : "#cbd5e1",
                    },
                    boxShadow: activeCategory === cat ? `0 0 15px ${greenAccent}80` : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {cat}
                </Button>
              ))}
            </Box>
          </Box>

          {/* FAQ List */}
          <Box sx={{ mb: 10 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress sx={{ color: greenAccent }} />
              </Box>
            ) : faqs.length > 0 ? (
              faqs.map((faq) => (
                <Accordion
                  key={faq._id}
                  expanded={expandedId === faq._id}
                  onChange={handleChange(faq._id)}
                  sx={{
                    bgcolor: cardColor,
                    color: textColor,
                    mb: 2,
                    borderRadius: "16px !important",
                    border: `1px solid ${expandedId === faq._id ? greenAccent : borderColor}`,
                    boxShadow: expandedId === faq._id ? `0 0 10px ${greenAccent}40` : "none",
                    "&:before": { display: "none" },
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    "&:hover": {
                       border: `1px solid ${greenAccent}`,
                       boxShadow: `0 0 10px ${greenAccent}40`,
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: textColor }} />}
                    sx={{ p: 3 }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: greenAccent,
                          bgcolor: `${greenAccent}20`,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "4px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          mb: 1.5,
                          display: "inline-block",
                        }}
                      >
                        {faq.category}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {faq.title}
                      </Typography>
                      {!expandedId || expandedId !== faq._id ? (
                         <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                            {faq.shortDescription || (faq.answer.substring(0, 100) + "...")}
                         </Typography>
                      ) : null}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography textAlign="center" color="text.secondary">
                No FAQs found for this category or search.
              </Typography>
            )}
          </Box>

          {/* Ask Question Form */}
          <Box
            sx={{
              bgcolor: cardColor,
              p: { xs: 3, md: 5 },
              borderRadius: "24px",
              border: `1px solid ${borderColor}`,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: "center" }}>
              Still Have Questions?
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 4, textAlign: "center" }}>
              Can't find the answer you're looking for? Please chat to our friendly team.
            </Typography>

            <Box sx={{ maxWidth: "700px", mx: "auto" }}>
              <form onSubmit={handleSubmitQuery}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    variant="outlined"
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    variant="outlined"
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number (Optional)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    variant="outlined"
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message / Query"
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    required
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={inputStyles}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 5, textAlign: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{
                    bgcolor: greenAccent,
                    color: "#000",
                    px: 8,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    borderRadius: "50px",
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#b3e600",
                      boxShadow: `0 0 15px ${greenAccent}80`,
                    },
                  }}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : "Send Message"}
                </Button>
              </Box>
            </form>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FaqPage;
