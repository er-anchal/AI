import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Stack
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useThemeContext } from "../context/ThemeContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import CheckIcon from "@mui/icons-material/Check";

export default function TemplateShotsPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const TEMP_URL = import.meta.env.VITE_TEMP_URL;

  const {
    darkMode,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShots, setSelectedShots] = useState([]);

  // Reset selections when theme changes
  useEffect(() => {
    setSelectedShots([]);
  }, [templateId]);

  // Fetch templates when component mounts
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch all templates (with shots)
        console.log("TemplateShotsPage fetching templates. templateId from URL:", templateId);
        const res = await axios.get(`${API_URL}/template-shots`, { headers });
        console.log("Fetched templates count:", res.data?.length);
        setTemplates(res.data || []);

        if (res.data && res.data.length > 0) {
          // If templateId is in URL, auto-select it. Otherwise, select the first template.
          const initialTemplate = templateId
            ? res.data.find(t => {
              const isMatch = String(t._id || "").trim().toLowerCase() === String(templateId).trim().toLowerCase();
              console.log(`Comparing t._id (${t._id}) === templateId (${templateId}) ->`, isMatch);
              return isMatch;
            })
            : res.data[0];

          console.log("Initial selected template:", initialTemplate?._id || "none");
          setSelectedTemplate(initialTemplate || res.data[0]);
        } else {
          console.log("No templates returned from backend.");
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
        setError("Failed to load templates. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [templateId, API_URL]);

  const handleTemplateChange = (event) => {
    const template = templates.find((t) => t._id === event.target.value);
    setSelectedTemplate(template);
    setSelectedShots([]);
    navigate(`/template-shots/${template._id}`, { replace: true });
  };

  const handleShotToggle = (shot) => {
    setSelectedShots((prev) => {
      if (prev.includes(shot)) {
        return prev.filter((s) => s !== shot);
      } else {
        return [...prev, shot];
      }
    });
  };

  const handleOpenInEditor = () => {
    if (selectedShots.length === 0) return;
    const firstShot = selectedShots[0];
    const encodedFirstShot = encodeURIComponent(`${TEMP_URL}${firstShot}`);
    const encodedShots = encodeURIComponent(
      JSON.stringify(selectedShots.map((s) => `${TEMP_URL}${s}`))
    );
    navigate(
      `/design/new?bg=${encodedFirstShot}&templateId=${selectedTemplate._id}&selectedShots=${encodedShots}`
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: bgColor,
        }}
      >
        <CircularProgress size={50} sx={{ color: "#1976d2" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, bgcolor: bgColor, minHeight: "100vh" }}>
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Box>
    );
  }

  // A template might not have any explicit shots array. Let's fall back to imageUrl if empty.
  const hasShots = selectedTemplate && selectedTemplate.shots && selectedTemplate.shots.length > 0;
  const displayShots = hasShots
    ? selectedTemplate.shots
    : selectedTemplate
      ? [selectedTemplate.imageUrl]
      : [];

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: bgColor, minHeight: "100vh", color: textColor }}>
      {/* Header Section */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: "linear-gradient(45deg, #1976d2, #c6ff00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 0.5,
              fontSize: { xs: "1.75rem", sm: "2.125rem" }
            }}
          >
            Template Shots
          </Typography>
          <Typography variant="body2" sx={{ color: secondaryText, display: { xs: "none", sm: "block" } }}>
            View available variations and layouts for this template.
          </Typography>
        </Box>
      </Stack>

      {selectedTemplate ? (
        <Box>
          {/* Controls and Statistics Bar */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              p: 2,
              mb: 4,
              bgcolor: cardColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Left Box: Change Theme and Counts */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate("/image-results")}
                sx={{
                  borderColor: borderColor,
                  color: textColor,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  height: 40,
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    borderColor: textColor,
                    bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  },
                }}
              >
                Change Theme
              </Button>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  justifyContent: { xs: "center", sm: "flex-start" },
                  width: { xs: "100%", sm: "auto" }
                }}
              >
                {/* Total Shots Chip */}
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: darkMode ? "#10141e" : "#f5f5f5",
                    border: `1px solid ${borderColor}`,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: textColor,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  Total Shots: <span style={{ color: "#1976d2" }}>{displayShots.length}</span>
                </Box>

                {/* Selected Shots Chip */}
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: selectedShots.length > 0
                      ? "rgba(198,255,0,0.15)"
                      : (darkMode ? "#10141e" : "#f5f5f5"),
                    border: selectedShots.length > 0
                      ? "1px solid #c6ff00"
                      : `1px solid ${borderColor}`,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: selectedShots.length > 0 ? "#c6ff00" : secondaryText,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    boxShadow: selectedShots.length > 0 ? "0 0 10px rgba(198,255,0,0.2)" : "none",
                  }}
                >
                  Selected Shots: {selectedShots.length}
                </Box>
              </Box>
            </Box>

            {/* Right Button: Open in Editor */}
            <Button
              variant="contained"
              disabled={selectedShots.length === 0}
              onClick={handleOpenInEditor}
              startIcon={<DesignServicesIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                height: 40,
                bgcolor: selectedShots.length > 0 ? "#1976d2" : (darkMode ? "#1e293b" : "#e0e0e0"),
                color: selectedShots.length > 0 ? "#fff" : "text.disabled",
                boxShadow: selectedShots.length > 0 ? "0 4px 12px rgba(25, 118, 210, 0.3)" : "none",
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  bgcolor: selectedShots.length > 0 ? "#115293" : "transparent",
                },
              }}
            >
              Open in Editor
            </Button>
          </Box>

          <Typography variant="h6" fontWeight={600} mb={3} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DesignServicesIcon sx={{ color: "#1976d2" }} />
            Available Shots for: <strong style={{ color: "#1976d2" }}>{selectedTemplate.name || selectedTemplate.fileName}</strong>
          </Typography>

          {!hasShots && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              This template does not have custom shots configured. Showing its main template preview.
            </Alert>
          )}

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {displayShots.map((shot, index) => {
              const isSelected = selectedShots.includes(shot);
              return (
                <Grid item xs={6} sm={6} md={4} lg={3} key={index}>
                  <Card
                    onClick={() => handleShotToggle(shot)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 4,
                      overflow: "hidden",
                      bgcolor: cardColor,
                      border: isSelected ? "2px solid #1976d2" : `1px solid ${borderColor}`,
                      boxShadow: isSelected ? "0 0 15px rgba(25, 118, 210, 0.3)" : "none",
                      transition: "all 0.3s ease",
                      position: "relative",
                      "&:hover": {
                        boxShadow: isSelected ? "0 0 20px rgba(25, 118, 210, 0.5)" : "0 12px 24px rgba(0,0,0,0.15)",
                        transform: "translateY(-4px)"
                      }
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        pt: "100%",
                        overflow: "hidden",
                        "&:hover img": {
                          transform: "scale(1.05)",
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={`${TEMP_URL}${shot}`}
                        alt={`Shot ${index + 1}`}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          bgcolor: darkMode ? "#10141e" : "#f5f5f5",
                          p: 1,
                          transition: "transform 0.3s ease",
                        }}
                      />

                      {/* Checked overlay */}
                      {isSelected && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            bgcolor: "#1976d2",
                            color: "#fff",
                            borderRadius: "50%",
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            zIndex: 2,
                          }}
                        >
                          <CheckIcon sx={{ fontSize: 18 }} />
                        </Box>
                      )}

                      {/* Hover Overlay */}
                      {!isSelected && (
                        <Box
                          className="hover-overlay"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            bgcolor: "rgba(25, 118, 210, 0.08)",
                            opacity: 0,
                            transition: "opacity 0.3s ease",
                            zIndex: 1,
                            "&:hover": {
                              opacity: 1,
                            }
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ p: 2, textAlign: "center", bgcolor: isSelected ? (darkMode ? "#112240" : "#e3f2fd") : "transparent" }}>
                      <Typography variant="subtitle2" fontWeight={600} color={isSelected ? "#1976d2" : textColor}>
                        {hasShots ? `Variation Shot #${index + 1}` : "Primary Template Shot"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ) : (
        <Paper sx={{ p: 5, textAlign: "center", bgcolor: cardColor, border: `1px solid ${borderColor}`, borderRadius: 3 }}>
          <Typography variant="h6">No templates available.</Typography>
          <Typography variant="body2" sx={{ color: secondaryText, mt: 1 }}>
            Please upload a template with shots inside the Admin Panel first.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
