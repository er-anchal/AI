import { useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Button,
  Typography,
  Divider,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Popper,
  Paper,
  ClickAwayListener,
  Tooltip,
  FormControlLabel,
  Switch,
  Slider as MuiSlider,
  Drawer,
  Tab,
  Tabs,
  Badge,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Crop from "@mui/icons-material/Crop";
import ContentCut from "@mui/icons-material/ContentCut";
import ContentPaste from "@mui/icons-material/ContentPaste";
import {
  Canvas,
  Rect,
  Circle,
  Object as FabricObject,
  Polygon,
  Path,
  Textbox,
  FabricImage,
  Gradient,
  util as fabricUtil,
  Point,
  filters,
} from "fabric";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  AddPhotoAlternate,
  TextFields,
  EmojiEmotions,
  Delete,
  Save,
  VerticalAlignBottom,
  VerticalAlignTop,
  Download,
  Category,
  South,
  North,
  VideoLibrary,
  CloudUpload,
  AutoAwesome,
  AutoFixHigh,
  Palette,
  Layers as LayersIcon,
  CropOriginal,
  Undo as UndoIcon,
  Redo as RedoIcon,
  LightMode,
  DarkMode as DarkModeIcon,
  Settings,
  ZoomIn,
  ZoomOut,
  AspectRatio,
  WaterDrop,
  Label,
  LocalOffer,
  FontDownload,
  LocalAtm,
  NavigateNext,
  NavigateBefore,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { hydrateCanvasWithVideos } from "./helpers";
import { useThemeContext } from "../context/ThemeContext";

// Emoji Picker Categories
const categories = {
  "Smileys & People": ["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "😘", "🥰", "👍", "👎", "👏", "🙌", "🙏"],
  "Animals & Nature": ["🐶", "🐱", "🦊", "🐻", "🐼", "🦁", "🐝", "🦋", "🌸", "🌼", "🌻", "🌹", "🌷", "🌴", "🌲", "⭐", "🌙", "🌍"],
  "Food & Drink": ["🍏", "🍎", "🍊", "🍋", "🍌", "🍓", "🍒", "🥑", "🍞", "🍕", "🍔", "🍟", "🍦", "🍩", "🍪", "☕", "🍷", "🍺"],
  "Activities & Sports": ["⚽", "🏀", "🏈", "🎾", "🎱", "⛳", "🏄", "🏃", "🧘", "🎨", "🎬", "🎤", "🎧", "🎮", "🎲"],
  "Travel & Places": ["✈️", "🚗", "🚨", "🚀", "🛸", "🗼", "🏰", "🏝️", "🏜️", "⛰️", "🏙️", "🌃", "🌉", "🎡", "🎢"],
  Objects: ["📱", "💻", "⌚", "📷", "💡", "🔑", "📦", "📌", "✏️", "✉️", "🔒", "🔑", "🔨", "🛒", "🎁", "🎈", "💎"],
  Symbols: ["❤️", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "✨", "🔥", "🌟", "🎉", "💯", "✔️", "❌", "⚠️", "🚫"],
  Flags: ["🇮🇳", "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇫🇷", "🇩🇪", "🇯🇵", "🏳️", "🏴", "🏁", "🚩"],
};

// Fabric.js prototype custom property inclusions for export/JSON
FabricObject.prototype.toObject = (function (original) {
  return function (propertiesToInclude = []) {
    if (!Array.isArray(propertiesToInclude)) propertiesToInclude = [];
    return original.call(this, [
      ...propertiesToInclude,
      "frameId",
      "isVideo",
      "videoSrc",
      "videoId",
      "zIndex",
      "selectable",
      "evented",
      "lockMovementX",
      "lockMovementY",
      "lockScalingX",
      "lockScalingY",
      "lockRotation",
      "isBgImage",
      "isProduct",
      "isWatermark",
      "isLogo",
      "isPriceTag",
      "isProductName",
      "isOfferBadge",
      "isCollectionName",
      "filterValues",
    ]);
  };
})(FabricObject.prototype.toObject);

/* ============================================================
   LUXURY SELECT — Premium native dropdown replacement
   Uses CSS class "luxury-select" defined in index.css
   ============================================================ */
function LuxurySelect({ value, onChange, options = [], placeholder, isDark, style = {} }) {
  return (
    <div className={`luxury-select-wrapper${isDark ? " dark-mode" : ""}`} style={style}>
      <select
        className="luxury-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value ?? opt}
            value={opt.value ?? opt}
            style={opt.fontFamily ? { fontFamily: opt.fontFamily } : {}}
          >
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   COLLAPSIBLE SECTION — Properties panel sections
   ============================================================ */
function CollapsibleSection({ title, children, defaultOpen = true, colors }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 0 }}>
      <div
        className="collapsible-header"
        onClick={() => setOpen((v) => !v)}
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          borderBottomColor: colors.border,
        }}
      >
        <span>{title}</span>
        <span
          style={{
            fontSize: 9,
            opacity: 0.6,
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            display: "inline-block",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </span>
      </div>
      {open && (
        <div style={{ paddingTop: 14, paddingBottom: 4 }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function DesignFrameCanvas() {
  const DEFAULT_FONT_FAMILY = "Arial";
  const DEFAULT_FONT_SIZE = 24;
  const DEFAULT_TEXT_COLOR = "#000000";
  const DEFAULT_TEXT_BOLD = false;
  const DEFAULT_TEXT_ITALIC = false;
  const DEFAULT_TEXT_UNDERLINE = false;
  const DEFAULT_TEXT_ALIGN = "left";
  const DEFAULT_TEXT_CASE = "none";
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const forwardShortcut = isMac ? "Cmd + ]" : "Ctrl + ]";
  const backwardShortcut = isMac ? "Cmd + [" : "Ctrl + [";

  const navigate = useNavigate();
  const { designId } = useParams();
  const [templateType, setTemplateType] = useState("post");
  const [bgFit, setBgFit] = useState("cover");
  
  const { darkMode, toggleTheme } = useThemeContext();

  const [searchParams] = useSearchParams();
  const bgImageUrl = searchParams.get("bg");
  const templateIdFromQuery = searchParams.get("templateId");
  
  const selectedShotsQuery = searchParams.get("selectedShots");
  const [templateShots] = useState(() => {
    if (selectedShotsQuery) {
      try {
        return JSON.parse(decodeURIComponent(selectedShotsQuery));
      } catch (e) {
        console.error("Failed to parse selectedShots", e);
      }
    }
    return [];
  });

  const [activeBgImage, setActiveBgImage] = useState(bgImageUrl);
  const [shotCanvasStates, setShotCanvasStates] = useState({});

  /* 🔒 FIXED CANVAS SIZES */
  const CANVAS_PRESETS = {
    post: { width: 1080, height: 1080 },
    banner: { width: 1200, height: 400 },
  };

  const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = CANVAS_PRESETS[templateType];

  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const fabricRef = useRef(null);
  const videoRef = useRef(null);
  const hasHydratedRef = useRef(false);
  const addedVideosRef = useRef(new Set());

  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasJson, setCanvasJson] = useState("");
  const [shapeType, setShapeType] = useState("rectangle");
  const [shapeBorder, setShapeBorder] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#000000");
  const [textCase, setTextCase] = useState("none");

  const [bgType, setBgType] = useState("solid");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [gradientColors, setGradientColors] = useState(["#22C1C3", "#FDBB2D"]);

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState(null);

  const [activeTextProps, setActiveTextProps] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: "left",
  });
  
  const [isCropping, setIsCropping] = useState(false);
  const cropRectRef = useRef(null);
  let startPoint = null;
  const [layerableSelected, setLayerableSelected] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [opacity, setOpacity] = useState(1);
  const clipboardRef = useRef(null);

  const [removeBgEnabled, setRemoveBgEnabled] = useState(false);
  
  // Undo/Redo tracking
  const historyRef = useRef([]);
  const indexRef = useRef(-1);
  const isUpdatingHistory = useRef(false);

  // Zooming
  const [zoomPercent, setZoomPercent] = useState(100);

  // Layout tabs
  const [activeTab, setActiveTab] = useState("filters");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false);

  // Media uploaded lists
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);

  // Image filters settings state
  const [filtersState, setFiltersState] = useState({
    preset: "none",
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    highlights: 0,
    shadows: 0,
    sharpness: 0,
  });

  const [filterTarget, setFilterTarget] = useState("selected-image");

  // Premium Luxury Color System (Light Mode Primary)
  const colors = {
    // Backgrounds
    bg: darkMode ? "#111113" : "#fdfdfc",
    panelBg: darkMode ? "#1a1a1e" : "#ffffff",
    panelHeaderBg: darkMode ? "#222226" : "#f9f9f8",
    // Typography
    text: darkMode ? "#e5e5e7" : "#1a1a1a",
    textMuted: darkMode ? "#a1a1aa" : "#737373",
    textSubtle: darkMode ? "#6e6e76" : "#b0b0a8",
    // Borders & Dividers
    border: darkMode ? "#2d2d30" : "#e8e8e3",
    borderStrong: darkMode ? "#3e3e44" : "#d4d4cc",
    // Gold Accent
    accent: "#c5a880",
    accentLight: "rgba(197, 168, 128, 0.18)",
    accentDark: "#a0845c",
    // Interactive States
    activeTabBg: darkMode ? "rgba(197, 168, 128, 0.14)" : "rgba(197, 168, 128, 0.08)",
    hoverBg: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
    // Inputs — 44px height standard
    inputBg: darkMode ? "#0e0e10" : "#f4f4f2",
    inputBorder: darkMode ? "#2d2d30" : "#e2e2dc",
    inputRing: "rgba(197, 168, 128, 0.22)",
    // Shadows
    shadow: darkMode ? "0 4px 24px rgba(0,0,0,0.55)" : "0 8px 32px rgba(0,0,0,0.04)",
    shadowMd: darkMode ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.06)",
    // Surface elevations
    surfaceElevated: darkMode ? "#222226" : "#f9f9f7",
    surfaceCard: darkMode ? "#1e1e22" : "#fafaf8",
  };

  /* ---------------- UNDO / REDO HISTORY ---------------- */
  const pushState = (newState) => {
    const history = historyRef.current;
    const index = indexRef.current;
    const updated = history.slice(0, index + 1);
    updated.push(newState);
    historyRef.current = updated;
    indexRef.current = updated.length - 1;
  };

  const saveHistory = () => {
    const canvas = fabricRef.current;
    if (!canvas || isUpdatingHistory.current) return;

    const state = JSON.stringify(
      canvas.toJSON([
        "selectable",
        "evented",
        "lockMovementX",
        "lockMovementY",
        "lockScalingX",
        "lockScalingY",
        "lockRotation",
        "zIndex",
        "isVideo",
        "videoSrc",
        "videoId",
        "frameId",
        "isBgImage",
        "isProduct",
        "isWatermark",
        "isLogo",
        "isPriceTag",
        "isProductName",
        "isOfferBadge",
        "isCollectionName",
        "filterValues",
      ])
    );
    pushState(state);
  };

  const undo = () => {
    const canvas = fabricRef.current;
    if (!canvas || indexRef.current <= 0) return;

    isUpdatingHistory.current = true;
    indexRef.current -= 1;
    const prevState = historyRef.current[indexRef.current];

    canvas.loadFromJSON(JSON.parse(prevState)).then(() => {
      // Cleanup previous video objects/loops
      canvas.getObjects().forEach((obj) => {
        if (obj.isVideo) {
          destroyVideoObject(obj);
        }
      });
      
      hydrateCanvasWithVideos({
        canvas,
        canvasJson: prevState,
        addVideoToCanvas,
        restoreZOrder,
        addedVideosRef,
      });

      canvas.requestRenderAll();
      isUpdatingHistory.current = false;
      syncActiveSelectionState();
    });
  };

  const redo = () => {
    const canvas = fabricRef.current;
    if (!canvas || indexRef.current >= historyRef.current.length - 1) return;

    isUpdatingHistory.current = true;
    indexRef.current += 1;
    const nextState = historyRef.current[indexRef.current];

    canvas.loadFromJSON(JSON.parse(nextState)).then(() => {
      canvas.getObjects().forEach((obj) => {
        if (obj.isVideo) {
          destroyVideoObject(obj);
        }
      });

      hydrateCanvasWithVideos({
        canvas,
        canvasJson: nextState,
        addVideoToCanvas,
        restoreZOrder,
        addedVideosRef,
      });

      canvas.requestRenderAll();
      isUpdatingHistory.current = false;
      syncActiveSelectionState();
    });
  };

  // Sync state variables with active object
  const syncActiveSelectionState = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    setSelectedObject(obj);
    setLayerableSelected(isLayerableObject(obj));
    setImageSelected(isImageLayerable(obj));

    if (obj) {
      setOpacity(obj.opacity ?? 1);
      if (obj.type === "textbox") {
        setFontFamily(obj.fontFamily || DEFAULT_FONT_FAMILY);
        setFontSize(obj.fontSize || DEFAULT_FONT_SIZE);
        setTextColor(obj.fill || DEFAULT_TEXT_COLOR);
        setActiveTextProps({
          bold: obj.fontWeight === "bold",
          italic: obj.fontStyle === "italic",
          underline: !!obj.underline,
          align: obj.textAlign || "left",
        });
        setTextCase(obj.textCase || "none");
      }
      if (obj.type === "image" && obj.filterValues) {
        setFiltersState(obj.filterValues);
      }
    }
  };

  /* ---------------- MULTI-SHOT NAVIGATOR FLOW ---------------- */
  const handleShotSwitch = async (newShotUrl) => {
    const canvas = fabricRef.current;
    if (!canvas || newShotUrl === activeBgImage) return;

    isUpdatingHistory.current = true;

    // 1. Serialize active shot's current canvas state
    const currentJson = canvas.toJSON([
      "selectable",
      "evented",
      "lockMovementX",
      "lockMovementY",
      "lockScalingX",
      "lockScalingY",
      "lockRotation",
      "zIndex",
      "isVideo",
      "videoSrc",
      "videoId",
      "frameId",
      "isBgImage",
      "isProduct",
      "isWatermark",
      "isLogo",
      "isPriceTag",
      "isProductName",
      "isOfferBadge",
      "isCollectionName",
      "filterValues",
    ]);

    // Save active shot elements state
    const currentJsonStr = JSON.stringify(currentJson);
    setShotCanvasStates((prev) => ({
      ...prev,
      [activeBgImage]: currentJsonStr,
    }));

    // 2. Clean current canvas & video loops
    canvas.discardActiveObject();
    canvas.getObjects().forEach((obj) => {
      if (obj.isVideo) {
        destroyVideoObject(obj);
      }
      canvas.remove(obj);
    });
    canvas.clear();
    addedVideosRef.current.clear();

    // 3. Set the target shot active
    setActiveBgImage(newShotUrl);

    // 4. Load saved JSON for target shot if exists, else load standard background image
    const savedState = shotCanvasStates[newShotUrl];
    if (savedState) {
      canvas.loadFromJSON(JSON.parse(savedState)).then(async () => {
        await hydrateCanvasWithVideos({
          canvas,
          canvasJson: savedState,
          addVideoToCanvas,
          restoreZOrder,
          addedVideosRef,
        });

        // Re-align correct background image if mutated
        canvas.getObjects().forEach((o) => {
          if (o.isBgImage) o.set({ skipTargetFind: true, selectable: false, evented: false });
        });

        canvas.requestRenderAll();
        
        // Reset local undo/redo context for the current active shot
        historyRef.current = [savedState];
        indexRef.current = 0;
        isUpdatingHistory.current = false;
        syncActiveSelectionState();
      });
    } else {
      await setBackgroundImage(newShotUrl);
      
      const initialState = JSON.stringify(
        canvas.toJSON([
          "selectable",
          "evented",
          "lockMovementX",
          "lockMovementY",
          "lockScalingX",
          "lockScalingY",
          "lockRotation",
          "zIndex",
          "isVideo",
          "videoSrc",
          "videoId",
          "frameId",
          "isBgImage",
          "isProduct",
          "isWatermark",
          "isLogo",
          "isPriceTag",
          "isProductName",
          "isOfferBadge",
          "isCollectionName",
          "filterValues",
        ])
      );
      historyRef.current = [initialState];
      indexRef.current = 0;
      isUpdatingHistory.current = false;
      syncActiveSelectionState();
    }
  };

  /* ---------------- ZOOMING CONTROLS ---------------- */
  const handleZoom = (factor) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    let newZoom = canvas.getZoom() * factor;
    newZoom = Math.max(0.15, Math.min(newZoom, 4.0)); // Clamp zoom between 15% and 400%
    const center = new Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    canvas.zoomToPoint(center, newZoom);
    setZoomPercent(Math.round(newZoom * 100));
  };

  const resetZoom = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(1);
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoomPercent(100);
  };

  /* ---------------- CROP IMAGE INTERACTION ---------------- */
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleMouseDown = (opt) => {
      if (!isCropping) return;
      const pointer = canvas.getScenePoint(opt.e);
      startPoint = pointer;

      const rect = new Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: "rgba(0,0,0,0.3)",
        stroke: "#c5a880",
        strokeWidth: 1.5,
        selectable: false,
        evented: false,
      });

      cropRectRef.current = rect;
      canvas.add(rect);
    };

    const handleMouseMove = (opt) => {
      if (!isCropping || !cropRectRef.current || !startPoint) return;
      const pointer = canvas.getScenePoint(opt.e);
      const rect = cropRectRef.current;

      rect.set({
        width: pointer.x - startPoint.x,
        height: pointer.y - startPoint.y,
      });
      canvas.requestRenderAll();
    };

    const handleMouseUp = () => {
      if (!isCropping || !cropRectRef.current) return;
      applyCrop();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvasReady, isCropping]);

  const applyCrop = () => {
    const canvas = fabricRef.current;
    const activeObj = canvas?.getActiveObject();
    const rect = cropRectRef.current;

    if (!activeObj || activeObj.type !== "image" || !rect) return;

    const clip = new Rect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      absolutePositioned: true,
    });

    activeObj.set({
      clipPath: clip,
      dirty: true,
    });
    activeObj._forceClearCache = true;

    canvas.remove(rect);
    cropRectRef.current = null;
    setIsCropping(false);

    canvas.requestRenderAll();
    saveHistory();
  };

  const cancelCrop = () => {
    const canvas = fabricRef.current;
    if (cropRectRef.current) {
      canvas.remove(cropRectRef.current);
    }
    cropRectRef.current = null;
    setIsCropping(false);
    if (canvas) {
      canvas.selection = true;
      canvas.requestRenderAll();
    }
  };

  /* ---------------- FABRIC CANVAS INITIALIZATION ---------------- */
  useEffect(() => {
    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    canvas.backgroundVpt = false;

    const handleObjectRemoved = (e) => {
      if (e.target?.isVideo) {
        destroyVideoObject(e.target);
        addedVideosRef.current.delete(e.target.videoId);
      }
    };

    const handleSelectionCreated = () => syncActiveSelectionState();
    const handleSelectionUpdated = () => syncActiveSelectionState();
    const handleSelectionCleared = () => {
      setSelectedObject(null);
      setLayerableSelected(false);
      setImageSelected(false);
    };

    canvas.on("object:removed", handleObjectRemoved);
    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionUpdated);
    canvas.on("selection:cleared", handleSelectionCleared);

    canvas.on("object:added", () => saveHistory());
    canvas.on("object:modified", () => saveHistory());

    fabricRef.current = canvas;
    setCanvasReady(true);

    return () => {
      canvas.off("object:removed", handleObjectRemoved);
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionUpdated);
      canvas.off("selection:cleared", handleSelectionCleared);

      canvas.getObjects().forEach((obj) => {
        if (obj.isVideo) {
          destroyVideoObject(obj);
        }
      });

      canvas.dispose();
      fabricRef.current = null;
      setCanvasReady(false);
      hasHydratedRef.current = false;
    };
  }, []);

  // Sync canvas size resize observers
  useEffect(() => {
    const canvas = fabricRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const resizeCanvas = () => {
      const wrapperWidth = wrapper.clientWidth;
      const wrapperHeight = wrapper.clientHeight;
      if (!canvas || !wrapperWidth || !wrapperHeight) return;

      const scale = Math.min(wrapperWidth / CANVAS_WIDTH, wrapperHeight / CANVAS_HEIGHT) * 0.92;
      const cssWidth = CANVAS_WIDTH * scale;
      const cssHeight = CANVAS_HEIGHT * scale;

      const offsetX = (wrapperWidth - cssWidth) / 2;
      const offsetY = (wrapperHeight - cssHeight) / 2;

      canvas.setDimensions({ width: cssWidth, height: cssHeight }, { cssOnly: true });
      canvas.setViewportTransform([canvas.getZoom(), 0, 0, canvas.getZoom(), 0, 0]);

      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";
      wrapper.style.padding = `${offsetY}px ${offsetX}px`;

      canvas.requestRenderAll();
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.setDimensions(
      {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      },
      { backstoreOnly: true }
    );

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.calcOffset();
    canvas.requestRenderAll();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Load design/template JSON on entry
  useEffect(() => {
    if (!canvasReady || !canvasJson) return;
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    const canvas = fabricRef.current;
    if (canvas) {
      canvas.getObjects().forEach((obj) => {
        if (obj.isVideo) {
          destroyVideoObject(obj);
        }
      });
    }

    hydrateCanvasWithVideos({
      canvas,
      canvasJson,
      addVideoToCanvas,
      restoreZOrder,
      addedVideosRef,
    });
  }, [canvasReady, canvasJson]);

  useEffect(() => {
    hasHydratedRef.current = false;
    addedVideosRef.current.clear();
  }, [designId]);

  useEffect(() => {
    if (!canvasReady || !activeBgImage) return;
    setBackgroundImage(activeBgImage);
  }, [canvasReady, activeBgImage, bgFit, CANVAS_WIDTH, CANVAS_HEIGHT]);

  useEffect(() => {
    if (!activeBgImage) return;
    const img = new Image();
    img.src = activeBgImage;
    img.onload = () => {
      const ratio = img.width / img.height;
      const nextType = ratio > 1.25 ? "banner" : "post";
      setTemplateType((prev) => (prev !== nextType ? nextType : prev));
    };
  }, [activeBgImage]);

  // Fetch designs if ID is supplied
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    if (designId) {
      const fetchTemplate = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/user-designs/${designId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTemplateType(res.data.type);
          setCanvasJson(res.data.canvasJson);
        } catch (err) {
          console.error("Failed to load template", err);
          alert("Failed to load template ❌");
        }
      };
      fetchTemplate();
    }
  }, [designId, navigate]);

  useEffect(() => {
    applyBackground();
  }, [gradientColors, bgColor, bgType]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!fabricRef.current) return;
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "]") bringForwardSafe();
        if (e.key === "[") sendBackwardSafe();
        if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          undo();
        }
        if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* ---------------- IMAGE FILTER SYSTEM ---------------- */
  // Apply changes to the filter settings
  const updateFilterSetting = (key, val) => {
    const updated = { ...filtersState, [key]: val };
    setFiltersState(updated);
    applyFiltersToTarget(updated);
  };

  const applyPresetFilter = (presetName) => {
    const updated = { ...filtersState, preset: presetName };
    setFiltersState(updated);
    applyFiltersToTarget(updated);
  };

  const applyFiltersToTarget = (settings) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (filterTarget === "selected-image" || filterTarget === "selected-product") {
      const activeObj = canvas.getActiveObject();
      const isProdTarget = filterTarget === "selected-product";

      let targetObj = null;
      if (isProdTarget) {
        targetObj = canvas.getObjects().find((o) => o.type === "image" && o.isProduct);
      } else if (activeObj && activeObj.type === "image") {
        targetObj = activeObj;
      }

      if (targetObj) {
        applyFiltersToImageObject(targetObj, settings);
        targetObj.filterValues = settings; // Store settings on object
        canvas.requestRenderAll();
        saveHistory();
      }
    } else if (filterTarget === "entire-design") {
      // Entire Canvas: apply to all image/background layers
      canvas.getObjects().forEach((o) => {
        if (o.type === "image") {
          applyFiltersToImageObject(o, settings);
          o.filterValues = settings;
        }
      });
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const applyFiltersToImageObject = (img, settings) => {
    if (!img) return;
    img.filters = [];

    // Presets
    if (settings.preset !== "none") {
      switch (settings.preset) {
        case "Luxury Gold":
          img.filters.push(new filters.BlendColor({ color: "#d4af37", mode: "multiply", alpha: 0.2 }));
          img.filters.push(new filters.Contrast({ contrast: 0.15 }));
          img.filters.push(new filters.Brightness({ brightness: 0.03 }));
          break;
        case "Diamond Shine":
          img.filters.push(new filters.Brightness({ brightness: 0.15 }));
          img.filters.push(new filters.Contrast({ contrast: 0.3 }));
          img.filters.push(new filters.BlendColor({ color: "#e0f7fa", mode: "screen", alpha: 0.15 }));
          break;
        case "Premium Silver":
          img.filters.push(new filters.Saturation({ saturation: -0.85 }));
          img.filters.push(new filters.Contrast({ contrast: 0.25 }));
          img.filters.push(new filters.Brightness({ brightness: 0.06 }));
          break;
        case "Rose Gold":
          img.filters.push(new filters.BlendColor({ color: "#b76e79", mode: "multiply", alpha: 0.18 }));
          img.filters.push(new filters.Contrast({ contrast: 0.08 }));
          img.filters.push(new filters.Brightness({ brightness: 0.05 }));
          break;
        case "Royal Black":
          img.filters.push(new filters.Saturation({ saturation: -0.6 }));
          img.filters.push(new filters.Contrast({ contrast: 0.45 }));
          img.filters.push(new filters.Brightness({ brightness: -0.1 }));
          break;
        case "Velvet Luxury":
          img.filters.push(new filters.BlendColor({ color: "#4a0e17", mode: "multiply", alpha: 0.24 }));
          img.filters.push(new filters.Contrast({ contrast: 0.18 }));
          break;
        case "Bright Catalogue":
          img.filters.push(new filters.Brightness({ brightness: 0.25 }));
          img.filters.push(new filters.Contrast({ contrast: 0.15 }));
          break;
        case "Instagram Ready":
          img.filters.push(new filters.BlendColor({ color: "#e8af78", mode: "multiply", alpha: 0.12 }));
          img.filters.push(new filters.Saturation({ saturation: 0.2 }));
          break;
        case "Soft Glow":
          img.filters.push(new filters.Blur({ blur: 0.06 }));
          img.filters.push(new filters.Brightness({ brightness: 0.1 }));
          break;
        case "High Contrast":
          img.filters.push(new filters.Contrast({ contrast: 0.5 }));
          break;
        case "Warm Luxury":
          img.filters.push(new filters.BlendColor({ color: "#ffd54f", mode: "multiply", alpha: 0.14 }));
          break;
        case "Cool Studio":
          img.filters.push(new filters.BlendColor({ color: "#b2ebf2", mode: "multiply", alpha: 0.16 }));
          break;
      }
    }

    // Sliders
    if (settings.brightness !== 0) img.filters.push(new filters.Brightness({ brightness: settings.brightness }));
    if (settings.contrast !== 0) img.filters.push(new filters.Contrast({ contrast: settings.contrast }));
    if (settings.saturation !== 0) img.filters.push(new filters.Saturation({ saturation: settings.saturation }));
    if (settings.exposure !== 0) {
      img.filters.push(new filters.Brightness({ brightness: settings.exposure }));
      img.filters.push(new filters.Contrast({ contrast: settings.exposure * 0.2 }));
    }
    if (settings.blur !== 0) img.filters.push(new filters.Blur({ blur: settings.blur }));
    if (settings.highlights !== 0) img.filters.push(new filters.Brightness({ brightness: settings.highlights * 0.25 }));
    if (settings.shadows !== 0) img.filters.push(new filters.Contrast({ contrast: -settings.shadows * 0.15 }));

    img.applyFilters();
  };

  /* ---------------- HELPERS & ACTIONS ---------------- */
  const restoreZOrder = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objs = canvas.getObjects();
    const sorted = [...objs].sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((obj, index) => {
      canvas.moveObjectTo(obj, index);
    });
    canvas.requestRenderAll();
  };

  const getCanvasPoint = (event) => {
    const canvas = fabricRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const point = canvas.getScenePoint(event);
    return { x: point.x, y: point.y };
  };

  const applyBackground = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (bgType === "solid") {
      canvas.backgroundColor = bgColor;
    } else {
      const gradient = new Gradient({
        type: bgType,
        coords:
          bgType === "linear"
            ? { x1: 0, y1: 0, x2: 0, y2: CANVAS_HEIGHT }
            : {
                x1: CANVAS_WIDTH / 2,
                y1: CANVAS_HEIGHT / 2,
                r1: 0,
                x2: CANVAS_WIDTH / 2,
                y2: CANVAS_HEIGHT / 2,
                r2: CANVAS_WIDTH / 2,
              },
        colorStops: [
          { offset: 0, color: gradientColors[0] },
          { offset: 1, color: gradientColors[1] },
        ],
      });
      canvas.backgroundColor = gradient;
    }
    canvas.requestRenderAll();
  };

  const setBackgroundImage = async (imageUrl) => {
    const canvas = fabricRef.current;
    if (!canvas || !imageUrl) return;

    const img = await FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    });

    const scaleFn = bgFit === "cover" ? Math.max : Math.min;
    const scale = scaleFn(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);

    img.set({
      isBgImage: true,
      originX: "center",
      originY: "center",
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      scaleX: scale,
      scaleY: scale,
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hoverCursor: "default",
      moveCursor: "default",
      perPixelTargetFind: false,
      skipTargetFind: true,
    });

    canvas.getObjects().forEach((obj) => {
      if (obj.isBgImage) {
        canvas.remove(obj);
      }
    });

    canvas.add(img);
    canvas.sendObjectToBack(img);
    canvas.requestRenderAll();
  };

  const addShape = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const common = {
      fill: "white",
      stroke: shapeBorder ? "#333" : null,
      strokeWidth: shapeBorder ? 1.5 : 0,
      strokeUniform: true,
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: "center",
      originY: "center",
    };

    let shape;
    if (shapeType === "rectangle") {
      shape = new Rect({ width: 200, height: 120, ...common });
    } else if (shapeType === "circle") {
      shape = new Circle({ radius: 80, ...common });
    } else if (shapeType === "triangle") {
      shape = new Polygon(
        [
          { x: 0, y: 100 },
          { x: 50, y: 0 },
          { x: 100, y: 100 },
        ],
        common
      );
    } else if (shapeType === "heart") {
      shape = new Path(
        "M 272 90 C 272 65 242 55 232 80 C 222 55 192 65 192 90 C 192 130 232 150 232 150 C 232 150 272 130 272 90 z",
        {
          ...common,
          scaleX: 1.2,
          scaleY: 1.2,
        }
      );
    }

    shape.frameId = crypto.randomUUID();
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
  };

  const addText = (textString = "New Text", options = {}) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const text = new Textbox(textString, {
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: "center",
      originY: "center",
      width: 250,
      editable: true,
      fontFamily: options.fontFamily || DEFAULT_FONT_FAMILY,
      fontSize: options.fontSize || DEFAULT_FONT_SIZE,
      fill: options.fill || DEFAULT_TEXT_COLOR,
      fontWeight: options.fontWeight || (DEFAULT_TEXT_BOLD ? "bold" : "normal"),
      fontStyle: options.fontStyle || (DEFAULT_TEXT_ITALIC ? "italic" : "normal"),
      underline: options.underline || DEFAULT_TEXT_UNDERLINE,
      textAlign: options.textAlign || DEFAULT_TEXT_ALIGN,
      charSpacing: options.charSpacing || 0,
      ...options,
    });

    text.on("changed", () => {
      text.set({
        width: Math.max(150, text.calcTextWidth() + 10),
      });
      canvas.requestRenderAll();
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.requestRenderAll();
  };

  const addEmojiObject = (emoji, left, top) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const emojiObj = new Textbox(emoji, {
      left,
      top,
      originX: "center",
      originY: "center",
      fontSize: 48,
      fontFamily: "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji",
      editable: false,
      selectable: true,
      splitByGrapheme: true,
      lockScalingFlip: true,
      objectCaching: false,
    });

    canvas.add(emojiObj);
    canvas.setActiveObject(emojiObj);
    canvas.requestRenderAll();
  };

  const applyTextCase = (type) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const obj = canvas.getActiveObject();
    if (obj?.type === "textbox") {
      let txt = obj.text || "";
      if (type === "upper") txt = txt.toUpperCase();
      else if (type === "lower") txt = txt.toLowerCase();
      else if (type === "capitalize") txt = txt.replace(/\b\w/g, (c) => c.toUpperCase());
      obj.set({ text: txt, textCase: type });
      canvas.requestRenderAll();
      saveHistory();
    }
    setTextCase(type);
  };

  const destroyVideoObject = (obj) => {
    if (!obj || !obj.isVideo) return;
    if (obj._rafId) {
      cancelAnimationFrame(obj._rafId);
      obj._rafId = null;
    }
    const video = obj.videoEl || obj._element;
    if (video) {
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {}
    }
    obj.videoEl = null;
    obj._element = null;
    obj.disposed = true;
  };

  const removeSelected = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;

    if (obj.isVideo) {
      destroyVideoObject(obj);
      addedVideosRef.current.delete(obj.videoId);
    }
    canvas.remove(obj);
    canvas.requestRenderAll();
  };

  const isImageLayerable = (obj) => {
    return obj && obj.type === "image" && !obj.frameId && !obj.isBgImage;
  };

  const sendImageToFront = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj) return;
    canvas.bringObjectToFront(obj);
    canvas.requestRenderAll();
    saveHistory();
  };

  const sendImageToBack = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj) return;
    canvas.sendObjectToBack(obj);
    // Keep background image as absolute bottom
    const bgImage = canvas.getObjects().find((o) => o.isBgImage);
    if (bgImage) canvas.sendObjectToBack(bgImage);
    canvas.requestRenderAll();
    saveHistory();
  };

  const isLayerableObject = (obj) => {
    return !!obj && !obj.isBgImage;
  };

  const bringForwardSafe = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isLayerableObject(obj)) return;
    canvas.bringObjectForward(obj);
    canvas.requestRenderAll();
    saveHistory();
  };

  const sendBackwardSafe = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isLayerableObject(obj)) return;
    canvas.sendObjectBackwards(obj);
    const bgImage = canvas.getObjects().find((o) => o.isBgImage);
    if (bgImage) canvas.sendObjectToBack(bgImage);
    canvas.requestRenderAll();
    saveHistory();
  };

  const uploadMedia = async (file) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/uploads/upload-media`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (!res.data?.url) throw new Error("No image URL returned");
      return res.data.url;
    } catch (err) {
      console.error(err);
      alert(err.message || err.response?.data?.message || "Image upload failed");
    }
  };

  const removeBackground = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axios.post("http://localhost:5000/api/remove-bg", formData, {
      responseType: "blob",
    });
    return URL.createObjectURL(res.data);
  };

  const addVideoToCanvas = async (videoUrl, reviveData = null) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const videoId = reviveData?.videoId || crypto.randomUUID();
    const videoEl = document.createElement("video");
    videoEl.src = videoUrl;
    videoEl.crossOrigin = "anonymous";
    videoEl.loop = true;
    videoEl.muted = true;
    videoEl.playsInline = true;

    await new Promise((resolve) => {
      videoEl.onloadedmetadata = resolve;
    });

    const fabricVideo = new FabricImage(videoEl, {
      left: reviveData?.left || CANVAS_WIDTH / 2,
      top: reviveData?.top || CANVAS_HEIGHT / 2,
      originX: "center",
      originY: "center",
      width: videoEl.videoWidth,
      height: videoEl.videoHeight,
      isVideo: true,
      videoSrc: videoUrl,
      videoId: videoId,
      selectable: true,
      hasControls: true,
    });

    if (reviveData) {
      fabricVideo.set({
        scaleX: reviveData.scaleX,
        scaleY: reviveData.scaleY,
        angle: reviveData.angle,
        zIndex: reviveData.zIndex,
      });
    } else {
      const scale = Math.min(CANVAS_WIDTH / videoEl.videoWidth, CANVAS_HEIGHT / videoEl.videoHeight) * 0.4;
      fabricVideo.set({ scaleX: scale, scaleY: scale });
    }

    fabricVideo.videoEl = videoEl;
    addedVideosRef.current.add(videoId);
    canvas.add(fabricVideo);

    const renderLoop = () => {
      if (fabricVideo.disposed || !canvas) return;
      fabricVideo.dirty = true;
      canvas.requestRenderAll();
      fabricVideo._rafId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    videoEl.play().catch(() => {});
    canvas.requestRenderAll();
    return fabricVideo;
  };

  const handleUpload = async (e) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const file = e.target.files[0];
    if (!file) return;

    let imageUrl = null;
    if (removeBgEnabled) {
      imageUrl = await removeBackground(file);
    } else {
      imageUrl = await uploadMedia(file);
    }
    if (!imageUrl) return;

    setUploadedImages((prev) => [imageUrl, ...prev]);

    try {
      const img = await FabricImage.fromURL(imageUrl, {
        crossOrigin: "anonymous",
      });

      const selected = canvas.getActiveObject();

      // Shape/Frame clipping logic
      if (selected && ["rect", "circle", "polygon", "path"].includes(selected.type)) {
        selected.frameId ??= crypto.randomUUID();

        // Clear existing clips on this shape
        canvas.getObjects().forEach((o) => {
          if (o.frameId === selected.frameId && o.type === "image") {
            canvas.remove(o);
          }
        });

        const bounds = selected.getBoundingRect(true);
        const scale = Math.max(bounds.width / img.width, bounds.height / img.height);

        img.set({
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          left: selected.getCenterPoint().x,
          top: selected.getCenterPoint().y,
          selectable: true,
          hasControls: true,
          objectCaching: false,
        });

        const clip = await selected.clone();
        clip.set({ absolutePositioned: true, evented: false, selectable: false });
        img.clipPath = clip;
        img.frameId = selected.frameId;

        selected.set({
          selectable: true,
          evented: true,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
        });

        canvas.add(img);
        canvas.bringObjectToFront(img);
        canvas.setActiveObject(img);
      } else {
        // Drop standard image on canvas
        const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height) * 0.45;
        img.set({
          left: CANVAS_WIDTH / 2,
          top: CANVAS_HEIGHT / 2,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          hasControls: true,
          objectCaching: false,
        });
        canvas.add(img);
        canvas.bringObjectToFront(img);
        canvas.setActiveObject(img);
      }

      canvas.requestRenderAll();
    } catch (err) {
      console.error(err);
      alert("Failed to add image to canvas");
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadMedia(file);
    if (!url) return;

    setUploadedVideos((prev) => [url, ...prev]);

    try {
      const selectedShape = fabricRef.current?.getActiveObject();

      const addClippedVideo = async (videoSrc, shape) => {
        const canvas = fabricRef.current;
        const videoId = crypto.randomUUID();
        const videoEl = document.createElement("video");
        videoEl.src = videoSrc;
        videoEl.crossOrigin = "anonymous";
        videoEl.loop = true;
        videoEl.muted = true;
        videoEl.playsInline = true;

        await new Promise((r) => {
          videoEl.onloadedmetadata = r;
        });

        const bounds = shape.getBoundingRect(true);
        const scale = Math.max(bounds.width / videoEl.videoWidth, bounds.height / videoEl.videoHeight);

        const fabricVideo = new FabricImage(videoEl, {
          left: shape.getCenterPoint().x,
          top: shape.getCenterPoint().y,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          isVideo: true,
          videoSrc: videoSrc,
          videoId: videoId,
          selectable: true,
          hasControls: true,
          objectCaching: false,
        });

        const clip = await shape.clone();
        clip.set({ absolutePositioned: true, evented: false, selectable: false });
        fabricVideo.clipPath = clip;
        fabricVideo.frameId = shape.frameId;

        shape.set({
          selectable: true,
          evented: true,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          fill: "white",
        });

        canvas.add(fabricVideo);
        canvas.bringObjectToFront(fabricVideo);
        canvas.setActiveObject(fabricVideo);

        const renderLoop = () => {
          if (!canvas || fabricVideo.disposed) return;
          fabricVideo.dirty = true;
          canvas.requestRenderAll();
          fabricVideo._rafId = requestAnimationFrame(renderLoop);
        };
        renderLoop();
        videoEl.play().catch(() => {});
      };

      if (selectedShape && ["rect", "circle", "triangle", "path", "polygon"].includes(selectedShape.type)) {
        selectedShape.frameId ??= crypto.randomUUID();
        fabricRef.current.getObjects().forEach((o) => {
          if (o.frameId === selectedShape.frameId && o.isVideo) {
            destroyVideoObject(o);
            addedVideosRef.current.delete(o.videoId);
            fabricRef.current.remove(o);
          }
        });
        await addClippedVideo(url, selectedShape);
      } else {
        await addVideoToCanvas(url);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add video to canvas");
    }
  };

  /* ---------------- SAVE / FAVORITES / DOWNLOADS ---------------- */
  const saveDesign = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const canvas = fabricRef.current;
    if (!canvas) return;

    try {
      canvas.getObjects().forEach((obj, i) => {
        obj.zIndex = i;
      });

      const json = canvas.toJSON([
        "selectable",
        "evented",
        "lockMovementX",
        "lockMovementY",
        "lockScalingX",
        "lockScalingY",
        "lockRotation",
        "zIndex",
        "isVideo",
        "videoSrc",
        "videoId",
        "frameId",
        "isBgImage",
        "isProduct",
        "isWatermark",
        "isLogo",
        "isPriceTag",
        "isProductName",
        "isOfferBadge",
        "isCollectionName",
        "filterValues",
      ]);

      const thumbnail = canvas.toDataURL({
        format: "jpeg",
        quality: 0.6,
        multiplier: 0.2,
      });

      if (designId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/user-designs/${designId}`,
          {
            canvasJson: json,
            type: templateType,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            thumbnail,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Design updated successfully 🎉");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/user-designs`,
          {
            templateId: templateIdFromQuery,
            canvasJson: json,
            type: templateType,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            thumbnail,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Design saved successfully 🎉");
      }
      navigate("/my-designs");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save design ❌");
    }
  };

  const saveToFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const canvas = fabricRef.current;
    if (!canvas) return;

    try {
      canvas.getObjects().forEach((obj, i) => {
        obj.zIndex = i;
      });

      const json = canvas.toJSON([
        "selectable",
        "evented",
        "lockMovementX",
        "lockMovementY",
        "lockScalingX",
        "lockScalingY",
        "lockRotation",
        "zIndex",
        "isVideo",
        "videoSrc",
        "videoId",
        "frameId",
        "isBgImage",
        "isProduct",
        "isWatermark",
        "isLogo",
        "isPriceTag",
        "isProductName",
        "isOfferBadge",
        "isCollectionName",
        "filterValues",
      ]);

      const thumbnail = canvas.toDataURL({
        format: "png",
        quality: 0.6,
        multiplier: 0.25,
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/favorites`,
        {
          canvasJson: json,
          templateId: templateIdFromQuery,
          type: templateType,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          thumbnail,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (err) {
      console.error(err);
      alert("Failed to add to favorites");
      throw err;
    }
  };

  const downloadCanvas = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    try {
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      await saveToFavorites();

      const videoObjects = canvas.getObjects().filter((o) => o.isVideo);

      if (videoObjects.length > 0) {
        setDownloading(true);
        setDownloadProgress(0);

        const durations = videoObjects.map((v) =>
          Number.isFinite(v._element.duration) && v._element.duration > 0 ? v._element.duration : 3
        );
        const maxDuration = Math.max(...durations);

        // Wait for buffer
        await Promise.all(
          videoObjects.map(
            (v) =>
              new Promise((r) => {
                const vid = v._element;
                if (vid.readyState >= 3) r();
                else vid.onloadeddata = r;
              })
          )
        );

        const previousStates = videoObjects.map((v) => ({
          vid: v._element,
          fabricObj: v,
          currentTime: v._element.currentTime,
          wasPaused: v._element.paused,
          loop: v._element.loop,
          muted: v._element.muted,
          playbackRate: v._element.playbackRate,
        }));

        await Promise.all(
          videoObjects.map(
            (v) =>
              new Promise((r) => {
                const vid = v._element;
                vid.pause();
                vid.currentTime = 0;
                vid.loop = false;
                vid.muted = false;
                vid.playbackRate = 1;

                const seek = () => {
                  vid.removeEventListener("seeked", seek);
                  r();
                };
                vid.addEventListener("seeked", seek);
              })
          )
        );

        let renderRaf;
        const drawLoop = () => {
          videoObjects.forEach((v) => (v.dirty = true));
          canvas.requestRenderAll();
          renderRaf = requestAnimationFrame(drawLoop);
        };
        drawLoop();

        const canvasStream = canvas.getElement().captureStream(30);

        const audioCtx = new AudioContext();
        const dest = audioCtx.createMediaStreamDestination();
        const sources = [];

        videoObjects.forEach((v) => {
          const vid = v._element;
          const srcNode = audioCtx.createMediaElementSource(vid);

          const liveGain = audioCtx.createGain();
          liveGain.gain.value = 1;
          srcNode.connect(liveGain);
          liveGain.connect(audioCtx.destination);

          const recGain = audioCtx.createGain();
          recGain.gain.value = 1;
          srcNode.connect(recGain);
          recGain.connect(dest);

          sources.push(srcNode);
        });

        const mixedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ]);

        const recorder = new MediaRecorder(mixedStream, {
          mimeType: "video/webm; codecs=vp8,opus",
          videoBitsPerSecond: 8000000,
        });

        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);

        await audioCtx.resume();
        await Promise.all(videoObjects.map((v) => v._element.play().catch(() => {})));
        await new Promise((r) => requestAnimationFrame(r));

        recorder.start();
        const startRecordTime = performance.now();

        let progressRaf;
        const tick = () => {
          const elapsed = (performance.now() - startRecordTime) / 1000;
          const percent = Math.min((elapsed / maxDuration) * 100, 100);
          setDownloadProgress(percent);
          if (percent < 100) progressRaf = requestAnimationFrame(tick);
        };
        tick();

        setTimeout(() => {
          cancelAnimationFrame(renderRaf);
          cancelAnimationFrame(progressRaf);
          recorder.stop();

          sources.forEach((s) => {
            try {
              s.disconnect();
            } catch {}
          });
          audioCtx.close();

          previousStates.forEach((s) => {
            const vid = s.vid;
            vid.loop = s.loop;
            vid.muted = s.muted;
            vid.playbackRate = s.playbackRate;
            vid.currentTime = s.currentTime;
            if (!s.wasPaused) vid.play().catch(() => {});
          });
        }, maxDuration * 1000);

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "Luxury-Design.webm";
          a.click();
          URL.revokeObjectURL(url);

          setDownloadProgress(100);
          setTimeout(() => {
            setDownloading(false);
            setDownloadProgress(0);
          }, 1000);
          alert("Downloaded successfully! 🎉");
        };
      } else {
        // Static Image PNG output
        setDownloading(true);
        setDownloadProgress(30);

        await new Promise((r) => setTimeout(r, 100));
        setDownloadProgress(75);

        const dataURL = canvas.toDataURL({
          format: "png",
          quality: 1.0,
          multiplier: 2.0,
          enableRetinaScaling: true,
        });

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `Jewellery-Design.png`;
        link.click();

        setDownloadProgress(100);
        setTimeout(() => {
          setDownloading(false);
          setDownloadProgress(0);
        }, 500);
        alert("Downloaded successfully! 🎉");
      }
    } catch (err) {
      console.warn("Download save failed", err);
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  /* ---------------- TEXT FORMATTING HELPERS ---------------- */
  const setAlignment = (align) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== "textbox") return;

    obj.set({ textAlign: align });
    obj._forceClearCache = true;
    obj.initDimensions();
    canvas.requestRenderAll();
    setActiveTextProps((prev) => ({ ...prev, align }));
    saveHistory();
  };

  const updateTextStyles = (obj, newProps) => {
    if (!obj || obj.type !== "textbox") return;
    const canvas = fabricRef.current;
    obj.set({
      fontFamily: newProps.fontFamily ?? obj.fontFamily,
      fontSize: newProps.fontSize ?? obj.fontSize,
      fill: newProps.fill ?? obj.fill,
    });
    obj._forceClearCache = true;
    obj.dirty = true;
    obj.initDimensions();
    canvas.requestRenderAll();
    saveHistory();
  };

  const toggleStyle = (style) => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj || obj.type !== "textbox" || !obj.editable) return;

    const current = {
      bold: obj.fontWeight === "bold",
      italic: obj.fontStyle === "italic",
      underline: !!obj.underline,
    };
    const value = !current[style];

    if (obj.selectionStart === obj.selectionEnd) {
      if (style === "bold") obj.set({ fontWeight: value ? "bold" : "normal" });
      if (style === "italic") obj.set({ fontStyle: value ? "italic" : "normal" });
      if (style === "underline") obj.set({ underline: value });
    } else {
      for (let i = obj.selectionStart; i < obj.selectionEnd; i++) {
        const newStyle = {};
        if (style === "bold") newStyle.fontWeight = value ? "bold" : "normal";
        if (style === "italic") newStyle.fontStyle = value ? "italic" : "normal";
        if (style === "underline") newStyle.underline = value;
        obj.setSelectionStyles(newStyle, i, i + 1);
      }
    }

    obj._forceClearCache = true;
    obj.initDimensions();
    fabricRef.current.requestRenderAll();
    syncActiveSelectionState();
    saveHistory();
  };

  /* ---------------- JEWELLERY SPECIFIC CONTROLLERS ---------------- */
  const triggerReplaceProduct = async (e) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const file = e.target.files[0];
    if (!file) return;

    let imageUrl = null;
    if (removeBgEnabled) {
      imageUrl = await removeBackground(file);
    } else {
      imageUrl = await uploadMedia(file);
    }
    if (!imageUrl) return;

    const activeObj = canvas.getActiveObject();
    // Swap source of currently active image or default product image
    const targetObj = activeObj && activeObj.type === "image"
      ? activeObj
      : canvas.getObjects().find((o) => o.type === "image" && o.isProduct);

    if (targetObj) {
      const originalLeft = targetObj.left;
      const originalTop = targetObj.top;
      const originalScaleX = targetObj.scaleX;
      const originalScaleY = targetObj.scaleY;
      const originalAngle = targetObj.angle;
      const originalClipPath = targetObj.clipPath;
      const originalFrameId = targetObj.frameId;
      const originalZIndex = targetObj.zIndex;

      const newImg = await FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" });
      newImg.set({
        left: originalLeft,
        top: originalTop,
        scaleX: originalScaleX,
        scaleY: originalScaleY,
        angle: originalAngle,
        clipPath: originalClipPath,
        frameId: originalFrameId,
        isProduct: true,
        zIndex: originalZIndex,
        selectable: true,
        hasControls: true,
        objectCaching: false,
      });

      canvas.remove(targetObj);
      canvas.add(newImg);
      canvas.setActiveObject(newImg);
      restoreZOrder();
      canvas.requestRenderAll();
      saveHistory();
      alert("Product replaced successfully! ✨");
    } else {
      // Just insert as a new product image
      const newImg = await FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" });
      const scale = Math.min(CANVAS_WIDTH / newImg.width, CANVAS_HEIGHT / newImg.height) * 0.45;
      newImg.set({
        left: CANVAS_WIDTH / 2,
        top: CANVAS_HEIGHT / 2,
        scaleX: scale,
        scaleY: scale,
        isProduct: true,
        selectable: true,
        hasControls: true,
        originX: "center",
        originY: "center",
      });
      canvas.add(newImg);
      canvas.setActiveObject(newImg);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const insertProductFrame = async (frameType) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const commonProps = {
      fill: "transparent",
      stroke: "#c5a880",
      strokeWidth: 2,
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: "center",
      originY: "center",
      strokeUniform: true,
    };

    let shapeObj = null;
    const fId = crypto.randomUUID();

    if (frameType === "circle") {
      shapeObj = new Circle({ radius: 100, ...commonProps });
    } else if (frameType === "oval") {
      shapeObj = new Circle({ radius: 100, scaleY: 1.4, ...commonProps });
    } else if (frameType === "arch") {
      shapeObj = new Path("M -70 80 L -70 -10 A 70 70 0 0 1 70 -10 L 70 80 Z", { ...commonProps });
    } else if (frameType === "diamond") {
      shapeObj = new Polygon(
        [
          { x: 0, y: -100 },
          { x: 100, y: 0 },
          { x: 0, y: 100 },
          { x: -100, y: 0 },
        ],
        commonProps
      );
    } else if (frameType === "shield") {
      shapeObj = new Path("M -75 -75 L 75 -75 L 75 10 C 75 50 0 80 0 80 C 0 80 -75 50 -75 10 Z", { ...commonProps });
    }

    if (shapeObj) {
      shapeObj.frameId = fId;
      canvas.add(shapeObj);
      canvas.setActiveObject(shapeObj);
      canvas.requestRenderAll();
      saveHistory();

      // If an image is selected, clip it directly inside this frame
      const activeObj = canvas.getActiveObject();
      if (activeObj && activeObj.type === "image" && activeObj !== shapeObj) {
        const bounds = shapeObj.getBoundingRect(true);
        const scale = Math.max(bounds.width / activeObj.width, bounds.height / activeObj.height);
        
        activeObj.set({
          left: shapeObj.getCenterPoint().x,
          top: shapeObj.getCenterPoint().y,
          scaleX: scale,
          scaleY: scale,
        });

        const clip = await shapeObj.clone();
        clip.set({ absolutePositioned: true, evented: false, selectable: false });
        activeObj.clipPath = clip;
        activeObj.frameId = fId;
        canvas.requestRenderAll();
        saveHistory();
      }
    }
  };

  const insertWatermark = () => {
    addText("JEWELLERY AI STUDIO", {
      fontFamily: "Montserrat",
      fontSize: 32,
      fontWeight: "bold",
      fill: darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
      textAlign: "center",
      angle: -30,
      charSpacing: 250,
      isWatermark: true,
    });
  };

  const triggerLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadMedia(file);
    if (!url) return;

    const canvas = fabricRef.current;
    if (!canvas) return;

    const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
    const scale = 110 / img.width;
    
    img.set({
      left: CANVAS_WIDTH - 90,
      top: CANVAS_HEIGHT - 60,
      scaleX: scale,
      scaleY: scale,
      originX: "center",
      originY: "center",
      selectable: true,
      isLogo: true,
    });

    canvas.add(img);
    canvas.bringObjectToFront(img);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
    saveHistory();
    alert("Logo inserted successfully! ⚜️");
  };

  const insertPriceTag = () => {
    addText("$1,299", {
      fontFamily: "Inter",
      fontSize: 20,
      fontWeight: "bold",
      fill: "#d4af37", // elegant gold
      backgroundColor: darkMode ? "#1a1a1e" : "#fbfbfa",
      padding: 12,
      stroke: "#d4af37",
      strokeWidth: 1.5,
      textAlign: "center",
      isPriceTag: true,
    });
  };

  const insertProductName = () => {
    addText("EMERALD CUT NECKLACE", {
      fontFamily: "Georgia",
      fontSize: 28,
      fontWeight: "bold",
      fill: darkMode ? "#ffffff" : "#1a1a1e",
      textAlign: "center",
      isProductName: true,
    });
  };

  const insertOfferBadge = () => {
    addText("25% OFF", {
      fontFamily: "Montserrat",
      fontSize: 16,
      fontWeight: "bold",
      fill: "#111113",
      backgroundColor: "#c5a880",
      padding: 8,
      textAlign: "center",
      isOfferBadge: true,
    });
  };

  const insertCollectionName = () => {
    addText("THE RENAISSANCE COLLECTION", {
      fontFamily: "Inter",
      fontSize: 13,
      charSpacing: 250,
      fill: "#c5a880",
      textAlign: "center",
      isCollectionName: true,
    });
  };

  const applyCutCopyPaste = async (action) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas) return;

    if (action === "cut" && obj) {
      const cloned = await obj.clone();
      clipboardRef.current = cloned;
      canvas.remove(obj);
      canvas.requestRenderAll();
      saveHistory();
    } else if (action === "copy" && obj) {
      const cloned = await obj.clone();
      clipboardRef.current = cloned;
    } else if (action === "paste" && clipboardRef.current) {
      const clonedObj = await clipboardRef.current.clone();
      clonedObj.set({
        left: (clonedObj.left || 100) + 30,
        top: (clonedObj.top || 100) + 30,
        evented: true,
        selectable: true,
      });
      canvas.add(clonedObj);
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const cutSelected = () => applyCutCopyPaste("cut");
  const copySelected = () => applyCutCopyPaste("copy");
  const pasteCopied = () => applyCutCopyPaste("paste");

  /* ---------------- CONTENT RENDERING SIDEBAR DETAILS ---------------- */
  const renderSidebarDetails = () => {
    switch (activeTab) {
      case "uploads":
        return (
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text} sx={{ letterSpacing: 1 }}>
              MEDIA UPLOADER
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUpload />}
                sx={{
                  textTransform: "none",
                  borderColor: colors.accent,
                  color: colors.accent,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: colors.accentDark,
                    bgcolor: colors.activeTabBg,
                  },
                }}
              >
                Upload Image
                <input hidden type="file" accept="image/*" onChange={handleUpload} />
              </Button>

              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<VideoLibrary />}
                sx={{
                  textTransform: "none",
                  borderColor: colors.accent,
                  color: colors.accent,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: colors.accentDark,
                    bgcolor: colors.activeTabBg,
                  },
                }}
              >
                Upload Video
                <input hidden type="file" accept="video/*" onChange={handleVideoUpload} />
              </Button>
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={removeBgEnabled}
                  onChange={(e) => setRemoveBgEnabled(e.target.checked)}
                  color="warning"
                />
              }
              label={
                <Typography variant="body2" color={colors.text}>
                  AI Remove Background on Upload
                </Typography>
              }
            />

            <Divider sx={{ borderColor: colors.border }} />

            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              RECENTLY UPLOADED
            </Typography>

            {uploadedImages.length === 0 && uploadedVideos.length === 0 ? (
              <Box
                sx={{
                  border: `1px dashed ${colors.border}`,
                  borderRadius: 3,
                  p: 4,
                  textAlign: "center",
                  color: colors.textMuted,
                }}
              >
                <CloudUpload sx={{ fontSize: 32, mb: 1, opacity: 0.6 }} />
                <Typography variant="caption" display="block">
                  Your uploaded assets will appear here.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={1}>
                {uploadedImages.map((url, idx) => (
                  <Grid item xs={4} key={idx}>
                    <Box
                      component="img"
                      src={url}
                      alt="uploaded"
                      onClick={async () => {
                        const imgObj = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
                        const scale = Math.min(CANVAS_WIDTH / imgObj.width, CANVAS_HEIGHT / imgObj.height) * 0.45;
                        imgObj.set({
                          left: CANVAS_WIDTH / 2,
                          top: CANVAS_HEIGHT / 2,
                          originX: "center",
                          originY: "center",
                          scaleX: scale,
                          scaleY: scale,
                        });
                        fabricRef.current?.add(imgObj);
                        fabricRef.current?.requestRenderAll();
                      }}
                      sx={{
                        width: "100%",
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 1.5,
                        cursor: "pointer",
                        border: `1px solid ${colors.border}`,
                        "&:hover": { borderColor: colors.accent },
                      }}
                    />
                  </Grid>
                ))}
                {uploadedVideos.map((url, idx) => (
                  <Grid item xs={4} key={idx}>
                    <Box
                      onClick={() => addVideoToCanvas(url)}
                      sx={{
                        width: "100%",
                        height: 70,
                        borderRadius: 1.5,
                        cursor: "pointer",
                        border: `1px solid ${colors.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: darkMode ? "#121214" : "#f5f5f7",
                        position: "relative",
                        "&:hover": { borderColor: colors.accent },
                      }}
                    >
                      <VideoLibrary sx={{ color: colors.accent, fontSize: 24 }} />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 2,
                          right: 2,
                          bgcolor: "rgba(0,0,0,0.6)",
                          px: 0.5,
                          borderRadius: 0.5,
                          fontSize: 8,
                          color: "white",
                        }}
                      >
                        MP4
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        );

      case "text":
        return (
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text} sx={{ letterSpacing: 1 }}>
              TYPOGRAPHY
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => addText("ADD TITLE", { fontSize: 36, fontWeight: "bold", fontFamily: "Georgia" })}
              sx={{
                textTransform: "none",
                bgcolor: colors.accent,
                color: "#111113",
                fontWeight: 700,
                borderRadius: 2,
                "&:hover": { bgcolor: colors.accentDark },
              }}
            >
              Add Heading (Georgia)
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => addText("Add sub-heading", { fontSize: 22, fontFamily: "Arial" })}
              sx={{
                textTransform: "none",
                borderColor: colors.border,
                color: colors.text,
                borderRadius: 2,
                "&:hover": { borderColor: colors.text, bgcolor: colors.activeTabBg },
              }}
            >
              Add Subtitle (Arial)
            </Button>

            <Divider sx={{ borderColor: colors.border }} />

            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              JEWELLERY TYPOGRAPHY TEMPLATES
            </Typography>

            <Stack spacing={1}>
              <Button
                variant="outlined"
                fullWidth
                onClick={insertProductName}
                startIcon={<FontDownload sx={{ color: colors.accent }} />}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  borderColor: colors.border,
                  color: colors.text,
                  py: 1.2,
                  "&:hover": { borderColor: colors.accent },
                }}
              >
                Insert Product Name Style
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={insertCollectionName}
                startIcon={<FontDownload sx={{ color: colors.accent }} />}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  borderColor: colors.border,
                  color: colors.text,
                  py: 1.2,
                  "&:hover": { borderColor: colors.accent },
                }}
              >
                Insert Collection Name Style
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={insertPriceTag}
                startIcon={<LocalAtm sx={{ color: colors.accent }} />}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  borderColor: colors.border,
                  color: colors.text,
                  py: 1.2,
                  "&:hover": { borderColor: colors.accent },
                }}
              >
                Insert Luxury Price Tag
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={insertOfferBadge}
                startIcon={<LocalOffer sx={{ color: colors.accent }} />}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  borderColor: colors.border,
                  color: colors.text,
                  py: 1.2,
                  "&:hover": { borderColor: colors.accent },
                }}
              >
                Insert Promo Offer Badge
              </Button>
            </Stack>
          </Stack>
        );

      case "elements":
        return (
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text} sx={{ letterSpacing: 1 }}>
              GEOMETRIC SHAPES
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <LuxurySelect
                isDark={darkMode}
                value={shapeType}
                onChange={setShapeType}
                options={[
                  { value: "rectangle", label: "Rectangle" },
                  { value: "circle", label: "Circle" },
                  { value: "triangle", label: "Triangle" },
                  { value: "heart", label: "Heart" },
                ]}
                style={{ flex: 1 }}
              />
              <LuxurySelect
                isDark={darkMode}
                value={shapeBorder ? "true" : "false"}
                onChange={(v) => setShapeBorder(v === "true")}
                options={[
                  { value: "false", label: "No Border" },
                  { value: "true", label: "Gold Border" },
                ]}
                style={{ flex: 1 }}
              />
            </Stack>
            <Button
              variant="contained"
              onClick={addShape}
              fullWidth
              startIcon={<Category />}
              sx={{
                bgcolor: colors.accent,
                color: "#111113",
                fontWeight: 700,
                borderRadius: 2,
                "&:hover": { bgcolor: colors.accentDark },
              }}
            >
              Insert Shape
            </Button>

            <Divider sx={{ borderColor: colors.border }} />

            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              JEWELLERY BRANDING TOOLS
            </Typography>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                fullWidth
                onClick={insertWatermark}
                startIcon={<WaterDrop sx={{ color: colors.accent }} />}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  borderColor: colors.border,
                  color: colors.text,
                  py: 1.2,
                  "&:hover": { borderColor: colors.accent },
                }}
              >
                Add Studio Watermark
              </Button>

              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Label sx={{ color: colors.accent }} />}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  borderColor: colors.border,
                  color: colors.text,
                  py: 1.2,
                  "&:hover": { borderColor: colors.accent },
                }}
              >
                Add Logo watermark
                <input hidden type="file" accept="image/*" onChange={triggerLogoUpload} />
              </Button>
            </Stack>

            <Divider sx={{ borderColor: colors.border }} />

            {/* Emojis Picker in Sidebar */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
                EMOJIS / STICKERS
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  setEmojiPickerAnchor(e.currentTarget);
                  setShowEmojiPicker((prev) => !prev);
                }}
              >
                <EmojiEmotions sx={{ color: colors.accent }} />
              </IconButton>
            </Stack>
          </Stack>
        );

      case "frames":
        return (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color={colors.text} sx={{ letterSpacing: 1 }}>
                PRODUCT CONTAINERS
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Select an image on the canvas and click a frame to clip it, or click a frame to insert a container template.
              </Typography>
            </Box>

            <Grid container spacing={1.5}>
              {[
                { type: "circle", label: "Circular Arch", shape: "50%" },
                { type: "oval", label: "Luxury Oval", shape: "50% / 70%" },
                { type: "arch", label: "Royal Arch", shape: "50% 50% 0 0" },
                { type: "diamond", label: "Fine Diamond", shape: "polygon" },
                { type: "shield", label: "Classic Shield", shape: "shield" },
              ].map((frame, idx) => (
                <Grid item xs={6} key={idx}>
                  <Box
                    onClick={() => insertProductFrame(frame.type)}
                    sx={{
                      height: 90,
                      border: `1.5px solid ${colors.border}`,
                      borderRadius: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      bgcolor: colors.inputBg,
                      transition: "0.2s",
                      "&:hover": {
                        borderColor: colors.accent,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        border: "2px solid #c5a880",
                        borderRadius: frame.shape === "polygon" || frame.shape === "shield" ? "4px" : frame.shape,
                        transform: frame.shape === "polygon" ? "rotate(45deg)" : "none",
                        mb: 1,
                        bgcolor: "rgba(197, 168, 128, 0.1)",
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: colors.text }}>
                      {frame.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>
        );

      case "backgrounds":
        return (
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text} sx={{ letterSpacing: 1 }}>
              CANVAS BACKGROUNDS
            </Typography>

            <LuxurySelect
              isDark={darkMode}
              value={bgType}
              onChange={setBgType}
              options={[
                { value: "solid", label: "Solid Background Color" },
                { value: "linear", label: "Linear Gradient Blend" },
                { value: "radial", label: "Radial Gradient Highlight" },
              ]}
            />

            {bgType === "solid" ? (
              <Stack spacing={1}>
                <Typography variant="caption" color={colors.textMuted}>
                  Pick Solid Color
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    type="color"
                    size="small"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    sx={{
                      width: 50,
                      flexShrink: 0,
                      "& input": { p: "4px", cursor: "pointer" },
                    }}
                  />
                  <TextField
                    size="small"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    fullWidth
                    sx={{ bgcolor: colors.inputBg }}
                    inputProps={{ style: { color: colors.text, fontSize: 13 } }}
                  />
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                <Typography variant="caption" color={colors.textMuted}>
                  Gradient Stops
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    type="color"
                    size="small"
                    value={gradientColors[0]}
                    onChange={(e) => setGradientColors([e.target.value, gradientColors[1]])}
                    sx={{ width: "50%", "& input": { p: "4px", cursor: "pointer" } }}
                  />
                  <TextField
                    type="color"
                    size="small"
                    value={gradientColors[1]}
                    onChange={(e) => setGradientColors([gradientColors[0], e.target.value])}
                    sx={{ width: "50%", "& input": { p: "4px", cursor: "pointer" } }}
                  />
                </Stack>
              </Stack>
            )}

            <Divider sx={{ borderColor: colors.border }} />

            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              BACKGROUND FIT STYLE
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button
                variant={bgFit === "cover" ? "contained" : "outlined"}
                fullWidth
                onClick={() => setBgFit("cover")}
                sx={{
                  textTransform: "none",
                  bgcolor: bgFit === "cover" ? colors.accent : "transparent",
                  color: bgFit === "cover" ? "#111" : colors.text,
                  borderColor: colors.border,
                  borderRadius: 2,
                }}
              >
                Cover
              </Button>
              <Button
                variant={bgFit === "contain" ? "contained" : "outlined"}
                fullWidth
                onClick={() => setBgFit("contain")}
                sx={{
                  textTransform: "none",
                  bgcolor: bgFit === "contain" ? colors.accent : "transparent",
                  color: bgFit === "contain" ? "#11" : colors.text,
                  borderColor: colors.border,
                  borderRadius: 2,
                }}
              >
                Contain
              </Button>
            </Stack>
          </Stack>
        );

      case "filters":
        return (
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text} sx={{ letterSpacing: 1 }}>
              LUXURY PRESETS
            </Typography>

            <LuxurySelect
              isDark={darkMode}
              value={filterTarget}
              onChange={setFilterTarget}
              options={[
                { value: "selected-image", label: "Apply to Selected Image" },
                { value: "selected-product", label: "Apply to Product Only" },
                { value: "entire-design", label: "Apply to Entire Design" },
              ]}
            />

            <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 0.5 }}>
              <Grid container spacing={1.5}>
                {[
                  { name: "none", label: "Original", grad: "linear-gradient(45deg, #f0ece4, #c9bfaf)" },
                  { name: "Luxury Gold", label: "Luxury Gold", grad: "linear-gradient(45deg, #d4af37, #85581A)" },
                  { name: "Diamond Shine", label: "Diamond", grad: "linear-gradient(45deg, #e0f7fa, #00acc1)" },
                  { name: "Premium Silver", label: "Silver", grad: "linear-gradient(45deg, #cfd8dc, #546e7a)" },
                  { name: "Rose Gold", label: "Rose Gold", grad: "linear-gradient(45deg, #f8bbd0, #b76e79)" },
                  { name: "Royal Black", label: "Royal Black", grad: "linear-gradient(45deg, #37474f, #101012)" },
                  { name: "Velvet Luxury", label: "Velvet", grad: "linear-gradient(45deg, #880e4f, #310010)" },
                  { name: "Bright Catalogue", label: "Bright", grad: "linear-gradient(45deg, #ffffff, #cfd8dc)" },
                  { name: "Instagram Ready", label: "Instagram", grad: "linear-gradient(45deg, #ffcc80, #e65100)" },
                  { name: "Soft Glow", label: "Soft Glow", grad: "linear-gradient(45deg, #f5f5f5, #ffeb3b)" },
                  { name: "High Contrast", label: "Hi-Contrast", grad: "linear-gradient(45deg, #000, #fff)" },
                  { name: "Warm Luxury", label: "Warm", grad: "linear-gradient(45deg, #ffe082, #ff8f00)" },
                  { name: "Cool Studio", label: "Cool", grad: "linear-gradient(45deg, #e0f2f1, #009688)" },
                ].map((item) => {
                  const isSelected = filtersState.preset === item.name;
                  return (
                    <Grid item xs={4} key={item.name}>
                      <Box
                        onClick={() => applyPresetFilter(item.name)}
                        sx={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: isSelected
                            ? `2.5px solid ${colors.accent}`
                            : `1.5px solid ${colors.border}`,
                          cursor: "pointer",
                          bgcolor: colors.surfaceCard,
                          transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                          boxShadow: isSelected
                            ? `0 0 0 3px ${colors.accentLight}, 0 4px 12px rgba(197,168,128,0.22)`
                            : colors.shadowMd,
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 20px rgba(197,168,128,0.18)`,
                            borderColor: colors.accent,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            height: 50,
                            background: item.grad,
                            position: "relative",
                          }}
                        >
                          {isSelected && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                bgcolor: colors.accent,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 8,
                                color: "#111",
                                fontWeight: 900,
                              }}
                            >
                              ✓
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ px: 0.75, py: 0.6 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: 9,
                              fontWeight: isSelected ? 800 : 600,
                              display: "block",
                              color: isSelected ? colors.accent : colors.text,
                              letterSpacing: 0.2,
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            <Divider sx={{ borderColor: colors.border }} />

            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              ADJUSTMENT SLIDERS
            </Typography>

            <Box sx={{ maxHeight: 200, overflowY: "auto", pr: 0.5 }}>
              {[
                { label: "Brightness", key: "brightness", min: -0.8, max: 0.8, step: 0.02 },
                { label: "Contrast", key: "contrast", min: -0.8, max: 0.8, step: 0.02 },
                { label: "Saturation", key: "saturation", min: -1.0, max: 1.0, step: 0.02 },
                { label: "Exposure", key: "exposure", min: -0.8, max: 0.8, step: 0.02 },
                { label: "Blur", key: "blur", min: 0.0, max: 0.8, step: 0.02 },
                { label: "Highlights", key: "highlights", min: -0.8, max: 0.8, step: 0.02 },
                { label: "Shadows", key: "shadows", min: -0.8, max: 0.8, step: 0.02 },
              ].map((slider) => (
                <Box key={slider.key} sx={{ mb: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color={colors.text} sx={{ fontWeight: 600 }}>
                      {slider.label}
                    </Typography>
                    <Typography variant="caption" color={colors.accent} sx={{ fontWeight: 700 }}>
                      {filtersState[slider.key] > 0 ? `+${Math.round(filtersState[slider.key] * 100)}` : Math.round(filtersState[slider.key] * 100)}
                    </Typography>
                  </Stack>
                  <MuiSlider
                    size="small"
                    value={filtersState[slider.key]}
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    onChange={(e, val) => updateFilterSetting(slider.key, val)}
                    sx={{ color: colors.accent }}
                  />
                </Box>
              ))}
            </Box>
          </Stack>
        );

      case "brandkit":
        return (
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text} sx={{ letterSpacing: 1 }}>
              BRAND COLOR PALETTES
            </Typography>

            {[
              { name: "Royal Gold Accent", colors: ["#d4af37", "#a0845c", "#1c1c1e", "#ffffff"] },
              { name: "Shining Platinum", colors: ["#e4e4e0", "#cfd8dc", "#546e7a", "#121214"] },
              { name: "Rose Luxury", colors: ["#b76e79", "#f8bbd0", "#ffd54f", "#111113"] },
              { name: "Classic Jewel", colors: ["#097969", "#ffd700", "#1c1c1c", "#f5f5f3"] },
            ].map((palette, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  border: `1.5px solid ${colors.border}`,
                  bgcolor: colors.inputBg,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: "block", color: colors.text }}>
                  {palette.name}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {palette.colors.map((c, cIdx) => (
                    <Box
                      key={cIdx}
                      onClick={() => {
                        setBgColor(c);
                        setBgType("solid");
                        applyBackground();
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: c,
                        border: `1px solid ${colors.border}`,
                        cursor: "pointer",
                        transition: "0.2s",
                        "&:hover": { transform: "scale(1.15)" },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        );

      case "layers":
        return (
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text} sx={{ letterSpacing: 1 }}>
              CANVAS LAYERS
            </Typography>

            <Box sx={{ maxHeight: 380, overflowY: "auto" }}>
              {fabricRef.current?.getObjects()
                .filter((o) => !o.isBgImage)
                .reverse()
                .map((obj, idx) => {
                  const isSelected = selectedObject === obj;
                  return (
                    <Stack
                      key={idx}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      onClick={() => {
                        fabricRef.current?.setActiveObject(obj);
                        fabricRef.current?.requestRenderAll();
                      }}
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: isSelected ? colors.activeTabBg : "transparent",
                        border: isSelected ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
                        mb: 1,
                        cursor: "pointer",
                        transition: "0.2s",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: isSelected ? colors.accent : colors.textMuted,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text }}>
                          {obj.isProduct ? "💎 Product Image" : obj.isLogo ? "⚜️ Logo Image" : obj.type === "textbox" ? `🔤 Text: "${obj.text.substring(0, 10)}..."` : `📦 Shape: ${obj.type}`}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            fabricRef.current?.setActiveObject(obj);
                            bringForwardSafe();
                          }}
                        >
                          <North sx={{ fontSize: 14, color: colors.textMuted }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            fabricRef.current?.setActiveObject(obj);
                            sendBackwardSafe();
                          }}
                        >
                          <South sx={{ fontSize: 14, color: colors.textMuted }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            fabricRef.current?.remove(obj);
                            fabricRef.current?.requestRenderAll();
                          }}
                        >
                          <Delete sx={{ fontSize: 14, color: "error.main" }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  );
                })}
            </Box>
          </Stack>
        );

      case "ai":
        return (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color={colors.text} sx={{ letterSpacing: 1 }}>
                ⚜️ AI CREATIVE STUDIO
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Leverage generative models specifically adjusted for luxury jewelry visuals.
              </Typography>
            </Box>

            {[
              { title: "AI Studio Backgrounds", desc: "Instantly place jewelry onto luxury marbles or silk." },
              { title: "AI Fine Retoucher", desc: "Increase gold shine, metal polish, and diamond reflections." },
              { title: "AI Model Placement", desc: "Generatively display rings and necklaces on custom AI models." },
              { title: "AI Multi-Shots", desc: "Create multiple catalog layouts from a single upload." },
            ].map((ai, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: darkMode
                    ? "linear-gradient(135deg, #242429, #1b1b1e)"
                    : "linear-gradient(135deg, #fdfdfd, #f6f6f2)",
                  border: `1px solid ${colors.border}`,
                  position: "relative",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 4,
                    height: "100%",
                    bgcolor: colors.accent,
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.text }}>
                    {ai.title}
                  </Typography>
                  <Badge
                    badgeContent="Coming Soon"
                    sx={{
                      "& .MuiBadge-badge": {
                        bgcolor: colors.activeTabBg,
                        color: colors.accent,
                        border: `1.5px solid ${colors.accent}`,
                        fontSize: 9,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                      },
                    }}
                  />
                </Stack>
                <Typography variant="caption" color={colors.textMuted} display="block">
                  {ai.desc}
                </Typography>
              </Box>
            ))}
          </Stack>
        );

      default:
        return null;
    }
  };

  /* ---------------- RIGHT PANEL CONTEXT AWARE CONTROLLER ---------------- */
  const renderRightPanelContent = () => {
    if (!selectedObject) {
      // Default Panel when nothing selected
      return (
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text} sx={{ letterSpacing: 0.5 }}>
              STUDIO PROPERTIES
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              Configure overall studio parameters or click an element on the canvas to configure it.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: colors.border }} />

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              ACTIVE SHOT DIMENSIONS
            </Typography>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: colors.inputBg, border: `1px solid ${colors.border}` }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: colors.text }}>
                {templateType === "post" ? "Square Instagram Post" : "Landscape Banner"}
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {CANVAS_WIDTH} x {CANVAS_HEIGHT} px
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              SHORTCUTS HELP
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color={colors.textMuted}>Layer Front</Typography>
                <Typography variant="caption" color={colors.accent} fontWeight={700}>{forwardShortcut}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color={colors.textMuted}>Layer Back</Typography>
                <Typography variant="caption" color={colors.accent} fontWeight={700}>{backwardShortcut}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color={colors.textMuted}>Undo Changes</Typography>
                <Typography variant="caption" color={colors.accent} fontWeight={700}>Ctrl + Z</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color={colors.textMuted}>Redo Changes</Typography>
                <Typography variant="caption" color={colors.accent} fontWeight={700}>Ctrl + Y</Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      );
    }

    // Context Aware Typography Properties
    if (selectedObject.type === "textbox") {
      return (
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text}>
              TYPOGRAPHY STYLES
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              Configure font styles, casing, scale, and positioning.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: colors.border }} />

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              FONT FAMILY
            </Typography>
            <LuxurySelect
              isDark={darkMode}
              value={fontFamily}
              onChange={(newFont) => {
                setFontFamily(newFont);
                updateTextStyles(selectedObject, { fontFamily: newFont });
              }}
              options={[
                { value: "Georgia", label: "Georgia", fontFamily: "Georgia" },
                { value: "Times New Roman", label: "Times New Roman", fontFamily: "Times New Roman" },
                { value: "Arial", label: "Arial", fontFamily: "Arial" },
                { value: "Verdana", label: "Verdana", fontFamily: "Verdana" },
                { value: "Impact", label: "Impact", fontFamily: "Impact" },
                { value: "Montserrat", label: "Montserrat" },
                { value: "Playfair Display", label: "Playfair Display" },
              ]}
            />
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              FONT SIZE
            </Typography>
            <LuxurySelect
              isDark={darkMode}
              value={String(fontSize)}
              onChange={(v) => {
                const size = +v;
                setFontSize(size);
                updateTextStyles(selectedObject, { fontSize: size });
              }}
              options={[12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64].map((s) => ({
                value: String(s),
                label: `${s}px`,
              }))}
            />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              TEXT CASE AND ALIGNMENT
            </Typography>
            <Stack direction="row" spacing={1}>
              <LuxurySelect
              isDark={darkMode}
              value={textCase}
              onChange={applyTextCase}
              options={[
                { value: "none", label: "Default Case" },
                { value: "upper", label: "UPPERCASE" },
                { value: "lower", label: "lowercase" },
                { value: "capitalize", label: "Capitalize Words" },
              ]}
            />
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              FORMATTING
            </Typography>
            <Stack direction="row" spacing={0.5} justifyContent="space-between">
              <IconButton
                onClick={() => toggleStyle("bold")}
                sx={{
                  bgcolor: activeTextProps.bold ? colors.activeTabBg : "transparent",
                  border: `1px solid ${activeTextProps.bold ? colors.accent : colors.border}`,
                  borderRadius: 2,
                }}
              >
                <FormatBold sx={{ color: activeTextProps.bold ? colors.accent : colors.text }} />
              </IconButton>
              <IconButton
                onClick={() => toggleStyle("italic")}
                sx={{
                  bgcolor: activeTextProps.italic ? colors.activeTabBg : "transparent",
                  border: `1px solid ${activeTextProps.italic ? colors.accent : colors.border}`,
                  borderRadius: 2,
                }}
              >
                <FormatItalic sx={{ color: activeTextProps.italic ? colors.accent : colors.text }} />
              </IconButton>
              <IconButton
                onClick={() => toggleStyle("underline")}
                sx={{
                  bgcolor: activeTextProps.underline ? colors.activeTabBg : "transparent",
                  border: `1px solid ${activeTextProps.underline ? colors.accent : colors.border}`,
                  borderRadius: 2,
                }}
              >
                <FormatUnderlined sx={{ color: activeTextProps.underline ? colors.accent : colors.text }} />
              </IconButton>

              <Divider orientation="vertical" flexItem sx={{ borderColor: colors.border }} />

              <IconButton
                onClick={() => setAlignment("left")}
                sx={{
                  bgcolor: activeTextProps.align === "left" ? colors.activeTabBg : "transparent",
                  borderRadius: 2,
                }}
              >
                <FormatAlignLeft sx={{ color: activeTextProps.align === "left" ? colors.accent : colors.text }} />
              </IconButton>
              <IconButton
                onClick={() => setAlignment("center")}
                sx={{
                  bgcolor: activeTextProps.align === "center" ? colors.activeTabBg : "transparent",
                  borderRadius: 2,
                }}
              >
                <FormatAlignCenter sx={{ color: activeTextProps.align === "center" ? colors.accent : colors.text }} />
              </IconButton>
              <IconButton
                onClick={() => setAlignment("right")}
                sx={{
                  bgcolor: activeTextProps.align === "right" ? colors.activeTabBg : "transparent",
                  borderRadius: 2,
                }}
              >
                <FormatAlignRight sx={{ color: activeTextProps.align === "right" ? colors.accent : colors.text }} />
              </IconButton>
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              FONT COLOR
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                type="color"
                size="small"
                value={textColor}
                onChange={(e) => {
                  const val = e.target.value;
                  setTextColor(val);
                  updateTextStyles(selectedObject, { fill: val });
                }}
                sx={{ width: 44, "& input": { p: "4px", cursor: "pointer" } }}
              />
              <TextField
                size="small"
                value={textColor}
                onChange={(e) => {
                  const val = e.target.value;
                  setTextColor(val);
                  updateTextStyles(selectedObject, { fill: val });
                }}
                fullWidth
                sx={{ bgcolor: colors.inputBg }}
                inputProps={{ style: { color: colors.text, fontSize: 13 } }}
              />
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: colors.border }} />

          <Button
            variant="outlined"
            fullWidth
            color="error"
            startIcon={<Delete />}
            onClick={removeSelected}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Delete Layer
          </Button>
        </Stack>
      );
    }

    // Context Aware Image / Product Properties
    if (selectedObject.type === "image") {
      return (
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text}>
              {selectedObject.isProduct ? "💎 PRODUCT CONTROLS" : "IMAGE OPTIONS"}
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              Adjust opacity, depth order, or swap images inside templates.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: colors.border }} />

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              REPLACE PRODUCT
            </Typography>
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{
                bgcolor: colors.accent,
                color: "#111113",
                fontWeight: 700,
                borderRadius: 2,
                "&:hover": { bgcolor: colors.accentDark },
              }}
            >
              Upload New Image / Swap
              <input hidden type="file" accept="image/*" onChange={triggerReplaceProduct} />
            </Button>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              TRANSPARENCY
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <MuiSlider
                size="small"
                value={opacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(e, val) => {
                  setOpacity(val);
                  selectedObject.set({ opacity: val });
                  fabricRef.current?.requestRenderAll();
                }}
                sx={{ color: colors.accent, flex: 1 }}
              />
              <Typography variant="caption" color={colors.text} sx={{ fontWeight: 700 }}>
                {Math.round(opacity * 100)}%
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              DEPTH ALIGNMENT
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                fullWidth
                onClick={sendImageToBack}
                startIcon={<South />}
                sx={{
                  textTransform: "none",
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: 2,
                }}
              >
                Send Back
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={sendImageToFront}
                startIcon={<North />}
                sx={{
                  textTransform: "none",
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: 2,
                }}
              >
                Bring Front
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              CROP IMAGE
            </Typography>
            {isCropping ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  fullWidth
                  color="success"
                  onClick={applyCrop}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Done
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={cancelCrop}
                  sx={{ textTransform: "none", borderRadius: 2, color: colors.text, borderColor: colors.border }}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setIsCropping(true);
                  if (fabricRef.current) fabricRef.current.selection = false;
                }}
                startIcon={<Crop />}
                sx={{
                  textTransform: "none",
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: 2,
                }}
              >
                Start Crop Box
              </Button>
            )}
          </Stack>

          <Divider sx={{ borderColor: colors.border }} />

          <Button
            variant="outlined"
            fullWidth
            color="error"
            startIcon={<Delete />}
            onClick={removeSelected}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Delete Layer
          </Button>
        </Stack>
      );
    }

    // Context Aware Shape Properties
    if (["rect", "circle", "polygon", "path"].includes(selectedObject.type)) {
      return (
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color={colors.text}>
              SHAPE PARAMETERS
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              Modify fill colors, stroke borders, or convert shapes to frames.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: colors.border }} />

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              FILL COLOR
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <input
                type="color"
                value={selectedObject.fill === "transparent" ? "#ffffff" : selectedObject.fill}
                onChange={(e) => {
                  selectedObject.set({ fill: e.target.value });
                  fabricRef.current?.requestRenderAll();
                  saveHistory();
                }}
                style={{ width: 44, height: 36, border: `1px solid ${colors.border}`, borderRadius: 4, cursor: "pointer" }}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  selectedObject.set({ fill: "transparent" });
                  fabricRef.current?.requestRenderAll();
                  saveHistory();
                }}
                sx={{ textTransform: "none", color: colors.text, borderColor: colors.border, borderRadius: 2 }}
              >
                No Fill
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              BORDER STROKE
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!selectedObject.stroke && selectedObject.strokeWidth > 0}
                    onChange={(e) => {
                      const hasStroke = e.target.checked;
                      selectedObject.set({
                        stroke: hasStroke ? "#c5a880" : null,
                        strokeWidth: hasStroke ? 2 : 0,
                      });
                      fabricRef.current?.requestRenderAll();
                      saveHistory();
                    }}
                    color="warning"
                  />
                }
                label={
                  <Typography variant="caption" color={colors.text}>
                    Draw Gold Outline
                  </Typography>
                }
              />
            </Stack>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="caption" fontWeight={600} color={colors.textMuted}>
              TRANSPARENCY
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <MuiSlider
                size="small"
                value={opacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(e, val) => {
                  setOpacity(val);
                  selectedObject.set({ opacity: val });
                  fabricRef.current?.requestRenderAll();
                }}
                sx={{ color: colors.accent, flex: 1 }}
              />
              <Typography variant="caption" color={colors.text} sx={{ fontWeight: 700 }}>
                {Math.round(opacity * 100)}%
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: colors.border }} />

          <Button
            variant="outlined"
            fullWidth
            color="error"
            startIcon={<Delete />}
            onClick={removeSelected}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Delete Layer
          </Button>
        </Stack>
      );
    }

    return null;
  };

  return (
    <Box
      className={darkMode ? "dark-mode" : ""}
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        bgcolor: colors.bg,
        color: colors.text,
        transition: "background-color 0.25s ease, color 0.25s ease",
        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      }}
    >
      {/* 📥 EXPORT/DOWNLOAD MODAL LOADER */}
      {downloading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(10,10,12,0.85)",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
          }}
        >
          <AutoFixHigh sx={{ fontSize: 44, color: colors.accent, mb: 2, animate: "pulse" }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>
            Generating Luxury Assets...
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
            Render engines processing elements, clipping paths, and lighting layers.
          </Typography>
          <Box
            sx={{
              width: "45%",
              height: 4,
              bgcolor: "rgba(255,255,255,0.15)",
              borderRadius: 2,
              overflow: "hidden",
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: `${downloadProgress}%`,
                height: "100%",
                bgcolor: colors.accent,
                transition: "width 0.1s linear",
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: colors.accent }}>
            {Math.floor(downloadProgress)}% Completed
          </Typography>
        </Box>
      )}

      {/* ⚜️ EDITOR HEADER PANEL */}
      <Box
        sx={{
          height: 64,
          borderBottom: `1px solid ${colors.border}`,
          px: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: colors.panelBg,
          boxShadow: darkMode
            ? "0 1px 0 rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.3)"
            : "0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate(-1)}
            sx={{
              textTransform: "none",
              color: colors.text,
              border: `1.5px solid ${colors.border}`,
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: 12.5,
              height: 36,
              px: 1.5,
              "&:hover": { bgcolor: colors.activeTabBg, borderColor: colors.accent },
            }}
          >
            Templates
          </Button>

          <Divider orientation="vertical" flexItem sx={{ borderColor: colors.border, height: 28, my: "auto" }} />

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: colors.accent,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: colors.text,
                letterSpacing: 0.3,
                fontSize: 13,
              }}
            >
              Jewellery AI Studio
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Undo/Redo Buttons */}
          <Tooltip title="Undo (Ctrl+Z)">
            <IconButton
              size="small"
              onClick={undo}
              sx={{
                color: colors.textMuted,
                borderRadius: "8px",
                "&:hover": { color: colors.text, bgcolor: colors.hoverBg },
              }}
            >
              <UndoIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Y)">
            <IconButton
              size="small"
              onClick={redo}
              sx={{
                color: colors.textMuted,
                borderRadius: "8px",
                mr: 1,
                "&:hover": { color: colors.text, bgcolor: colors.hoverBg },
              }}
            >
              <RedoIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ borderColor: colors.border, height: 24, my: "auto", mx: 0.5 }} />

          {/* Theme Mode Switch */}
          <Tooltip title={darkMode ? "Switch to Light Luxury" : "Switch to Dark Studio"}>
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                color: darkMode ? "#ffd54f" : "#37474f",
                borderRadius: "8px",
                mx: 0.5,
                "&:hover": { bgcolor: colors.hoverBg },
              }}
            >
              {darkMode ? <LightMode sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ borderColor: colors.border, height: 24, my: "auto", mx: 0.5 }} />

          {/* Save & Download Buttons */}
          <Button
            variant="outlined"
            onClick={saveDesign}
            startIcon={<Save sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              border: `1.5px solid ${colors.border}`,
              color: colors.text,
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: 12.5,
              height: 38,
              px: { xs: 1.5, sm: 2 },
              mx: 0.5,
              "&:hover": { borderColor: colors.accent, bgcolor: colors.activeTabBg, color: colors.accent },
            }}
          >
            Save
          </Button>

          <Button
            variant="contained"
            onClick={downloadCanvas}
            startIcon={<Download sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              bgcolor: colors.accent,
              color: "#111113",
              fontWeight: 700,
              borderRadius: "10px",
              fontSize: 12.5,
              height: 38,
              px: { xs: 1.5, sm: 2 },
              boxShadow: `0 2px 10px rgba(197,168,128,0.35)`,
              "&:hover": { bgcolor: colors.accentDark, boxShadow: `0 4px 14px rgba(197,168,128,0.45)` },
            }}
          >
            Download
          </Button>
        </Stack>
      </Box>

      {/* ⚜️ MAIN WORKSPACE PANELS */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* LEFT SIDEBAR CONTROLLER */}
        <Box
          sx={{
            display: "flex",
            width: { xs: "100%", md: sidebarCollapsed ? 68 : 388 },
            borderRight: { xs: "none", md: `1px solid ${colors.border}` },
            borderBottom: { xs: `1px solid ${colors.border}`, md: "none" },
            bgcolor: colors.panelBg,
            transition: "width 0.22s ease-in-out",
            zIndex: 5,
            flexShrink: 0,
            height: { xs: "auto", md: "100%" },
          }}
        >
          {/* Narrow Left Selector Bar */}
          <Stack
            spacing={0.5}
             sx={{
              width: 68,
              borderRight: `1px solid ${colors.border}`,
              py: 1.5,
              alignItems: "center",
              bgcolor: colors.panelHeaderBg,
              flexShrink: 0,
              flexDirection: { xs: "row", md: "column" },
              justifyContent: { xs: "space-around", md: "flex-start" },
              height: { xs: 56, md: "100%" },
              p: { xs: 0.5, md: 1 },
              gap: { xs: 0, md: 0.5 },
            }}
          >
            {[
              { id: "filters", label: "Filters", icon: <AutoAwesome sx={{ fontSize: 20 }} /> },
              { id: "uploads", label: "Uploads", icon: <CloudUpload sx={{ fontSize: 20 }} /> },
              { id: "text", label: "Text", icon: <TextFields sx={{ fontSize: 20 }} /> },
              { id: "elements", label: "Elements", icon: <Category sx={{ fontSize: 20 }} /> },
              { id: "frames", label: "Frames", icon: <AspectRatio sx={{ fontSize: 20 }} /> },
              { id: "backgrounds", label: "Bg", icon: <Palette sx={{ fontSize: 20 }} /> },
              { id: "brandkit", label: "Brand", icon: <WaterDrop sx={{ fontSize: 20 }} /> },
              { id: "layers", label: "Layers", icon: <LayersIcon sx={{ fontSize: 20 }} /> },
              { id: "ai", label: "AI", icon: <AutoFixHigh sx={{ fontSize: 20 }} /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Stack
                  key={tab.id}
                  alignItems="center"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarCollapsed(false);
                  }}
                  sx={{
                    width: 52,
                    height: 54,
                    borderRadius: "10px",
                    justifyContent: "center",
                    cursor: "pointer",
                    bgcolor: isActive ? colors.activeTabBg : "transparent",
                    color: isActive ? colors.accent : colors.textMuted,
                    transition: "all 0.18s ease",
                    border: isActive
                      ? `1.5px solid ${colors.accent}`
                      : "1.5px solid transparent",
                    boxShadow: isActive
                      ? `0 2px 10px rgba(197,168,128,0.18)`
                      : "none",
                    "&:hover": {
                      color: colors.accent,
                      bgcolor: colors.activeTabBg,
                      border: `1.5px solid ${colors.border}`,
                    },
                  }}
                >
                  {tab.icon}
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 9,
                      fontWeight: 700,
                      mt: 0.5,
                      letterSpacing: 0.2,
                      lineHeight: 1,
                    }}
                  >
                    {tab.label}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>

          {/* Secondary Panel Pane details */}
          <Box
            sx={{
              flex: 1,
              p: 2.5,
              overflowY: "auto",
              display: { xs: "none", md: sidebarCollapsed ? "none" : "block" },
            }}
          >
            {renderSidebarDetails()}
          </Box>
        </Box>

        {/* MOBILE SLIDE OVER PANE */}
        <Drawer
          anchor="bottom"
          open={!sidebarCollapsed && activeTab !== "" && window.innerWidth < 900}
          onClose={() => setSidebarCollapsed(true)}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              height: "55vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              bgcolor: colors.panelBg,
              px: 3,
              py: 2.5,
              backgroundImage: "none",
            },
          }}
        >
          <Box sx={{ width: 40, height: 4, bgcolor: colors.border, borderRadius: 2, mx: "auto", mb: 2.5 }} />
          {renderSidebarDetails()}
        </Drawer>

        {/* CENTER CANVAS AREA */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            p: 2,
            overflow: "hidden",
          }}
        >
          {/* Floating Zoom & Pan Controls */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              position: "absolute",
              top: 14,
              right: 14,
              bgcolor: colors.panelBg,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              p: "6px 10px",
              boxShadow: colors.shadowMd,
              zIndex: 3,
              gap: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleZoom(0.9)}
              sx={{
                color: colors.textMuted,
                borderRadius: "8px",
                width: 28,
                height: 28,
                "&:hover": { color: colors.accent, bgcolor: colors.activeTabBg },
              }}
            >
              <ZoomOut sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: colors.accent,
                minWidth: 40,
                textAlign: "center",
                fontSize: 11,
              }}
            >
              {zoomPercent}%
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleZoom(1.1)}
              sx={{
                color: colors.textMuted,
                borderRadius: "8px",
                width: 28,
                height: 28,
                "&:hover": { color: colors.accent, bgcolor: colors.activeTabBg },
              }}
            >
              <ZoomIn sx={{ fontSize: 16 }} />
            </IconButton>
            <Box
              sx={{
                width: 1,
                height: 16,
                bgcolor: colors.border,
                mx: 0.5,
              }}
            />
            <Button
              size="small"
              onClick={resetZoom}
              sx={{
                textTransform: "none",
                fontSize: 10,
                fontWeight: 700,
                color: colors.textMuted,
                borderRadius: "8px",
                minWidth: 0,
                px: 1,
                height: 28,
                "&:hover": { bgcolor: colors.activeTabBg, color: colors.accent },
              }}
            >
              Fit
            </Button>
          </Stack>

          {/* Large Interactive Canvas Workspace */}
          <Box
            ref={wrapperRef}
            sx={{
              flex: 1,
              width: "100%",
              height: "100%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const emoji = e.dataTransfer.getData("emoji");
              if (!emoji) return;
              const pt = getCanvasPoint(e);
              addEmojiObject(emoji, pt.x, pt.y);
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                boxShadow: darkMode
                  ? "0 12px 40px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)"
                  : "0 12px 40px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)",
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
              }}
            />
          </Box>

          {/* Shot Navigator Bottom Bar (if multiple shots loaded) */}
          {templateShots && templateShots.length > 0 && (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                p: 1.5,
                width: "90%",
                maxWidth: 600,
                bgcolor: colors.panelBg,
                border: `1.5px solid ${colors.border}`,
                borderRadius: 4,
                boxShadow: colors.shadow,
                mb: 1.5,
                zIndex: 3,
                overflowX: "auto",
                flexShrink: 0,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.textMuted, whiteSpace: "nowrap", pl: 1 }}>
                Catalog Shots ({templateShots.length}):
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ overflowX: "auto", flex: 1 }}>
                {templateShots.map((shot, idx) => {
                  const isActive = activeBgImage === shot;
                  return (
                    <Box
                      key={idx}
                      component="img"
                      src={shot}
                      alt={`Shot ${idx + 1}`}
                      onClick={() => handleShotSwitch(shot)}
                      sx={{
                        width: 48,
                        height: 48,
                        objectFit: "contain",
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor: isActive ? colors.accent : "transparent",
                        bgcolor: darkMode ? "#111" : "#f0f0eb",
                        transition: "0.2s",
                        "&:hover": { borderColor: colors.accent },
                      }}
                    />
                  );
                })}
              </Stack>
            </Stack>
          )}
        </Box>

        {/* RIGHT SIDEBAR PROPERTIES PANEL */}
        <Box
          sx={{
            width: { xs: "100%", md: propertiesCollapsed ? 0 : 360 },
            borderLeft: { xs: "none", md: `1.5px solid ${colors.border}` },
            borderTop: { xs: `1.5px solid ${colors.border}`, md: "none" },
            bgcolor: colors.panelBg,
            p: propertiesCollapsed ? 0 : 2.5,
            transition: "width 0.2s ease-in-out, padding 0.2s ease-in-out",
            overflowY: "auto",
            zIndex: 5,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
          }}
        >
          {renderRightPanelContent()}
        </Box>

        {/* MOBILE SLIDE OVER PANEL (For Object Selection Properties) */}
        <Drawer
          anchor="bottom"
          open={!!selectedObject && window.innerWidth < 900}
          onClose={() => fabricRef.current?.discardActiveObject().requestRenderAll()}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              height: "45vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              bgcolor: colors.panelBg,
              px: 3,
              py: 2.5,
              backgroundImage: "none",
            },
          }}
        >
          <Box sx={{ width: 40, height: 4, bgcolor: colors.border, borderRadius: 2, mx: "auto", mb: 2.5 }} />
          {renderRightPanelContent()}
        </Drawer>
      </Box>

      {/* ⚜️ EMOJI FLOATING PICKER DIALOG */}
      <Popper
        open={Boolean(showEmojiPicker && emojiPickerAnchor)}
        anchorEl={emojiPickerAnchor}
        placement="bottom-start"
        sx={{ zIndex: 9999 }}
      >
        <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
          <Paper sx={{ width: 320, maxHeight: 350, overflowY: "auto", p: 2, bgcolor: colors.panelBg, border: `1.5px solid ${colors.border}` }}>
            {Object.entries(categories).map(([category, emojis]) => (
              <Box key={category} sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.accent, mb: 1, display: "block", textTransform: "uppercase" }}>
                  {category}
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 0.5 }}>
                  {emojis.map((emoji) => (
                    <Button
                      key={emoji}
                      onClick={() => {
                        addEmojiObject(emoji, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                        setShowEmojiPicker(false);
                      }}
                      sx={{
                        minWidth: 32,
                        minHeight: 32,
                        fontSize: 20,
                        p: 0,
                        color: colors.text,
                        "&:hover": { bgcolor: colors.activeTabBg },
                      }}
                    >
                      {emoji}
                    </Button>
                  ))}
                </Box>
              </Box>
            ))}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
