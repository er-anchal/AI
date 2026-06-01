import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

import axios from "axios";
import { Canvas, FabricImage, util as fabricUtil, Point } from "fabric";
import { useNavigate } from "react-router-dom";
import { hydrateCanvasWithVideos } from "../components/helpers";

const Favorites = ({ isTab }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFav, setSelectedFav] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // 0 → 100%
  const videoRef = useRef(null);
  const addedVideosRef = useRef(new Set());
  const hiddenContainersRef = useRef([]);

  const open = Boolean(anchorEl);

  const handleMenuOpen = (event, fav) => {
    setAnchorEl(event.currentTarget);
    setSelectedFav(fav);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFav(null);
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchFavorites = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/favorites`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setFavorites(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const deleteFavorite = async (id) => {
    if (!window.confirm("Remove from favorites?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/favorites/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavorites((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert("Failed to delete");
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

  const downloadFavorite = async (fav) => {
    hiddenContainersRef.current = [];

    const canvasEl = document.createElement("canvas");
    const canvas = new Canvas(canvasEl, {
      width: fav.width,
      height: fav.height,
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
        } catch { }

        // Load & try to play silently to trigger decode
        videoEl.muted = false; // only for decode
        const p = videoEl.play();
        if (p && p.catch) p.catch(() => { });
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
      canvasJson: fav.canvasJson,
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
      console.log(maxDuration);
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
        vid.play().catch(() => { });
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
        videoObjects.map((v) => v._element.play().catch(() => { })),
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
        videoObjects.map((v) => v._element.play().catch(() => { })),
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
            } catch { }

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
        a.download = "Favorite.webm";
        a.click();
        URL.revokeObjectURL(url);
        setDownloadProgress(100);

        audioSources.forEach((s) => {
          try {
            s.disconnect();
          } catch { }
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
        canvasJson: fav.canvasJson,
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
        link.download = "Favorite.png";
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

  return (
    <Box sx={{ p: isTab ? 0 : 3 }}>
      {!isTab && (
        <Typography variant="h5" fontWeight={700} mb={3} textAlign={"center"}>
          My Favorite Designs
        </Typography>
      )}
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
      {loading ? (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : favorites.length === 0 ? (
        <Typography>No favorites yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((fav) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={fav._id}>
              <Card sx={{ position: "relative" }}>
                {/* Menu Icon */}
                <IconButton
                  onClick={(e) => handleMenuOpen(e, fav)}
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
                  // height="180"
                  // width="180"
                  image={fav.thumbnail}
                  alt="Favorite design"
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            downloadFavorite(selectedFav);
          }}
        >
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleMenuClose();
            deleteFavorite(selectedFav._id);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Favorites;
