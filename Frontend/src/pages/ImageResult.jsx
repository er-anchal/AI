import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardMedia,
  Button,
  Stack,
  Paper,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeContext } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ImageResults() {
  const API_URL = import.meta.env.VITE_API_URL;
  const TEMP_URL = import.meta.env.VITE_TEMP_URL;

  const location = useLocation();
  const navigate = useNavigate();

  // const { bgColor, cardColor, textColor, secondaryText } = useThemeContext();

  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [activeCategorySlug, setActiveCategorySlug] = useState("");

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

  const [templatesByCategory, setTemplatesByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  const {
    darkMode,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();

  const {
    templates = [],
    category = "Jewellery",
    subcategory, // The detected subcategory name from UserDashboard
    uploadedImages = [],
  } = location.state || {};

  // ----------------------------
  // FETCH CATEGORIES
  // ----------------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/template-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cats = res.data || [];
        setCategories(cats);

        // Auto-select category from state (e.g. "Jewellery")
        const initialCat = cats.find(c => c.name.toLowerCase() === category.toLowerCase()) || cats[0];
        if (initialCat) {
          setSelectedCategoryId(initialCat._id);
          setActiveCategorySlug(initialCat.slug);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [category, token, API_URL]);

  // ----------------------------
  // FETCH SUBCATEGORIES FOR SELECTED CATEGORY
  // ----------------------------
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategoryId) return;
      try {
        const res = await axios.get(`${API_URL}/template-subcategories/category/${selectedCategoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const subcats = res.data || [];
        setSubcategories(subcats);

        // Auto-select subcategory from state
        if (subcategory) {
          const initialSub = subcats.find(s => s.name.toLowerCase() === subcategory.toLowerCase() || s.slug.toLowerCase() === subcategory.toLowerCase());
          if (initialSub) {
            setSelectedSubcategoryId(initialSub._id);
          } else if (subcats.length > 0) {
            setSelectedSubcategoryId(subcats[0]._id);
          }
        } else if (subcats.length > 0) {
          setSelectedSubcategoryId(subcats[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch subcategories", err);
      }
    };
    fetchSubcategories();
  }, [selectedCategoryId, subcategory, token, API_URL]);

  // ----------------------------
  // FETCH TEMPLATES
  // ----------------------------
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!activeCategorySlug) return;
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/templates/by-category/${activeCategorySlug}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTemplatesByCategory({ [activeCategorySlug]: res.data || [] });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch templates", err);
        setLoading(false);
      }
    };
    if (token) fetchTemplates();
  }, [activeCategorySlug, token, API_URL]);

  // ----------------------------
  // FILTERED TEMPLATES
  // ----------------------------
  const displayTemplates = (templatesByCategory[activeCategorySlug] || []).filter(
    (item) => {
      if (!selectedSubcategoryId) return true;
      const selectedSub = subcategories.find(s => s._id === selectedSubcategoryId);
      return selectedSub && (
        item.subcategoryId === selectedSubcategoryId ||
        (item.subcategoryName && item.subcategoryName.toLowerCase() === selectedSub.name.toLowerCase()) ||
        (item.subcategorySlug && selectedSub.slug && item.subcategorySlug.toLowerCase() === selectedSub.slug.toLowerCase())
      );
    }
  );
  // ----------------------------
  // UI
  // ----------------------------
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor, color: textColor, p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 3,
          "@media (max-width: 1024px)": {
            flexDirection: "column",
          },
        }}
      >
        {/* LEFT PANEL */}
        <Box
          sx={{
            width: 340,
            flexShrink: 0,
            "@media (max-width: 1024px)": {
              width: "100%",
            },
          }}
        >
          {/* IMAGE PREVIEW */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              "@media (max-width: 1024px)": {
                justifyContent: "center",
              },
            }}
          >
            <Box
              sx={{
                width: 220,
                height: 220,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: cardColor,
                border: "1px solid #333",
                position: "relative",
              }}
            >
              {uploadedImages[0] && (
                <Box
                  component="img"
                  src={uploadedImages[0]}
                  alt="Main"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}

              <Chip
                label="MAIN"
                size="small"
                sx={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  bgcolor: "#4c8bf5",
                  color: "white",
                  fontWeight: 700,
                }}
              />
            </Box>

            <Stack spacing={1}>
              {[1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 65,
                    height: 65,
                    border: "2px dashed #444",
                    borderRadius: 2,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: secondaryText,
                  }}
                >
                  {uploadedImages[i] ? (
                    <Box
                      component="img"
                      src={uploadedImages[i]}
                      alt={`shot-${i}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    "+"
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          {/* CATEGORIES */}
          <Paper sx={{ bgcolor: cardColor, borderRadius: 4, p: 3 }}>
            <Typography fontWeight={700} mb={2}>
              CATEGORIES
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {categories.map((cat) => (
                <Button
                  key={cat._id}
                  fullWidth
                  onClick={() => {
                    setSelectedCategoryId(cat._id);
                    setActiveCategorySlug(cat.slug);
                  }}
                  endIcon={cat._id === selectedCategoryId ? <CheckIcon /> : null}
                  sx={{
                    justifyContent: "space-between",
                    bgcolor: cat._id === selectedCategoryId ? "rgba(198,255,0,0.15)" : "transparent",
                    color: cat._id === selectedCategoryId ? "#c6ff00" : textColor,
                    textShadow: cat._id === selectedCategoryId ? "1px 1px 3px rgba(0,0,0,0.8)" : "none",
                    border: cat._id === selectedCategoryId ? "1px solid #c6ff00" : `1px solid ${borderColor}`,
                    borderRadius: 3,
                    py: 1.5,
                    textTransform: "none",
                  }}
                >
                  {cat.name}
                </Button>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Select Product Type
          </Typography>

          {/* SUBCATEGORIES */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 4,
            }}
          >
            {subcategories.map((item) => (
              <Chip
                key={item._id}
                label={item.name}
                onClick={() => setSelectedSubcategoryId(item._id)}
                icon={item._id === selectedSubcategoryId ? <CheckIcon /> : null}
                sx={{
                  bgcolor:
                    item._id === selectedSubcategoryId
                      ? "rgba(198,255,0,0.15)"
                      : cardColor,
                  color:
                    item._id === selectedSubcategoryId ? "#c6ff00" : textColor,
                  textShadow:
                    item._id === selectedSubcategoryId ? "1px 1px 3px rgba(0,0,0,0.8)" : "none",
                  border:
                    item._id === selectedSubcategoryId
                      ? "1px solid #c6ff00"
                      : "1px solid #333",
                  fontWeight: 700,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(198,255,0,0.25)",
                  }
                }}
              />
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              "@media (max-width: 768px)": {
                flexDirection: "column",
                alignItems: "stretch",
                gap: 1.5,
              },
            }}
          >
            <Typography variant="h5" fontWeight={700}>
              Choose Theme
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                minWidth: "auto",
                px: 2,
                height: 40,
                bgcolor: darkMode ? "#1e293b" : "#1976d2",
                borderRadius: 1,
                color: "#fff",
                border: `0.1px solid ${textColor}`,
                "&:hover": {
                  borderColor: "#ff4d4f",
                  backgroundColor: "rgba(255, 77, 79, 0.1)",
                },
                "@media (max-width: 768px)": {
                  width: "100%",
                },
              }}
            >
              ← Back
            </Button>
          </Box>
          {/* TEMPLATES GRID */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1.5,
              maxWidth: "900px",
              width: "100%",
              justifyContent: "center",
              margin: "0 auto",
              pb: 4,
              "@media (max-width: 1200px)": {
                gridTemplateColumns: "repeat(3, 1fr)",
              },
              "@media (max-width: 1024px)": {
                gridTemplateColumns: "repeat(3, 1fr)",
              },
              "@media (max-width: 768px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
              },
              "@media (max-width: 480px)": {
                gridTemplateColumns: "repeat(1, 1fr)",
              },
            }}
          >
            {displayTemplates.map((template) => (
              <Card
                key={template._id}
                onClick={() => navigate(`/template-shots/${template._id}`)}
                sx={{
                  width: "100%",
                  aspectRatio: "250 / 220",
                  borderRadius: 3,
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  transition: "0.3s",
                  border: `1px solid ${borderColor || "#333"}`,
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                {/* TEMPLATE IMAGE */}
                <CardMedia
                  component="img"
                  image={
                    template.imageUrl
                      ? `${TEMP_URL}${template.imageUrl}`
                      : `${TEMP_URL}/uploads/${template.categorySlug}/${template.subcategoryName}/${template.fileName}`
                  }
                  alt={
                    template.name ||
                    template.selectedSubcategory ||
                    "Template"
                  }
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    console.log("Image failed to load:", template);
                    e.target.src = "/no-image.png";
                  }}
                />
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
