import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
  Paper,
  Menu,
  MenuItem,
  Avatar,
  Select,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import HistoryIcon from "@mui/icons-material/History";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AddIcon from "@mui/icons-material/Add";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import CloseIcon from "@mui/icons-material/Close";

import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
// import UserNav from "./UserNav";
import { useThemeContext } from "../context/ThemeContext";
import axios from "axios";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSub, setSelectedSub] = useState("Rings");
  const {
    darkMode,
    toggleTheme,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // NOT LOGGED IN
    if (!token) {
      navigate("/login");
      return;
    }

  }, [navigate]);

  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        const baseUrl = import.meta.env.VITE_API_URL;

        const [catRes, subRes] = await Promise.all([
          axios.get(`${baseUrl}/template-categories`, { headers }),
          axios.get(`${baseUrl}/template-subcategories`, { headers })
        ]);

        setCategories(catRes.data);
        setSubCategories(subRes.data);

        // Pre-select "Jewellery" category if it exists
        const jewelleryCat = catRes.data.find(c => c.name.toLowerCase() === "jewellery");
        if (jewelleryCat) {
          setSelectedCategory(jewelleryCat._id);
        }
      } catch (error) {
        console.error("Error fetching categories and subcategories:", error);
      }
    };

    fetchCategoriesAndSubcategories();
  }, []);



  // Maps the 21 AI-detected jewellery subcategory names → 4 video pill labels
  const VIDEO_SUBCATEGORY_MAP = {
    "RING": "Rings",
    "BANGLE": "Bangles",
    "BRACELET": "Bangles",
    "KADA": "Bangles",
    "PENDANT": "Pendants",
    "PENDANT SET": "Pendants",
    "NECKLACE": "Pendants",
    "NECKLACE SET": "Pendants",
    "CHOKER": "Pendants",
    "MANGALSUTRA": "Pendants",
    "LONG SET": "Pendants",
    "ARTICLE": "Articles",
    "NOSE PIN": "Articles",
    "EARRING": "Articles",
    "TIKA": "Articles",
    "MOGAPPU": "Articles",
    "CHAIN": "Articles",
    "ANKLET": "Articles",
    "HIP BELT": "Articles",
    "HATHPAN": "Articles",
    "BAJUBANDH": "Articles",
  };

  const [videoTemplates, setVideoTemplates] = useState([]);
  const [videoScanLoading, setVideoScanLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(
          `${baseUrl}/templates/disk-templates`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVideoTemplates(response.data);
      } catch (error) {
        console.error("Failed to fetch video templates:", error);
      }
    };

    if (tab === 1) {
      fetchTemplates();
    }
  }, [tab]);
  // --- NAYA CODE START ---
  const fileInputRef = useRef(null);
  const fileInputRefTab0 = useRef(null);
  const [selectedFilesTab0, setSelectedFilesTab0] = useState([]);
  const [previewUrlsTab0, setPreviewUrlsTab0] = useState([]);
  const [loadingTab0, setLoadingTab0] = useState(false);
  const [activeSlotTab0, setActiveSlotTab0] = useState(0);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewUrlsTab0.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrlsTab0]);

  const handleFileChangeTab0 = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updatedFiles = [...selectedFilesTab0];
    const updatedPreviews = [...previewUrlsTab0];

    if (updatedPreviews[activeSlotTab0]) {
      URL.revokeObjectURL(updatedPreviews[activeSlotTab0]);
    }

    updatedFiles[activeSlotTab0] = file;
    updatedPreviews[activeSlotTab0] = URL.createObjectURL(file);

    setSelectedFilesTab0(updatedFiles);
    setPreviewUrlsTab0(updatedPreviews);
    e.target.value = "";
  };

  const handleUploadClickTab0 = (slotIndex = 0) => {
    setActiveSlotTab0(slotIndex);
    fileInputRefTab0.current?.click();
  };

  const handleGenerateTab0 = async () => {
    if (!selectedFilesTab0.length || !selectedFilesTab0[0]) {
      alert("Please upload at least one image.");
      return;
    }

    try {
      setLoadingTab0(true);
      const formData = new FormData();
      formData.append("imageFile", selectedFilesTab0[0]);

      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.VITE_API_URL;

      const res = await axios.post(
        `${baseUrl}/upload/scan-jewellery`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/image-results", {
        state: {
          subcategory: res.data.detectedSubcategory.name,
          category: "Jewellery",
          uploadedImages: previewUrlsTab0,
        },
      });
    } catch (error) {
      console.error("Generation error:", error);
      alert("AI Detection failed. Please try again.");
    } finally {
      setLoadingTab0(false);
    }
  };

  const [uploadStatus, setUploadStatus] = useState({ 1: "", 2: "" }); // Upload dikhane ke liye
  const [uploadedFilePath, setUploadedFilePath] = useState(null);
  const [uploadedImages, setUploadedImages] = useState({ 1: null, 2: null });

  const handleFileUpload = async (event) => {
    if (tab === 0) return;
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imageFile", file);
    const baseUrl = import.meta.env.VITE_API_URL;

    // Tab 1 (Video) → AI scan to auto-select pill
    // Tab 2 (Theme) → plain image upload
    const endpoint = tab === 1
      ? `${baseUrl}/upload/scan-jewellery?mode=video`
      : `${baseUrl}/upload/image?folder=theme_gen`;

    try {
      if (tab === 1) setVideoScanLoading(true);
      setUploadStatus((prev) => ({ ...prev, [tab]: "Analyzing Image... 🧠" }));

      const token = localStorage.getItem("token");
      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });

      if (tab === 1 && response.data.detectedSubcategory) {
        const aiName = response.data.detectedSubcategory.name; // e.g. "Bangles"
        setSelectedSub(aiName);
        setUploadStatus((prev) => ({ ...prev, [tab]: `AI Detected: ${aiName} 💍` }));
      } else {
        setUploadStatus((prev) => ({ ...prev, [tab]: "Upload Successful! 🎉" }));
      }

      setUploadedFilePath(response.data.localPath || response.data.filePath);
      setUploadedImages((prev) => ({
        ...prev,
        [tab]: URL.createObjectURL(file),
      }));

      console.log(`Processed:`, response.data);
    } catch (error) {
      console.error("Upload Error:", error);
      setUploadStatus((prev) => ({ ...prev, [tab]: "Upload/Scan failed! ❌" }));
    } finally {
      if (tab === 1) setVideoScanLoading(false);
      event.target.value = null;
    }
  };

  // 👈 NAYA LOGIC: Image remove karne ke liye
  const handleRemoveImage = (e, currentTab) => {
    e.stopPropagation(); // Isse file input dubara trigger nahi hoga
    setUploadedImages((prev) => ({ ...prev, [currentTab]: null }));
    setUploadStatus((prev) => ({ ...prev, [currentTab]: "" }));
  };
  // --- NAYA CODE END ---

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: bgColor,
        color: textColor,
      }}
    >
      {/* <UserNav /> */}
      {/* ================= BODY ================= */}

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        {/* ================= TABS ================= */}
        <Paper
          sx={{
            bgcolor: cardColor,
            border: "1px solid #e0e0e0",
            borderRadius: "14px",
            px: 1,
            py: 0.5,
            mb: 3,
            boxShadow: "none",
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            TabIndicatorProps={{
              style: {
                backgroundColor: "#c6ff00",
                height: 2,
              },
            }}
            sx={{
              minHeight: "42px",
            }}
          >
            <Tab
              icon={<AutoAwesomeIcon />}
              iconPosition="start"
              label="Image Generation"
              sx={{
                color: textColor,
                textTransform: "none",
                fontWeight: 700,
                minHeight: "42px",
                py: 0.5,
              }}
            />

            <Tab
              icon={<VideocamOutlinedIcon />}
              iconPosition="start"
              label="Video Generation"
              sx={{
                color: textColor,
                textTransform: "none",
                minHeight: "42px",
                py: 0.5,
              }}
            />

            <Tab
              icon={<ColorLensOutlinedIcon />}
              iconPosition="start"
              label="Theme Generation"
              sx={{
                color: textColor,
                textTransform: "none",
                minHeight: "42px",
                py: 0.5,
              }}
            />
          </Tabs>
        </Paper>

        {/* ================= MAIN CONTENT ================= */}

        {tab === 0 && (
          <>
            <Box
              sx={{
                width: "100%",
                border: "1px solid #e0e0e0",
                borderRadius: "24px",
                overflow: "hidden",
                display: "flex",
                bgcolor: cardColor,
              }}
            >
              {/* Left Upload Area */}
              <Box
                sx={{
                  width: "75%",
                  p: 3,
                  borderRight: "1px solid #e0e0e0",
                  minHeight: "430px",
                  height: "430px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  onClick={() => handleUploadClickTab0(0)}
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: "2px dashed #d6d6d6",
                    borderRadius: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                    p: 2,
                    boxSizing: "border-box",
                  }}
                >
                  {previewUrlsTab0.length > 0 ? (
                    <Box
                      component="img"
                      src={previewUrlsTab0[0]}
                      alt="Preview"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: 2,
                        display: "block",
                      }}
                    />
                  ) : (
                    <>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: "#c6ff00",
                          borderRadius: "22px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <CloudUploadRoundedIcon
                          sx={{
                            color: "#000",
                            fontSize: 40,
                          }}
                        />
                      </Box>

                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        Tap to upload
                      </Typography>

                      <Typography sx={{ color: secondaryText, mb: 2 }}>
                        or drag & drop your image here
                      </Typography>

                      <Typography sx={{ color: secondaryText }}>
                        PNG · JPG · WebP · Max 10MB
                      </Typography>
                    </>
                  )}
                </Box>

                <input
                  ref={fileInputRefTab0}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleFileChangeTab0}
                />
              </Box>
              {/* Right Thumbnails */}
              <Box
                sx={{
                  width: "25%",
                  height: "430px",
                  bgcolor: cardColor,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {[1, 2, 3].map((slotIndex) => (
                  <Box
                    key={slotIndex}
                    onClick={() => handleUploadClickTab0(slotIndex)}
                    sx={{
                      flex: 1,
                      borderBottom:
                        slotIndex !== 3 ? "1px solid #e0e0e0" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: previewUrlsTab0[slotIndex]
                        ? "flex-start"
                        : "center",
                      gap: 2,
                      px: 2,
                      cursor: "pointer",
                      bgcolor: cardColor,
                      "&:hover": {
                        bgcolor: bgColor,
                      },
                    }}
                  >
                    {previewUrlsTab0[slotIndex] ? (
                      <>
                        <Box
                          component="img"
                          src={previewUrlsTab0[slotIndex]}
                          alt={`Shot ${slotIndex + 1}`}
                          sx={{
                            width: 70,
                            height: 70,
                            borderRadius: 2,
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />

                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: textColor,
                            }}
                          >
                            Shot {slotIndex + 1}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: secondaryText,
                              maxWidth: 120,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {selectedFilesTab0[slotIndex]?.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{ color: secondaryText }}
                          >
                            {selectedFilesTab0[slotIndex]
                              ? `${(selectedFilesTab0[slotIndex].size / 1024).toFixed(2)} KB`
                              : ""}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: secondaryText,
                        }}
                      >
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            border: "2px dashed #888",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1,
                            fontSize: 24,
                            fontWeight: 300,
                          }}
                        >
                          +
                        </Box>

                        <Typography variant="body2" fontWeight={500}>
                          Add Shot {slotIndex + 1}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Generate Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleGenerateTab0}
                disabled={loadingTab0}
                sx={{
                  bgcolor: "#c6ff00",
                  color: "#000",
                  borderRadius: "50px",
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "16px",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#b7eb00",
                  },
                }}
              >
                {loadingTab0 ? "Generating..." : "Generate"}
              </Button>
            </Box>
          </>
        )}

        {/* ================= VIDEO GENERATION ================= */}

        {tab === 1 && (
          <Paper
            sx={{
              bgcolor: cardColor,
              border: "1px solid #e0e0e0",
              borderRadius: "28px",
              overflow: "hidden",
              minHeight: "700px",
              boxShadow: "none",
            }}
          >
            <Grid container sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}>
              {/* LEFT PANEL */}

              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    p: 2,
                    borderRight: "1px solid #e0e0e0",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      color: textColor,
                      mb: 1,
                    }}
                  >
                    Image to Video
                  </Typography>

                  {/* TAB 1 VIDEO UPLOAD BOX — AI scans and auto-selects pill */}
                  <Box
                    onClick={() =>
                      !uploadedImages[1] && !videoScanLoading && fileInputRef.current.click()
                    }
                    sx={{
                      position: "relative",
                      border: uploadedImages[1] ? "none" : "2px dashed #d6d6d6",
                      borderRadius: "20px",
                      height: "180px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      color: textColor,
                      cursor: uploadedImages[1] || videoScanLoading ? "default" : "pointer",
                      "&:hover": {
                        borderColor: uploadedImages[1] || videoScanLoading ? "none" : "#c6ff00",
                      },
                      mb: 3,
                      overflow: "hidden",
                    }}
                  >
                    {uploadedImages[1] ? (
                      <>
                        <img
                          src={uploadedImages[1]}
                          alt="Video Ref"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {/* AI Detected Badge */}
                        {uploadStatus[1] && (
                          <Box sx={{
                            position: "absolute",
                            bottom: 0, left: 0, right: 0,
                            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                            px: 1.5, py: 1,
                          }}>
                            <Typography sx={{ color: "#c6ff00", fontWeight: 700, fontSize: "12px" }}>
                              {uploadStatus[1]}
                            </Typography>
                          </Box>
                        )}
                        <Box
                          onClick={(e) => handleRemoveImage(e, 1)}
                          sx={{
                            position: "absolute",
                            top: 10, right: 10,
                            bgcolor: "black", color: "white",
                            borderRadius: "50%", width: 28, height: 28,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", zIndex: 10,
                            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </>
                    ) : videoScanLoading ? (
                      /* Scanning state */
                      <>
                        <Box sx={{
                          width: 52, height: 52, mb: 1.5,
                          border: "3px solid #c6ff00",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                          "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
                        }} />
                        <Typography fontWeight={700} fontSize={14}>Analyzing Image... 🧠</Typography>
                        <Typography variant="body2" sx={{ color: secondaryText, mt: 0.5 }}>AI is scanning your jewellery</Typography>
                      </>
                    ) : (
                      <>
                        <CloudUploadRoundedIcon sx={{ fontSize: 50, mb: 2 }} />
                        <Typography fontWeight={700}>
                          {uploadStatus[1] ? uploadStatus[1] : "DROP OR CLICK TO UPLOAD"}
                        </Typography>
                        {!uploadStatus[1] && (
                          <Typography variant="body2" sx={{ color: secondaryText }}>
                            AI will auto-detect & filter videos 🤖
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>

                  {/* PROMPT */}

                  <Paper
                    sx={{
                      bgcolor: cardColor,
                      border: "1px solid #e0e0e0",
                      borderRadius: "16px",
                      overflow: "hidden",
                      mb: 3,
                      boxShadow: "none",
                    }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: "1px solid #e0e0e0",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        sx={{
                          color: textColor,
                          fontWeight: 700,
                        }}
                      >
                        VIDEO PROMPT
                      </Typography>

                      <Typography
                        sx={{
                          color: "#7cb518",
                          fontWeight: 700,
                        }}
                      >
                        62 credits
                      </Typography>
                    </Box>
                    <textarea
                      placeholder="Describe the video you want to generate..."
                      style={{
                        width: "100%",
                        height: "220px",
                        background: cardColor,
                        border: "none",
                        outline: "none",
                        color: textColor,
                        padding: "20px",
                        resize: "none",
                        fontSize: "16px",
                        borderBottom: "1px solid #e0e0e0",
                        boxSizing: "border-box",
                      }}
                    />
                  </Paper>
                  {/* OPTIONS */}

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-start",
                      flexWrap: "nowrap",
                      mb: 2,
                    }}
                  >
                    {/* DURATION */}

                    <Box sx={{ width: "180px" }}>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: textColor,
                          mb: 1,
                          fontWeight: 700,
                        }}
                      >
                        Duration
                      </Typography>

                      <Paper
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "14px",
                          px: 2,
                          py: 1,
                          boxShadow: "none",
                        }}
                      >
                        <Typography fontWeight={600} fontSize={12}>
                          5s
                        </Typography>
                      </Paper>
                    </Box>

                    {/* VIDEO MODEL */}

                    <Box sx={{ width: "160px" }}>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: textColor,
                          mb: 1,
                          fontWeight: 700,
                        }}
                      >
                        Video Model
                      </Typography>

                      <Paper
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "14px",
                          px: 2,
                          py: 1,
                          boxShadow: "none",
                        }}
                      >
                        <Typography fontWeight={600} fontSize={12}>
                          Turbo Standard
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>

                  {/* BUTTON */}

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: "#c68b45",
                      color: cardColor,
                      borderRadius: "16px",
                      py: 2,
                      fontWeight: 700,
                      fontSize: "18px",
                      "&:hover": {
                        bgcolor: "#b57a35",
                      },
                    }}
                  >
                    GENERATE 5S VIDEO • 62
                  </Button>
                </Box>
              </Grid>

              {/* RIGHT PANEL */}

              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    p: 3,
                  }}
                >
                  <Typography
                    sx={{
                      color: textColor,
                      fontWeight: 700,
                      mb: 3,
                      letterSpacing: 1,
                    }}
                  >
                    VIDEO TEMPLATES
                  </Typography>

                  {/* CATEGORY */}

                  <Stack direction="row" spacing={2} mb={3}>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: "#c6ff00",
                        color: "#7cb518",
                        borderRadius: "14px",
                      }}
                    >
                      Jewellery
                    </Button>

                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: borderColor,
                        color: textColor,
                        borderRadius: "14px",
                      }}
                    >
                      Fashion
                    </Button>
                  </Stack>
                  {/* SUB CATEGORY PILLS — hardcoded list */}
                  <Stack
                    direction="row"
                    spacing={2}
                    mb={3}
                    sx={{ overflowX: "auto", pb: 1 }}
                  >
                    {["Rings", "Pendants", "Bangles", "Articles"].map(
                      (item) => {
                        const isActive = selectedSub.toLowerCase().trim() === item.toLowerCase().trim();
                        return (
                          <Button
                            key={item}
                            variant="outlined"
                            onClick={() => setSelectedSub(item)}
                            sx={{
                              borderColor: isActive ? "#c6ff00" : borderColor,
                              color: isActive ? "#7cb518" : textColor,
                              borderRadius: "14px",
                              textTransform: "none",
                              fontWeight: isActive ? 700 : 500,
                              whiteSpace: "nowrap",
                              "&:hover": {
                                borderColor: "#c6ff00",
                                bgcolor: "transparent",
                              },
                            }}
                          >
                            {item}
                          </Button>
                        );
                      }
                    )}
                  </Stack>

                  {/* TEMPLATE CARDS */}

                  <Grid container spacing={2}>
                    {videoTemplates.filter(
                      (t) =>
                        t.subcategoryName &&
                        t.subcategoryName.toLowerCase().trim() === selectedSub.toLowerCase().trim()
                    ).length > 0 ? (
                      videoTemplates
                        .filter(
                          (t) =>
                            t.subcategoryName &&
                            t.subcategoryName.toLowerCase().trim() === selectedSub.toLowerCase().trim()
                        )
                        .map((item, index) => (
                          <Grid item xs={12} sm={6} md={4} key={item._id}>
                            <Paper
                              sx={{
                                bgcolor: cardColor,
                                borderRadius: "18px",
                                overflow: "hidden",
                                border: "1px solid #e0e0e0",
                                boxShadow: "none",
                              }}
                            >
                              {/* VIDEO PLAYER BOX */}
                              <Box
                                sx={{
                                  height: 250,
                                  aspectRatio: "9/16",
                                  bgcolor: "#000",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  overflow: "hidden",
                                  mx: "auto",
                                }}
                              >
                                <video
                                  width="100%"
                                  height="100%"
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  style={{ objectFit: "cover" }}
                                  onError={(e) => console.error("Video failed:", e.target.src)}
                                  src={item.videoUrl || ""}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </Box>

                              <Box p={2}>
                                <Typography
                                  sx={{
                                    color: "#c68b45",
                                    fontWeight: 700,
                                    fontSize: "14px",
                                  }}
                                >
                                  {item.subcategoryName
                                    ? item.subcategoryName.toUpperCase()
                                    : `TEMPLATE ${index + 1}`}
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        ))
                    ) : (
                      <Typography sx={{ p: 2, color: secondaryText, width: "100%", textAlign: "center", mt: 2 }}>
                        No templates found for this subcategory.
                      </Typography>
                    )}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* ================= THEME GENERATION ================= */}

        {tab === 2 && (
          <>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                color: textColor,
                mb: 0.8,
              }}
            >
              Theme Generator
            </Typography>

            <Typography
              sx={{
                color: secondaryText,
                mb: 3,
              }}
            >
              Generate a new theme from a reference image using AI.
            </Typography>

            <Paper
              sx={{
                bgcolor: cardColor,
                border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"}`,
                borderRadius: "20px",
                p: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  width: "100%",
                  alignItems: "stretch",
                }}
              >
                {/* LEFT SECTION (50% Split) */}
                <Box
                  sx={{
                    width: { xs: "100%", md: "50%" },
                    pr: { xs: 0, md: 4 },
                    pb: { xs: 4, md: 0 },
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 2.5,
                    }}
                  >
                    {/* MAIN CATEGORY */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{ color: textColor, mb: 1, fontWeight: 700, fontSize: "0.85rem", opacity: 0.9 }}
                      >
                        MAIN CATEGORY
                      </Typography>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedSubCategory("");
                        }}
                        displayEmpty
                        sx={{
                          width: "100%",
                          height: "46px",
                          bgcolor: cardColor,
                          borderRadius: "12px",
                          color: textColor,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: darkMode ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#c6ff00",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#c6ff00",
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          Main Category
                        </MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>

                    {/* SUB CATEGORY */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{ color: textColor, mb: 1, fontWeight: 700, fontSize: "0.85rem", opacity: 0.9 }}
                      >
                        SUB CATEGORY <span style={{ color: "#ef4444" }}>*</span>
                      </Typography>
                      <Select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        displayEmpty
                        sx={{
                          width: "100%",
                          height: "46px",
                          bgcolor: cardColor,
                          borderRadius: "12px",
                          color: textColor,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: darkMode ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#c6ff00",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#c6ff00",
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          Select Category
                        </MenuItem>
                        {subCategories
                          .filter((sub) => sub.categoryId === selectedCategory)
                          .map((sub) => (
                            <MenuItem key={sub._id} value={sub._id}>
                              {sub.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      color: textColor,
                      mb: 1,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      opacity: 0.9,
                    }}
                  >
                    Custom Instructions (Optional)
                  </Typography>

                  <textarea
                    placeholder="Enter specific details you'd like the AI to include in the theme..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    style={{
                      width: "100%",
                      flex: 1,
                      minHeight: "260px",
                      background: cardColor,
                      border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1"}`,
                      borderRadius: "14px",
                      color: textColor,
                      padding: "16px 20px",
                      fontSize: "0.95rem",
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                      resize: "none",
                      outline: "none",
                      transition: "border-color 0.25s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#c6ff00"}
                    onBlur={(e) => e.target.style.borderColor = darkMode ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1"}
                  />
                </Box>

                {/* VERTICAL DIVIDER LINE */}
                <Box
                  sx={{
                    width: "1px",
                    alignSelf: "stretch",
                    bgcolor: darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                    display: { xs: "none", md: "block" },
                  }}
                />

                {/* RIGHT SECTION (50% Split) */}
                <Box
                  sx={{
                    width: { xs: "100%", md: "50%" },
                    pl: { xs: 0, md: 4 },
                    pt: { xs: 4, md: 0 },
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                  }}
                >
                  <Typography
                    sx={{
                      color: textColor,
                      fontWeight: 700,
                      mb: 1,
                      fontSize: "0.85rem",
                      opacity: 0.9,
                    }}
                  >
                    Reference Image <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>

                  <Box
                    onClick={() =>
                      !uploadedImages[2] && fileInputRef.current.click()
                    }
                    sx={{
                      position: "relative",
                      border: uploadedImages[2] ? "none" : `2px dashed ${darkMode ? "rgba(255, 255, 255, 0.15)" : "#cbd5e1"}`,
                      cursor: uploadedImages[2] ? "default" : "pointer",
                      borderRadius: "16px",
                      flex: 1,
                      minHeight: "260px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      bgcolor: darkMode ? "rgba(255, 255, 255, 0.015)" : "#f8fafc",
                      width: "100%",
                      overflow: "hidden",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        borderColor: uploadedImages[2] ? "none" : "#c6ff00",
                        bgcolor: darkMode ? "rgba(255, 255, 255, 0.025)" : "#f1f5f9",
                      }
                    }}
                  >
                    {uploadedImages[2] ? (
                      <>
                        <img
                          src={uploadedImages[2]}
                          alt="Theme Ref"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <Box
                          onClick={(e) => handleRemoveImage(e, 2)}
                          sx={{
                            position: "absolute",
                            top: 15,
                            right: 15,
                            bgcolor: "black",
                            color: "white",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 10,
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 20 }} />
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box
                          sx={{
                            width: 72,
                            height: 72,
                            bgcolor: darkMode ? "rgba(2, 132, 199, 0.15)" : "#e0f2fe",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <CloudUploadRoundedIcon
                            sx={{ fontSize: 36, color: "#0284c7" }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          sx={{ color: textColor, mb: 0.8, fontSize: "1.05rem", fontFamily: "'Outfit', 'Inter', sans-serif" }}
                        >
                          {uploadStatus[2]
                            ? uploadStatus[2]
                            : "Drop your reference here"}
                        </Typography>
                        <Typography
                          sx={{ color: secondaryText, textAlign: "center", fontSize: "0.85rem", fontFamily: "'Outfit', 'Inter', sans-serif" }}
                        >
                          Supports JPG, PNG, WEBP & HEIC
                        </Typography>
                        <Typography
                          sx={{ color: secondaryText, textAlign: "center", fontSize: "0.8rem", mt: 0.3, opacity: 0.8, fontFamily: "'Outfit', 'Inter', sans-serif" }}
                        >
                          (Max size 16MB)
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Box sx={{ mt: 2.5 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={isGenerating || !uploadedImages[2] || !selectedSubCategory}
                      sx={{
                        bgcolor: darkMode ? "rgba(255, 255, 255, 0.08)" : "#cbd5e1",
                        color: darkMode ? "rgba(255, 255, 255, 0.5)" : "#475569",
                        borderRadius: "30px",
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        textTransform: "none",
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.2,
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        "&:hover": {
                          bgcolor: darkMode ? "rgba(255, 255, 255, 0.12)" : "#94a3b8",
                          transform: "translateY(-1px)",
                        },
                        "&.Mui-disabled": {
                          bgcolor: darkMode ? "rgba(255, 255, 255, 0.04)" : "#e2e8f0",
                          color: darkMode ? "rgba(255, 255, 255, 0.25)" : "#94a3b8"
                        }
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                      Generate Theme
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: "#facc15",
                          color: "#78350f",
                          fontSize: "11px",
                          fontWeight: 800,
                          boxShadow: "0 0 10px rgba(250, 204, 21, 0.4)",
                          ml: 1,
                        }}
                      >
                        $
                      </Box>
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>299</span>
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </>
        )}


      </Container>
    </Box>
  );
}
