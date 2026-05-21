import axios from 'axios';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, '') : '';

// Configure Multer for temp upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/jewellery/temp";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `temp-${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

export const uploadJewellery = multer({ storage });

// ─────────────────────────────────────────────────────────────
// TEMPLATE CONFIGURATIONS
// ─────────────────────────────────────────────────────────────
const TEMPLATE_CONFIGS = {
  ring: {
    folder: 'ring',
    items: [
      { name: 'white_fair', label: 'White Fair', prompt: 'High-quality clean studio photography of five fingers of a female hand till the wrist, flat lay, no rings, no jewelry, plain solid light gray background, skin tone: white fair' },
      { name: 'medium', label: 'Medium (white to olive)', prompt: 'High-quality clean studio photography of five fingers of a female hand till the wrist, flat lay, no rings, no jewelry, plain solid light gray background, skin tone: medium white to olive' },
      { name: 'olive', label: 'Olive Moderate Brown', prompt: 'High-quality clean studio photography of five fingers of a female hand till the wrist, flat lay, no rings, no jewelry, plain solid light gray background, skin tone: olive moderate brown' },
      { name: 'brown', label: 'Brown Dark Brown', prompt: 'High-quality clean studio photography of five fingers of a female hand till the wrist, flat lay, no rings, no jewelry, plain solid light gray background, skin tone: brown dark brown' },
      { name: 'black', label: 'Black Very Dark', prompt: 'High-quality clean studio photography of five fingers of a female hand till the wrist, flat lay, no rings, no jewelry, plain solid light gray background, skin tone: black very dark' }
    ]
  },
  bangle: {
    folder: 'bangle',
    items: [
      { name: 'white_fair', label: 'White Fair', prompt: 'High-quality clean studio photography of a female hand till the elbow, no bangles, no bracelets, plain solid light gray background, skin tone: white fair' },
      { name: 'medium', label: 'Medium (white to olive)', prompt: 'High-quality clean studio photography of a female hand till the elbow, no bangles, no bracelets, plain solid light gray background, skin tone: medium white to olive' },
      { name: 'olive', label: 'Olive Moderate Brown', prompt: 'High-quality clean studio photography of a female hand till the elbow, no bangles, no bracelets, plain solid light gray background, skin tone: olive moderate brown' },
      { name: 'brown', label: 'Brown Dark Brown', prompt: 'High-quality clean studio photography of a female hand till the elbow, no bangles, no bracelets, plain solid light gray background, skin tone: brown dark brown' },
      { name: 'black', label: 'Black Very Dark', prompt: 'High-quality clean studio photography of a female hand till the elbow, no bangles, no bracelets, plain solid light gray background, skin tone: black very dark' }
    ]
  },
  pendant: {
    folder: 'pendant',
    items: [
      { name: 'white_fair', label: 'White Fair', prompt: 'High-quality studio photography of cheeks to chest of a beautiful female model, wearing a plain crew neck top, no necklace, no jewelry, plain solid light gray background, skin tone: white fair' },
      { name: 'medium', label: 'Medium (white to olive)', prompt: 'High-quality studio photography of cheeks to chest of a beautiful female model, wearing a plain crew neck top, no necklace, no jewelry, plain solid light gray background, skin tone: medium white to olive' },
      { name: 'olive', label: 'Olive Moderate Brown', prompt: 'High-quality studio photography of cheeks to chest of a beautiful female model, wearing a plain crew neck top, no necklace, no jewelry, plain solid light gray background, skin tone: olive moderate brown' },
      { name: 'brown', label: 'Brown Dark Brown', prompt: 'High-quality studio photography of cheeks to chest of a beautiful female model, wearing a plain crew neck top, no necklace, no jewelry, plain solid light gray background, skin tone: brown dark brown' },
      { name: 'black', label: 'Black Very Dark', prompt: 'High-quality studio photography of cheeks to chest of a beautiful female model, wearing a plain crew neck top, no necklace, no jewelry, plain solid light gray background, skin tone: black very dark' }
    ]
  },
  ring_bangle: {
    folder: 'ring_bangle',
    items: [
      { name: 'white_fair', label: 'White Fair', prompt: 'High-quality clean studio photography showing both the front and back part of a female hand in one photo, fingers till wrist, no jewelry, plain solid light gray background, skin tone: white fair' },
      { name: 'medium', label: 'Medium (white to olive)', prompt: 'High-quality clean studio photography showing both the front and back part of a female hand in one photo, fingers till wrist, no jewelry, plain solid light gray background, skin tone: medium white to olive' },
      { name: 'olive', label: 'Olive Moderate Brown', prompt: 'High-quality clean studio photography showing both the front and back part of a female hand in one photo, fingers till wrist, no jewelry, plain solid light gray background, skin tone: olive moderate brown' },
      { name: 'brown', label: 'Brown Dark Brown', prompt: 'High-quality clean studio photography showing both the front and back part of a female hand in one photo, fingers till wrist, no jewelry, plain solid light gray background, skin tone: brown dark brown' },
      { name: 'black', label: 'Black Very Dark', prompt: 'High-quality clean studio photography showing showing both the front and back part of a female hand in one photo, fingers till wrist, no jewelry, plain solid light gray background, skin tone: black very dark' }
    ]
  },
  article: {
    folder: 'article',
    items: [
      { name: 'mountains', label: 'Mountains Scenery', prompt: 'Cinematic photography of majestic snow-capped mountains background scenery, soft daylight, shallow depth of field, product display background' },
      { name: 'temple', label: 'Temple Interior', prompt: 'Cinematic photography of an ancient temple stone interior background scenery, warm soft lighting, shallow depth of field, product display background' },
      { name: 'tabletop', label: 'Luxury Tabletop', prompt: 'Minimalist luxury marble tabletop background scenery, warm soft background, shallow depth of field, product display background' },
      { name: 'garden', label: 'Garden Deck', prompt: 'Wooden deck in a beautiful green garden background scenery, sunlight, shallow depth of field, product display background' },
      { name: 'beach', label: 'Sandy Beach', prompt: 'Sandy beach with soft ocean waves background scenery, sunny day, shallow depth of field, product display background' }
    ]
  }
};

