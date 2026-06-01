import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import HTMLFlipBook from "react-pageflip";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Canvas } from "fabric";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function FlipbookViewer() {
  const { id } = useParams();

  const [pages, setPages] = useState([]);
  const [bookSize, setBookSize] = useState({ width: 300, height: 300 });
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;

      setIsMobile(mobile);

      const width = mobile ? vw * 0.92 : vw * 0.35;
      const height = mobile ? vh * 0.65 : vh * 0.8;

      setBookSize({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Fetch flipbook
  useEffect(() => {
    const fetchFlipbook = async () => {
      try {
        const res = await axios.get(`${API_URL}/flipbooks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const flipbook = res.data;

        if (flipbook.type === "pdf") {
          await renderPdfToImages(flipbook.pdfUrl);
        } else {
          const designs = flipbook.designIds;

          const highResPages = await Promise.all(
            designs.map(async (design) => {
              const canvasEl = document.createElement("canvas");
              canvasEl.width = design.width;
              canvasEl.height = design.height;

              const canvas = new Canvas(canvasEl, {
                width: canvasEl.width,
                height: canvasEl.height,
                preserveObjectStacking: true,
              });

              return new Promise((resolve) => {
                canvas.loadFromJSON(
                  design.canvasJson,
                  () => {
                    canvas.requestRenderAll();
                    setTimeout(() => {
                      const dataURL = canvas.toDataURL({
                        format: "png",
                        multiplier: 2,
                      });
                      canvas.dispose();
                      resolve(dataURL);
                    }, 50);
                  },
                  (object, instance) => {
                    if (object.type === "image")
                      instance.set({ crossOrigin: "anonymous" });
                  },
                );
              });
            }),
          );

          setPages(highResPages);
          setLoading(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlipbook();
  }, [id]);

  // 🔥 Core: Render PDF to images
  const renderPdfToImages = async (pdfUrl) => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;

    const images = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      images.push(canvas.toDataURL("image/png"));
    }

    setPages(images);
  };

  // Loading
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress /> {/* MUI spinner */}
      </Box>
    );
  }

  if (!pages.length)
    return (
      <Typography
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        No Designs Found.
      </Typography>
    );

  // Render flipbook
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: 4,
      }}
    >
      <HTMLFlipBook
        key={`${bookSize.width}-${bookSize.height}`}
        width={bookSize.width}
        height={bookSize.height}
        usePortrait={isMobile}
        showCover={false}
        size="fixed"
        mobileScrollSupport={false}
        maxShadowOpacity={0.2}
      >
        {pages.map((img, i) => (
          <div key={i}>
            <img
              src={img}
              alt={`Page ${i + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              draggable={false}
            />
          </div>
        ))}
      </HTMLFlipBook>
    </Box>
  );
}
