import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  IconButton,
  MenuItem,
  CircularProgress,
  Menu,
  Stack,
  Button,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { Canvas, FabricImage, util as fabricUtil, Point } from "fabric";
import { Edit, Favorite } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRef } from "react";
import { Badge, Tabs, Tab } from "@mui/material";
import { hydrateCanvasWithVideos } from "../components/helpers";
import { useThemeContext } from "../context/ThemeContext";
import Favorites from "./Favorites";
import MyFlipbooks from "./MyFlipBooks";

function MyDesignsTab() {
  const isSavingRef = useRef(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const [designs, setDesigns] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeDesign, setActiveDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // 0 → 100%
  const videoRef = useRef(null);
  const addedVideosRef = useRef(new Set());
  const hiddenContainersRef = useRef([]);

  const {
    darkMode,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  /* ---------- MENU ---------- */
  const openMenu = (e, design) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setActiveDesign(design);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setActiveDesign(null);
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    if (!token) return navigate("/login");

    try {
      const res = await axios.get(`${API_URL}/user-designs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Only set designs if the array has items
      if (res.data && res.data.length > 0) {
        setDesigns(res.data);
      } else {
        setDesigns([]);
      }
    } catch (err) {
      console.error("Failed to load designs", err);
      alert(err.response?.data?.message || "Failed to load designs ❌");
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      setDownloading(false);
      setDownloadProgress(0);
      addedVideosRef.current.clear();
      hiddenContainersRef.current.forEach((c) => c.remove());
      hiddenContainersRef.current = [];
    };
  }, []);

  const downloadDesign = async () => {
    hiddenContainersRef.current = [];

    const canvasEl = document.createElement("canvas");
    const canvas = new Canvas(canvasEl, {
      width: activeDesign.width,
      height: activeDesign.height,
    });
    canvas.preserveObjectStacking = true;
    canvas.renderOnAddRemove = false;

    // Helper to add video back
    addedVideosRef.current = new Set();

    const addVideoToCanvas = async (videoUrl, reviveData) => {
      const key = reviveData?.videoId || videoUrl; // fallback if ever missing

      const existing = canvas.getObjects().find((o) => o.videoId === key);
      if (existing) return existing;

      addedVideosRef.current.add(key);

      const videoEl = document.createElement("video");
      videoEl.crossOrigin = "anonymous";
      videoEl.src = videoUrl;
      videoEl.preload = "auto";
      videoEl.playsInline = true;
      videoRef.current = videoEl;
      videoEl.muted = false;
      // videoEl.volume = 0;

      const container = document.createElement("div");
      hiddenContainersRef.current.push(container);
      container.style.position = "absolute";
      container.style.width = "0";
      container.style.height = "0";
      container.style.overflow = "hidden";
      document.body.appendChild(container);
      container.appendChild(videoEl);

      // Wait for metadata
      await new Promise((res) => {
        if (videoEl.readyState >= 1) res();
        else videoEl.onloadedmetadata = res;
      });

      // 🔥 Force-decode the first frame properly
      await new Promise((resolve) => {
        const ensureFrame = () => {
          if (videoEl.readyState >= 2) {
            resolve();
          } else {
            requestAnimationFrame(ensureFrame);
          }
        };

        // Seek to 0 to force frame decode
        try {
          videoEl.currentTime = 0;
        } catch {}

        // Load & try to play silently to trigger decode
        videoEl.muted = false; // only for decode
        const p = videoEl.play();
        if (p && p.catch) p.catch(() => {});
        videoEl.pause();

        ensureFrame();
      });

      const fabricVideo = new FabricImage(videoEl, {
        left: reviveData.left,
        top: reviveData.top,
        scaleX: reviveData.scaleX,
        scaleY: reviveData.scaleY,
        angle: reviveData.angle || 0,
        opacity: reviveData?.opacity || 1,
        originX: reviveData.originX || "left",
        originY: reviveData.originY || "top",
        selectable: false,
        evented: false,
        objectCaching: false,
        cacheProperties: [],
        width: reviveData.width || videoEl.videoWidth,
        height: reviveData.height || videoEl.videoHeight,
        zIndex: reviveData?.zIndex,
      });

      if (!reviveData) {
        const scaleX = (canvas.width * 0.7) / videoEl.videoWidth;
        const scaleY = (canvas.height * 0.7) / videoEl.videoHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        fabricVideo.scale(scale);
      }

      if (reviveData?.clipPath) {
        const clip = await fabricUtil
          .enlivenObjects([reviveData.clipPath])
          .then((arr) => arr[0]);

        clip.set({
          absolutePositioned: true,
          objectCaching: false,
          selectable: false,
          evented: false,
          originX: reviveData.clipPath.originX || "center",
          originY: reviveData.clipPath.originY || "center",
        });

        fabricVideo.clipPath = clip;

        fabricVideo.setCoords();
        fabricVideo.clipPath.setCoords();
      }

      fabricVideo._render = function (ctx) {
        const el = this._element;
        if (!el) return;
        ctx.save();

        // Apply clipPath if exists
        if (this.clipPath) {
          ctx.save();
          this.clipPath.render(ctx);
          ctx.clip();
          ctx.restore();
        }

        // Compute offsets for origin and scale
        let offsetX = 0;
        let offsetY = 0;

        switch (this.originX) {
          case "center":
            offsetX = -this.width / 2;
            break;
          case "right":
            offsetX = -this.width;
            break;
        }

        switch (this.originY) {
          case "center":
            offsetY = -this.height / 2;
            break;
          case "bottom":
            offsetY = -this.height;
            break;
        }

        try {
          // Draw the video scaled to Fabric width/height
          ctx.drawImage(
            el,
            0, // sourceX
            0, // sourceY
            el.videoWidth, // sourceWidth
            el.videoHeight, // sourceHeight
            offsetX, // destX
            offsetY, // destY
            this.width,
            this.height,
          );
        } catch (e) {
          console.warn("Video render failed", e);
        }

        ctx.restore();
      };

      fabricVideo.set({
        noScaleCache: true,
        objectCaching: false,
        dirty: true,
      });

      fabricVideo._element = videoEl;
      fabricVideo.isVideo = true;
      fabricVideo.videoSrc = reviveData.videoSrc;
      fabricVideo.zIndex = reviveData.zIndex;

      if (fabricVideo.clipPath) {
        fabricVideo.clipPath.set({
          absolutePositioned: true,
          objectCaching: false,
        });
      }

      // 🔥 OVERRIDE Fabric's bounding box math (this kills the gap)
      fabricVideo._getNonTransformedDimensions = function () {
        return new Point(this.width, this.height);
      };

      fabricVideo._getTransformedDimensions = function () {
        return new Point(this.width * this.scaleX, this.height * this.scaleY);
      };

      fabricVideo.setCoords();

      canvas.add(fabricVideo);

      const z = reviveData?.zIndex;
      if (Number.isInteger(z)) {
        canvas.moveObjectTo(fabricVideo, z);
      }

      return fabricVideo;
    };

    const restoreZOrder = () => {
      const objs = canvas.getObjects();
      const sorted = [...objs].sort(
        (a, b) => (a.zIndex || 0) - (b.zIndex || 0),
      );
      sorted.forEach((obj, i) => canvas.moveObjectTo(obj, i));
    };

    const videoObjects = await hydrateCanvasWithVideos({
      canvas,
      canvasJson: activeDesign.canvasJson,
      addVideoToCanvas,
      restoreZOrder,
      addedVideosRef,
    });

    // 🔁 Force one render tick before recording
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => setTimeout(r, 100));
    canvas.requestRenderAll();

    if (videoObjects.length > 0) {
      setDownloading(true);
      setDownloadProgress(0);

      // Wait for all videos to have at least one frame ready

      await Promise.all(
        videoObjects.map(
          (v) =>
            new Promise((resolve) => {
              const vid = v._element;

              if (vid.readyState >= 3) resolve();
              else vid.onloadeddata = resolve;
            }),
        ),
      );

      // Get max duration
      const durations = videoObjects.map((v) =>
        Number.isFinite(v._element.duration) && v._element.duration > 0
          ? v._element.duration
          : 3,
      );
      const maxDuration = Math.max(...durations);
      // Prepare videos
      videoObjects.forEach((v) => {
        const vid = v._element;
        vid.pause();
        vid.currentTime = 0;
        vid.loop = false;
        vid.muted = false;
        vid.playbackRate = 1;

        v._finished = false;
      });

      // Wait one frame so seeks apply
      await new Promise((r) => requestAnimationFrame(r));

      // Capture canvas
      const canvasStream = canvas.getElement().captureStream(30);

      // 🔊 AUDIO MIX (CORRECT WAY)
      const audioCtx = new AudioContext();
      const destination = audioCtx.createMediaStreamDestination();

      const audioSources = [];

      videoObjects.forEach((v) => {
        const vid = v._element;

        try {
          const source = audioCtx.createMediaElementSource(vid);
          source.connect(destination);
          audioSources.push(source); // ⭐ store it
        } catch (err) {
          console.warn("Audio source already connected", err);
        }

        // Mute for browser playback
        vid.muted = false;
        // vid.volume = 0;
        vid.play().catch(() => {});
      });

      // Combine streams
      const mixedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);

      const recorder = new MediaRecorder(mixedStream, {
        mimeType: "video/webm; codecs=vp8,opus",
        videoBitsPerSecond: 8_000_000,
      });

      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);

      // Start recorder
      await audioCtx.resume();

      await Promise.all(
        videoObjects.map((v) => v._element.play().catch(() => {})),
      );

      await new Promise((r) => requestAnimationFrame(r));

      // Start recorder
      recorder.start();

      const recordStartTime = performance.now();

      let progressRaf;
      const updateProgress = () => {
        const elapsed = (performance.now() - recordStartTime) / 1000;
        const percent = Math.min((elapsed / maxDuration) * 100, 100);
        setDownloadProgress(percent);

        if (percent < 100) {
          progressRaf = requestAnimationFrame(updateProgress);
        }
      };
      updateProgress();

      // // Start videos
      await Promise.all(
        videoObjects.map((v) => v._element.play().catch(() => {})),
      );

      // Ensure all videos are ready
      await Promise.all(
        videoObjects.map(
          (v) =>
            new Promise((res) => {
              const vid = v._element;
              if (vid.readyState >= 2) res();
              else {
                vid.onloadeddata = res;
                setTimeout(res, 5000); // fallback: 5s max wait
              }
            }),
        ),
      );

      // Flag to stop frame loop
      let stopped = false;

      const startTime = performance.now();

      const renderLoop = () => {
        if (stopped) return;

        const elapsed = (performance.now() - startTime) / 1000;

        // keep last frame for finished videos
        videoObjects.forEach((v) => {
          const vid = v._element;

          const EPS = 0.05;

          if (!v._finished && vid.duration - vid.currentTime <= EPS) {
            v._finished = true;

            try {
              vid.currentTime = Math.max(0, vid.duration - 0.001);
            } catch {}

            vid.pause();

            videoObjects.playbackRate = 0;

            v.dirty = true;
          }
        });

        canvas.renderAll();

        if (elapsed < maxDuration) {
          requestAnimationFrame(renderLoop);
        } else {
          stopped = true;
          recorder.stop();
        }
      };

      renderLoop();

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Design.webm";
        a.click();
        URL.revokeObjectURL(url);
        setDownloadProgress(100);

        audioSources.forEach((s) => {
          try {
            s.disconnect();
          } catch {}
        });

        audioCtx.close();
        setTimeout(() => {
          setDownloading(false);
          setDownloadProgress(0);
          canvas.dispose();
          hiddenContainersRef.current.forEach((c) => c.remove());
          addedVideosRef.current.clear();
        }, 1000);
        alert("Downloaded successfully!");
      };
    } else {
      // PNG download
      setDownloading(true);
      setDownloadProgress(0);

      await new Promise((r) => setTimeout(r, 50));
      setDownloadProgress(30);

      await hydrateCanvasWithVideos({
        canvas,
        canvasJson: activeDesign.canvasJson,
        addVideoToCanvas,
        restoreZOrder,
        addedVideosRef,
      });

      canvas.renderAll();
      await new Promise((r) => requestAnimationFrame(r));

      // Give images time to resolve (important for external URLs)
      setTimeout(() => {
        const dataURL = canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
          enableRetinaScaling: true,
        });

        setTimeout(() => {
          setDownloadProgress(100);
        }, 1000);

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "Design.png";
        link.click();

        canvas.dispose();

        setTimeout(() => {
          setDownloading(false);
          setDownloadProgress(0);
        }, 600);

        alert("Downloaded successfully!");
      }, 100);
    }
  };

  /* ---------- DELETE ---------- */

  const deleteDesign = async () => {
    if (!activeDesign) return;

    if (window.confirm(`Are you sure you want to delete this design ?`)) {
      try {
        await axios.delete(`${API_URL}/user-designs/${activeDesign._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDesigns((prev) => prev.filter((d) => d._id !== activeDesign._id));

        alert("Deleted saved successfully 🎉");
      } catch (error) {
        console.error("Error deleting design", error);
        alert(error.message || "Failed to delete!");
      }
    }
  };

  const createFlipbook = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/flipbooks`,
        {
          designIds: selectedIds,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const flipbookId = res.data._id;

      navigate(`/magazines/${flipbookId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create magazine ❌");
    }
  };

  const saveToFavorites = async () => {
    if (!activeDesign) return;

    if (isSavingRef.current) return;
    isSavingRef.current = true;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      throw new Error("Not authenticated");
    }

    try {
      await axios.post(
        `${API_URL}/favorites`,
        {
          // ✅ SAVE TEMPLATE INFO
          canvasJson: activeDesign.canvasJson,
          templateId: activeDesign.templateId,
          templateType: activeDesign.type || "post",
          width: activeDesign.width,
          height: activeDesign.height,
          thumbnail: activeDesign.thumbnail,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Added to favorites!");
    } catch (err) {
      console.error("Save to favorites failed:", err);

      const message =
        err.response?.data?.message || "Failed to save design to favorites";

      alert(message);
    } finally {
      isSavingRef.current = false;
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await axios.post(`${API_URL}/flipbooks/pdf`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const flipbookId = res.data._id;
      navigate(`/magazines/${flipbookId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create magazine from PDF ❌");
    } finally {
      e.target.value = ""; // allow re-upload same file
    }
  };

  return (
    <Box sx={{ px: 4, py: 3 }}>
      {downloading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            pointerEvents: "all",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Downloading... {Math.floor(downloadProgress)}%
          </Typography>
          <Box
            sx={{
              width: "60%",
              height: 10,
              bgcolor: "rgba(255,255,255,0.3)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${downloadProgress}%`,
                height: "100%",
                bgcolor: "primary.main",
                transition: "width 0.1s linear",
              }}
            />
          </Box>
        </Box>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent={"space-between"}
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <input
            type="file"
            accept="application/pdf"
            hidden
            ref={fileInputRef}
            onChange={handlePdfUpload}
          />

          {/* Create Magazine By PDF */}
          <Button
            variant="contained"
            onClick={() => fileInputRef.current.click()}
            sx={{
              bgcolor: darkMode ? "#1e293b" : "#1976d2",
              color: "#fff",
              border: `1px solid ${textColor}`,
              "&:hover": {
                bgcolor: darkMode ? "#334155" : "#1565c0",
              },
            }}
          >
            Create Magazine By PDF
          </Button>

          {/* Create Magazine By Image */}
          <Button
            variant="contained"
            disabled={selectedIds.length < 2}
            onClick={createFlipbook}
            sx={{
              bgcolor: darkMode ? "#1e293b" : "#1976d2",
              color: "#fff",
              border: `1px solid ${textColor}`,
              "&:hover": {
                bgcolor: darkMode ? "#334155" : "#1565c0",
              },
              "&.Mui-disabled": {
                bgcolor: darkMode ? "#ffffff" : "#90caf9",
                color: darkMode ? "#94a3b8" : "#ffffff",
                border: `1px solid ${darkMode ? "#475569" : "#90caf9"}`,
              },
            }}
          >
            Create Magazine By Image ({selectedIds.length})
          </Button>
        </Box>
      </Stack>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      ) : designs.length === 0 ? (
        <Box
          sx={{
            py: 10,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="h6">No designs yet</Typography>

          <Typography variant="body2">
            Start creating and your designs will appear here
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {designs.map((design) => {
            const isSelected = selectedIds.includes(design._id);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={design._id}>
                <Badge
                  badgeContent={
                    isSelected ? (
                      <CheckCircleIcon
                        sx={{
                          color: "background.paper",
                          bgcolor: "primary.main",
                          borderRadius: "50%",
                          boxShadow: 2,
                          fontSize: 22,
                        }}
                      />
                    ) : null
                  }
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  sx={{
                    width: "100%",
                    // "& .MuiBadge-badge": {
                    //   position: "absolute",
                    //   top: -10,
                    //   right: -12,
                    //   transform: "none",
                    //   zIndex: 3,
                    // },
                  }}
                >
                  <Card
                    onClick={() => toggleSelect(design._id)}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      border: isSelected
                        ? "3px solid"
                        : "2px solid transparent",
                      borderColor: isSelected ? "primary.main" : "transparent",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: 6,
                      },
                    }}
                  >
                    {/* MENU */}
                    <IconButton
                      size="small"
                      onClick={(e) => openMenu(e, design)}
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        zIndex: 2,
                        bgcolor: "grey.700", // gray background
                        color: "#fff", // white icon
                        opacity: 0.7, // slightly light

                        "&:hover": {
                          bgcolor: "grey.800",
                          opacity: 0.9,
                        },
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>

                    {/* Thumbnail */}
                    <CardMedia
                      component="img"
                      height="200"
                      image={design.thumbnail}
                      alt="Design"
                    />

                    {isSelected && (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: "rgba(25,118,210,0.15)",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </Card>
                </Badge>
              </Grid>
            );
          })}
        </Grid>
      )}
      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            closeMenu();
            downloadDesign();
          }}
        >
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            navigate(`/design/edit/${activeDesign._id}`);
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            saveToFavorites();
          }}
        >
          <Favorite fontSize="small" sx={{ mr: 1 }} />
          Add To Favorite
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            deleteDesign();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default function UserDesigns() {
  const [tabValue, setTabValue] = useState(0);
  const { darkMode, bgColor, textColor, borderColor } = useThemeContext();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: bgColor, minHeight: "100vh", p: { xs: 2, sm: 4 } }}>
      {/* Title */}
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          background: "linear-gradient(45deg, #1976d2, #c6ff00)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 3,
          fontFamily: "'Outfit', 'Inter', sans-serif",
        }}
      >
        My Workspace
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: borderColor, mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTabs-indicator": {
              background: "linear-gradient(90deg, #1976d2 0%, #c6ff00 100%)",
              height: 3,
              borderRadius: "3px",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1rem",
              fontFamily: "'Outfit', sans-serif",
              color: textColor,
              opacity: 0.7,
              minWidth: 120,
              transition: "all 0.25s ease",
              "&:hover": {
                opacity: 1,
              },
              "&.Mui-selected": {
                color: "#1976d2",
                opacity: 1,
              },
            },
          }}
        >
          <Tab label="My Designs" />
          <Tab label="Favorites" />
          <Tab label="Magazines" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {tabValue === 0 && <MyDesignsTab />}
      {tabValue === 1 && <Favorites isTab={true} />}
      {tabValue === 2 && <MyFlipbooks isTab={true} />}
    </Box>
  );
}