// ─────────────────────────────────────────────────────────────
// TEMPLATE PRE-GENERATION HELPER
// Checks if templates exist, generates them asynchronously if not
// ─────────────────────────────────────────────────────────────
export const ensureTemplatesExist = async () => {
  const baseDir = path.resolve("uploads/jewellery_template");
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  for (const cat of Object.keys(TEMPLATE_CONFIGS)) {
    const config = TEMPLATE_CONFIGS[cat];
    const catDir = path.join(baseDir, config.folder);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }

    for (const item of config.items) {
      const filePath = path.join(catDir, `${item.name}.png`);
      if (!fs.existsSync(filePath)) {
        console.log(`[Jewellery] Template missing: ${config.folder}/${item.name}. Generating...`);
        try {
          await generateFinalImage(item.prompt, filePath);
          console.log(`[Jewellery] Generated: ${config.folder}/${item.name}`);
        } catch (err) {
          console.error(`[Jewellery] Failed to generate template ${config.folder}/${item.name}:`, err.message);
        }
      }
    }
  }
};

// ─────────────────────────────────────────────────────────────
// FEATURE EXTRACTION WITH GEMINI
// ─────────────────────────────────────────────────────────────
const extractJewelleryDescription = async (filePath, mimeType = "image/jpeg", retries = 3) => {
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString("base64");

  const body = {
    contents: [
      {
        parts: [
          {
            text: `You are an expert gemologist and jewellery product cataloguing expert.
Analyze the jewellery item shown in this image and provide a highly detailed, single-paragraph description (under 100 words) suitable for an AI image generator to replicate this exact jewellery item.
Describe:
1. Type of item: (e.g. Ring, Bangle, Pendant, etc.)
2. Metal/Material: (e.g. 18k yellow gold, antique silver, platinum, rose gold)
3. Stones/Gems: (e.g. round brilliant solitaire diamond, tiny pave-set emeralds, ruby center stones, drop pearls)
4. Style/Design: (e.g. traditional Indian ornate filigree, minimalist modern band, Victorian style, floral cluster, geometric design)
5. Construction details: (e.g. thick band, thin chain, intricate engraving, matching studs)

Rules:
- Be highly descriptive and precise.
- Only describe what is clearly visible.
- Do NOT describe the background, hands, or model. Focus 100% on the jewellery piece.
- Return ONLY the single paragraph. No introduction, no formatting, no markdown.`
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ]
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    const model = attempt === 1 ? "gemini-2.5-flash" : "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
    try {
      console.log(`[Jewellery] Gemini analysis attempt ${attempt} using ${model}...`);
      const res = await axios.post(url, body, { timeout: 30000 });
      const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!raw) throw new Error("Empty response from Gemini");
      console.log("[Jewellery] Extracted description:", raw);
      return raw;
    } catch (err) {
      const status = err?.response?.status;
      const errMsg = err?.response?.data?.error?.message || err.message;
      if (attempt < retries) {
        const delay = attempt * 3000;
        console.warn(`[Jewellery] Gemini attempt ${attempt} failed: ${errMsg}. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw new Error(`Gemini jewellery feature extraction failed: ${errMsg}`);
      }
    }
  }
};

// ─────────────────────────────────────────────────────────────
// IMAGE GENERATION HELPER
// ─────────────────────────────────────────────────────────────
export const generateFinalImage = async (prompt, outPath) => {
  let success = false;
  // First attempt: Pollinations/Flux
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`[Jewellery] Generating composite with Pollinations/Flux (Attempt ${attempt})...`);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
      const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 50000 });
      if (response.data?.byteLength > 5000) {
        fs.writeFileSync(outPath, response.data);
        console.log("[Jewellery] Pollinations generation succeeded.");
        success = true;
        break;
      }
      throw new Error("Pollinations returned empty/small image");
    } catch (err) {
      console.warn(`[Jewellery] Pollinations attempt ${attempt} failed:`, err.message);
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  if (success) return true;

  // Fallback: Imagen 4
  try {
    console.log("[Jewellery] Trying Imagen 4 fallback...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_KEY}`;
    const body = {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: "1:1", outputMimeType: "image/png" }
    };
    const res = await axios.post(url, body, { timeout: 35000 });
    const base64 = res.data?.predictions?.[0]?.bytesBase64Encoded;
    if (base64) {
      fs.writeFileSync(outPath, Buffer.from(base64, "base64"));
      console.log("[Jewellery] Imagen 4 succeeded.");
      return true;
    }
    throw new Error("Imagen 4 returned no image");
  } catch (err) {
    console.error("[Jewellery] Imagen 4 also failed:", err.message);
    throw new Error("All image generation methods failed: " + err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// ENDPOINT HANDLERS
// ─────────────────────────────────────────────────────────────

// GET /api/jewellery/templates
export const getTemplates = async (req, res) => {
  try {
    // Run pre-generation check asynchronously so we don't block
    // ensureTemplatesExist();

    const responseData = {};
    for (const key of Object.keys(TEMPLATE_CONFIGS)) {
      const config = TEMPLATE_CONFIGS[key];
      responseData[key] = config.items.map(item => {
        const localPath = `uploads/jewellery_template/${config.folder}/${item.name}.png`;
        const exists = fs.existsSync(path.resolve(localPath));
        return {
          name: item.name,
          label: item.label,
          path: exists 
            ? localPath 
            : `https://image.pollinations.ai/prompt/${encodeURIComponent(item.prompt)}?model=flux&width=1024&height=1024&seed=42&nologo=true`
        };
      });
    }

    res.json({ success: true, templates: responseData });
  } catch (error) {
    console.error("[Jewellery] Get templates error:", error);
    res.status(500).json({ success: false, error: "Failed to get templates" });
  }
};

// GET /api/jewellery/samples
export const getSamples = async (req, res) => {
  try {
    const baseDir = path.resolve("uploads/jewellery");
    const subDirs = ['ring', 'pendant', 'bangle', 'article'];
    const samples = {};

    for (const dir of subDirs) {
      const fullPath = path.join(baseDir, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath)
          .filter(file => /\.(png|jpe?g|webp)$/i.test(file))
          .map(file => ({
            name: file,
            path: `uploads/jewellery/${dir}/${file}`
          }));
        samples[dir] = files;
      } else {
        samples[dir] = [];
      }
    }

    res.json({ success: true, samples });
  } catch (error) {
    console.error("[Jewellery] Get samples error:", error);
    res.status(500).json({ success: false, error: "Failed to get jewellery samples" });
  }
};

// POST /api/jewellery/generate
export const generateJewellery = async (req, res) => {
  const tempFiles = [];

  try {
    const { subCategory, templateName, samplePath, ringSamplePath, bangleSamplePath } = req.body;

    if (!subCategory || !templateName) {
      return res.status(400).json({ success: false, error: "subCategory and templateName are required parameters" });
    }

    // Determine target files based on category and upload vs samples
    let jewelleryDesc = "";
    let ringDesc = "";
    let bangleDesc = "";

    // Helper to get image local path
    const getLocalPath = (p) => {
      if (!p) return null;
      // Clean leading slashes
      const cleanPath = p.replace(/^\//, '');
      return path.resolve(cleanPath);
    };

    if (subCategory === 'ring_bangle') {
      // Combination: needs ring and bangle
      let ringLocalPath = null;
      let bangleLocalPath = null;

      // Handle uploads
      if (req.files) {
        if (req.files.ringImage) {
          ringLocalPath = req.files.ringImage[0].path;
          tempFiles.push(ringLocalPath);
        }
        if (req.files.bangleImage) {
          bangleLocalPath = req.files.bangleImage[0].path;
          tempFiles.push(bangleLocalPath);
        }
      }

      // If not uploaded, check sample paths
      if (!ringLocalPath && ringSamplePath) {
        ringLocalPath = getLocalPath(ringSamplePath);
      }
      if (!bangleLocalPath && bangleSamplePath) {
        bangleLocalPath = getLocalPath(bangleSamplePath);
      }

      if (!ringLocalPath || !bangleLocalPath) {
        return res.status(400).json({ success: false, error: "Both ring and bangle images (upload or sample) are required for combination." });
      }

      // Extract features for both
      console.log("[Jewellery] Extracting features for Ring...");
      try {
        ringDesc = await extractJewelleryDescription(ringLocalPath);
      } catch (geminiErr) {
        console.error("[Jewellery] Gemini ring description extraction failed, using fallback:", geminiErr.message);
        ringDesc = "exquisite gold ring with fine gemstones";
      }

      console.log("[Jewellery] Extracting features for Bangle...");
      try {
        bangleDesc = await extractJewelleryDescription(bangleLocalPath);
      } catch (geminiErr) {
        console.error("[Jewellery] Gemini bangle description extraction failed, using fallback:", geminiErr.message);
        bangleDesc = "beautiful coordinating gold bangle bracelet";
      }

    } else {
      // Single Item Category
      let itemLocalPath = null;

      if (req.files && req.files.jewelleryImage) {
        itemLocalPath = req.files.jewelleryImage[0].path;
        tempFiles.push(itemLocalPath);
      } else if (samplePath) {
        itemLocalPath = getLocalPath(samplePath);
      }

      if (!itemLocalPath) {
        return res.status(400).json({ success: false, error: "Jewellery image (upload or sample) is required" });
      }

      console.log(`[Jewellery] Extracting features for single item in subcategory ${subCategory}...`);
      try {
        jewelleryDesc = await extractJewelleryDescription(itemLocalPath);
      } catch (geminiErr) {
        console.error("[Jewellery] Gemini description extraction failed, using fallback:", geminiErr.message);
        jewelleryDesc = `exquisite designer ${subCategory} piece`;
      }
    }

    // Determine target skin tone / background scenery description
    const selectedGroup = TEMPLATE_CONFIGS[subCategory];
    if (!selectedGroup) {
      return res.status(400).json({ success: false, error: "Invalid subCategory selected" });
    }

    const matchedTemplate = selectedGroup.items.find(item => item.name === templateName);
    if (!matchedTemplate) {
      return res.status(400).json({ success: false, error: `Invalid templateName '${templateName}' for subcategory '${subCategory}'` });
    }

    // Construct generation prompt
    let prompt = "";
    const skinToneLabel = matchedTemplate.label;

    if (subCategory === 'ring') {
      prompt = `A professional high-quality studio catalogue photograph of five fingers of a female hand till the wrist, skin tone: ${skinToneLabel}. The model is wearing a ${jewelleryDesc} on their ring finger. Beautiful soft light gray solid background, clean shadows, realistic skin texture, realistic hand details, premium product presentation look, highly detailed.`;
    } else if (subCategory === 'bangle') {
      prompt = `A professional high-quality studio catalogue photograph of a female hand till the elbow, skin tone: ${skinToneLabel}. The model is wearing a ${jewelleryDesc} around their wrist. Beautiful soft light gray solid background, clean shadows, realistic skin texture, realistic hand details, premium product presentation look, highly detailed.`;
    } else if (subCategory === 'pendant') {
      prompt = `A professional high-quality studio catalogue photography showing cheeks to chest of a female model, skin tone: ${skinToneLabel}, wearing a ${jewelleryDesc} on a thin elegant chain around her neck. Plain crew neck top, soft light gray solid background, clean shadows, realistic skin texture, premium product presentation look, highly detailed.`;
    } else if (subCategory === 'article') {
      prompt = `A professional high-quality commercial product photograph of a ${jewelleryDesc}, beautifully placed and displayed on a ${skinToneLabel} background scenery, cinematic lighting, soft focus background, catalog quality.`;
    } else if (subCategory === 'ring_bangle') {
      prompt = `A professional high-quality studio catalogue photography showing both the front and back part of a female hand in one photo, fingers till wrist, skin tone: ${skinToneLabel}. The model is wearing a ${ringDesc} on their fingers and a ${bangleDesc} around their wrist. Beautiful soft light gray solid background, clean shadows, realistic skin texture, realistic hand details, premium product presentation look, highly detailed.`;
    }

    console.log("[Jewellery] Composite prompt:", prompt);

    // Save final output file
    const outName = `jewellery-gen-${subCategory}-${Date.now()}.png`;
    const outDir = "uploads/jewellery/temp";
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outPath = path.resolve(outDir, outName);
    const relativePath = `uploads/jewellery/temp/${outName}`;

    let finalPath = relativePath;
    try {
      await generateFinalImage(prompt, outPath);
    } catch (genError) {
      console.warn("[Jewellery] Backend image synthesis failed. Falling back to direct Pollinations URL:", genError.message);
      // Fallback: use direct client-side Pollinations URL
      const seed = Math.floor(Math.random() * 1000000);
      finalPath = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&seed=${seed}&nologo=true`;
    }

    // Clean up temporary uploads
    for (const tempPath of tempFiles) {
      try {
        fs.unlinkSync(tempPath);
      } catch (_) {}
    }

    res.json({
      success: true,
      path: finalPath,
      prompt,
      features: subCategory === 'ring_bangle' ? { ringDescription: ringDesc, bangleDescription: bangleDesc } : { description: jewelleryDesc }
    });

  } catch (error) {
    console.error("[Jewellery] Generate error:", error);
    // Cleanup on error
    for (const tempPath of tempFiles) {
      try {
        fs.unlinkSync(tempPath);
      } catch (_) {}
    }
    res.status(500).json({ success: false, error: error.message || "Failed to generate jewellery image" });
  }
};
