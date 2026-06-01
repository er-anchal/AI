import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  MenuItem,
  CircularProgress,
  Menu,
  Card,
  CardMedia,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { useThemeContext } from "../context/ThemeContext";

export default function TemplatesPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const TEMP_URL = import.meta.env.VITE_TEMP_URL;

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);
  const [templatesByCategory, setTemplatesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  // const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(null);

  const [searchText, setSearchText] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editShotsFiles, setEditShotsFiles] = useState([]);
  const [uploadingShots, setUploadingShots] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category") || "";
  const selectedSubcategory = queryParams.get("subcategory") || "";
  const {
    darkMode,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();
  /* ---------------- SLIDER SETTINGS ---------------- */
  const templateSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,

    autoplay: false,
    cssEase: "linear",

    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          centerMode: true,
          centerPadding: "0px",
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 3,
          centerMode: true,
          centerPadding: "0px",
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          centerMode: true,
          centerPadding: "0px",
        },
      },
    ],
  };

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_URL}/template-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (selectedCategory) {
          const filtered = res.data.filter(
            (cat) =>
              cat.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
              cat.name?.toLowerCase() === selectedCategory.toLowerCase(),
          );

          setCategories(filtered.length ? filtered : []);
        } else if (selectedSubcategory) {
          // If only subcategory is selected, show all categories
          // templates will be filtered later
          setCategories(res.data || []);
        } else {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, [selectedCategory, selectedSubcategory, token]);
  /* ---------------- FETCH TEMPLATES ---------------- */
  const fetchTemplates = async () => {
    if (!categories.length || !token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const requests = categories.map((cat) =>
        axios.get(`${API_URL}/templates/by-category/${cat.slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      const responses = await Promise.all(requests);

      const grouped = {};

      responses.forEach((res, index) => {
        grouped[categories[index].slug] = res.data || [];
      });

      setTemplatesByCategory(grouped);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [categories]);
  const showShotTemplate = () => {
    if (!activeTemplate) return;
    navigate(`/template-shots/${activeTemplate._id}`);
    closeMenu();
  };

  const handleTemplateClick = (template) => {
    navigate(`/template-shots/${template._id}`);
  };

  /* ---------------- MENU ---------------- */
  const openMenu = (e, template) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setActiveTemplate(template);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setActiveTemplate(null);
  };

  /* ---------------- DELETE ---------------- */
  const deleteTemplate = async () => {
    if (!activeTemplate) return;

    try {
      await axios.delete(`${API_URL}/templates/${activeTemplate._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTemplatesByCategory((prev) => {
        const key = Object.keys(prev).find((k) =>
          prev[k].some((t) => t._id === activeTemplate._id),
        );

        if (!key) return prev;

        return {
          ...prev,
          [key]: prev[key].filter((t) => t._id !== activeTemplate._id),
        };
      });

      closeMenu();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadShots = async () => {
    if (!activeTemplate) return;
    try {
      setUploadingShots(true);
      const formData = new FormData();
      editShotsFiles.forEach((file) => {
        formData.append("shots", file);
      });

      await axios.put(
        `${API_URL}/template-shots/update-shots/${activeTemplate._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert("Template shots updated successfully! 🎉");
      setEditModalOpen(false);
      setEditShotsFiles([]);
      setActiveTemplate(null);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload shots");
    } finally {
      setUploadingShots(false);
    }
  };

  const handleSearch = async (value) => {
    setSearchText(value);

    // Clear results if search box is empty
    if (!value.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/search?q=${encodeURIComponent(value)}`,
        {
          headers: token
            ? {
              Authorization: `Bearer ${token}`,
            }
            : {},
        },
      );

      console.log("Search API Response:", res.data);

      // Normalize response:
      // If backend returns only `categories`, use them as `subcategories`
      const formattedResults = {
        subcategories: res.data.subcategories || res.data.categories || [],

        templates: res.data.templates || [],
      };

      console.log("Formatted Search Results:", formattedResults);

      setSearchResults(formattedResults);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({
        subcategories: [],
        templates: [],
      });
    }
  };

  /* ---------------- SEARCH ---------------- */
  const filteredTemplates = (files) => {
    return files.filter((template) => {
      const name = template.name || template.title || template.fileName || "";

      const subcategoryName =
        template.subcategoryName ||
        template.subCategory?.name ||
        template.subcategory?.name ||
        "";

      // Search text filter
      const matchesSearch = name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      // Subcategory filter from URL
      const matchesSubcategory =
        !selectedSubcategory ||
        subcategoryName.toLowerCase() ===
        decodeURIComponent(selectedSubcategory).toLowerCase() ||
        template.subcategorySlug?.toLowerCase() ===
        decodeURIComponent(selectedSubcategory).toLowerCase();

      return matchesSearch && matchesSubcategory;
    });
  };
  return (
    <Box sx={{ px: 4, py: 3 }}>
      {/* HEADER */}
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        mb={4}
      >
        <Typography variant="h5" fontWeight={700}>
          Manage Templates
        </Typography>

        <Stack direction="row" spacing={2} alignItems="flex-start">
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
                  {/* SHOW UNIQUE SUBCATEGORY NAMES */}
                  {searchResults.templates?.map((template, index) => {
                    const subcategoryName =
                      template.subcategoryName ||
                      template.subCategory?.name ||
                      template.subcategory?.name ||
                      "Other";

                    const subcategorySlug =
                      template.subcategorySlug ||
                      template.subCategory?.slug ||
                      template.subcategory?.slug ||
                      subcategoryName.toLowerCase().replace(/\s+/g, "-");

                    // Avoid duplicate subcategories
                    const alreadyShown = searchResults.templates
                      .slice(0, index)
                      .some((t) => {
                        const prevName =
                          t.subcategoryName ||
                          t.subCategory?.name ||
                          t.subcategory?.name ||
                          "Other";
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

          {/* ADD TEMPLATE BUTTON */}
          <Button
            variant="contained"
            onClick={() => navigate("/templates/add")}
            sx={{
              minWidth: "auto",
              px: 2,
              height: 40,
              bgcolor: darkMode ? "#1e293b" : "#1976d2",
              borderRadius: 1,
              color: "#fff",
              border: `0.1px solid ${textColor}`,
            }}
          >
            <AddIcon sx={{ mr: 1 }} />
            Add Templates
          </Button>
        </Stack>
      </Stack>
      {/* LOADING */}
      {/* DISPLAY CATEGORIES → SUBCATEGORIES → TEMPLATES */}
      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Typography>No Categories Found</Typography>
        </Paper>
      ) : (
        categories.map((category) => {
          // Get all templates for this category
          const allTemplates = filteredTemplates(
            templatesByCategory[category.slug] || [],
          );

          // Group templates by subcategory
          const groupedBySubcategory = {};

          allTemplates.forEach((template) => {
            const subcategoryName =
              template.subcategoryName ||
              template.subcategory?.name ||
              template.subcategory ||
              "Other";

            if (!groupedBySubcategory[subcategoryName]) {
              groupedBySubcategory[subcategoryName] = [];
            }

            groupedBySubcategory[subcategoryName].push(template);
          });

          // Skip category if no templates
          if (Object.keys(groupedBySubcategory).length === 0) return null;

          return (
            <Box key={category._id} sx={{ mb: 6 }}>
              {/* CATEGORY TITLE */}
              <Typography
                variant="h5"
                fontWeight={700}
                mb={4}
                sx={{
                  bgcolor: darkMode ? "#1e293b" : "#1976d2",
                  color: "#fff",
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  display: "inline-block",
                }}
              >
                {category.name}
              </Typography>

              {/* SUBCATEGORIES */}
              {Object.entries(groupedBySubcategory).map(
                ([subcategoryName, templates]) => (
                  <Box
                    key={`${category._id}-${subcategoryName}`}
                    sx={{
                      px: { xs: 2, sm: 4, md: 3 },
                      py: 2,
                      "& .slick-prev:before, & .slick-next:before": {
                        color: "#1976d2",
                        fontSize: "25px",
                      },
                      "& .slick-prev": {
                        left: "-35px",
                        zIndex: 10,
                      },
                      "& .slick-next": {
                        right: "-30px",
                        zIndex: 10,
                      },
                    }}
                  >
                    {/* SUBCATEGORY TITLE */}
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      mb={2}
                      sx={{
                        color: "#1976d2",
                        borderLeft: "4px solid #1976d2",
                        pl: 2,
                      }}
                    >
                      {subcategoryName}
                    </Typography>

                    {/* TEMPLATE SLIDER */}
                    <Slider {...templateSettings}>
                      {templates.map((template) => (
                        <Box 
                          key={template._id} 
                          sx={{ px: 1, cursor: "pointer" }}
                          onClick={() => handleTemplateClick(template)}
                        >
                          <Card
                            sx={{
                              width: "100%",
                              height: 220,
                              borderRadius: 3,
                              overflow: "hidden",
                              position: "relative",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.02)",
                                boxShadow: 8,
                              },
                            }}
                          >
                            {/* MENU BUTTON */}
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                openMenu(e, template);
                              }}
                              sx={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                zIndex: 2,
                                backgroundColor: "rgba(0,0,0,0.4)",
                                color: "#fff",
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>

                            {/* TEMPLATE IMAGE */}
                            <CardMedia
                              component="img"
                              image={
                                template.imageUrl
                                  ? template.imageUrl.startsWith("http") ? template.imageUrl : `${TEMP_URL}${template.imageUrl}`
                                  : `${TEMP_URL}/uploads/${template.categorySlug || category.slug}/${template.subcategorySlug || subcategoryName}/${template.fileName}`
                              }
                              alt={
                                template.name ||
                                template.subcategoryName ||
                                "Template"
                              }
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                console.log("Image failed to load:", template);
                                e.target.src = "/no-image.png"; // optional fallback image
                              }}
                            />
                          </Card>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            mt={1}
                            textAlign="center"
                            noWrap
                            color={textColor}
                          >
                            {template.name || template.fileName}
                          </Typography>
                        </Box>
                      ))}
                    </Slider>
                  </Box>
                ),
              )}
            </Box>
          );
        })
      )}
      {/* MENU */}
      {/* // Replace your Menu section with this */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={showShotTemplate}>
          <EditIcon sx={{ mr: 1 }} />
          Show Shots
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null); // Close the menu dropdown only, keep activeTemplate
            setEditShotsFiles([]);
            setEditModalOpen(true);
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Edit Shots
        </MenuItem>

        <MenuItem onClick={deleteTemplate} sx={{ color: "red" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* EDIT SHOTS DIALOG */}
      <Dialog
        open={editModalOpen}
        onClose={() => {
          if (!uploadingShots) {
            setEditModalOpen(false);
            setActiveTemplate(null);
          }
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: cardColor,
            color: textColor,
            border: `1px solid ${borderColor}`,
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Edit Template Shots
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: darkMode ? "#94a3b8" : "#4b5563", mb: 3 }}>
            Upload variation shot images for the template: <strong>{activeTemplate?.name || activeTemplate?.fileName}</strong>
          </Typography>

          <Box
            sx={{
              border: `2px dashed ${borderColor}`,
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              "&:hover": {
                borderColor: "#1976d2",
                bgcolor: darkMode ? "rgba(25, 118, 210, 0.08)" : "rgba(25, 118, 210, 0.04)"
              }
            }}
            component="label"
          >
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => setEditShotsFiles(Array.from(e.target.files))}
            />
            <Typography variant="subtitle1" fontWeight={600} color="#1976d2" mb={0.5}>
              Select Shot Images
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Upload multiple variations of this template
            </Typography>
          </Box>

          {editShotsFiles.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Selected Files ({editShotsFiles.length}):
              </Typography>
              <Stack spacing={1} sx={{ maxHeight: 150, overflowY: "auto" }}>
                {editShotsFiles.map((file, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1,
                      bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      borderRadius: 1,
                      border: `1px solid ${borderColor}`
                    }}
                  >
                    <Typography variant="caption" noWrap sx={{ maxWidth: "80%" }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setEditModalOpen(false)}
            disabled={uploadingShots}
            sx={{ color: textColor }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadShots}
            disabled={uploadingShots || editShotsFiles.length === 0}
            sx={{
              bgcolor: "#1976d2",
              color: "#fff",
              "&:hover": {
                bgcolor: "#1565c0"
              }
            }}
          >
            {uploadingShots ? "Saving..." : "Save Shots"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
