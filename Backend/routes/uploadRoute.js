import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import faqUpload from '../middleware/faqUploadMiddleware.js';
import axios from 'axios';
import fs from 'fs';
import TemplateSubCategory from '../models/SubCategory.js';
import TemplateCategory from '../models/TemplateCategory.js';

const router = express.Router();

router.post('/scan-jewellery', upload.single('imageFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded!' });
        }

        const fileUrl = `/uploads/images/${req.file.filename}`;
        const localPath = req.file.path;

        const isVideoMode = req.query.mode === 'video';

        let classificationPrompt = '';
        let spaceKeys = [];
        let spaceSlugMap = {};

        if (isVideoMode) {
            classificationPrompt = `You are an elite, highly specialized jewellery classification expert.
Your job is to identify the jewellery item shown in the image and classify it into EXACTLY one of these subcategories: Rings, Pendants, Bangles, Articles.

For reference:
- "Rings" matches finger rings or thumb rings.
- "Pendants" matches necklaces, chokers, mangalsutras, neck sets, or neck pendants.
- "Bangles" matches bangles, bracelets, or kadas.
- "Articles" matches any other jewellery like nose pins, earrings, chains, anklets, hip belts, bajubandh, tika, or any miscellaneous accessories.

Return ONLY the exact single string matching the selected category from the list above: Rings, Pendants, Bangles, or Articles. Do not provide any introduction, description, markdown, bullet points, or punctuation. Make a highly confident and accurate choice based on visual evidence.`;
        } else {
            // ─── DYNAMIC: Fetch all active subcategories from DB ──────────────────
            // Find the "Jewellery" category first (or all categories if you want)
            const jewelleryCategory = await TemplateCategory.findOne({
                name: { $regex: /jewel/i },
                isActive: 0
            });

            let dbSubcategories = [];
            if (jewelleryCategory) {
                dbSubcategories = await TemplateSubCategory.find({
                    categoryId: jewelleryCategory._id,
                    isActive: 0
                }).select('name slug').lean();
            } else {
                // Fallback: fetch ALL active subcategories across all categories
                dbSubcategories = await TemplateSubCategory.find({ isActive: 0 })
                    .select('name slug').lean();
            }

            if (!dbSubcategories.length) {
                return res.status(400).json({
                    success: false,
                    message: 'No active subcategories found in the database. Please add subcategories first.'
                });
            }

            const subcategoryMap = {}; // slug (hyphenated) → { name, slug }

            for (const sub of dbSubcategories) {
                const slug = sub.slug.toLowerCase().trim();       // e.g. "nose-pin"
                const spaceSlug = slug.replace(/-/g, ' ');             // e.g. "nose pin"
                const displayName = sub.name.toUpperCase().trim();     // e.g. "NOSE PIN"

                subcategoryMap[slug] = { name: displayName, slug };
                spaceSlugMap[spaceSlug] = { name: displayName, slug };
            }

            spaceKeys = Object.keys(spaceSlugMap).sort((a, b) => b.length - a.length);

            const subcategoryList = spaceKeys.map(k => spaceSlugMap[k].name).join(', ');
            classificationPrompt = `You are an elite, highly specialized jewellery classification expert.
Your job is to identify the jewellery item shown in the image and classify it into EXACTLY one of these subcategories: ${subcategoryList}.

Return ONLY the exact single string matching the selected category from the list above. Do not provide any introduction, description, markdown, bullet points, or punctuation. Make a highly confident and accurate choice based on visual evidence.`;
        }

        // ─── API KEYS ──────────────────────────────────────────────────────────
        const openaiApiKey = process.env.OPENAI_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!openaiApiKey && !geminiApiKey) {
            return res.status(400).json({
                success: false,
                message: 'No active API Key found! Please add GEMINI_API_KEY or OPENAI_API_KEY in your .env file and restart the server.'
            });
        }

        let detectedSlug = null;
        let detectedName = null;
        let answer = null;

        // Convert image to base64
        const imageBase64 = fs.readFileSync(localPath, { encoding: 'base64' });
        const mimeType = req.file.mimetype || 'image/jpeg';

        // ─── 1. PREFER GOOGLE GEMINI — cascade through models on quota errors ──
        if (geminiApiKey) {
            // Try models in order; on 429 (quota exceeded) move to the next model.
            // Each model has its own free-tier quota bucket.
            const geminiModels = [
                'gemini-2.0-flash-lite',   // lightest, own quota bucket
                'gemini-flash-latest',      // rolling alias, often separate quota
                'gemini-2.5-flash',         // best quality, try 3rd
                'gemini-2.0-flash',         // original choice, try last
            ];

            let lastGeminiError = null;

            for (const model of geminiModels) {
                try {
                    console.log(`Trying Gemini model: ${model}...`);
                    const response = await axios.post(
                        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
                        {
                            contents: [
                                {
                                    parts: [
                                        { text: classificationPrompt },
                                        {
                                            inlineData: {
                                                mimeType: mimeType,
                                                data: imageBase64
                                            }
                                        }
                                    ]
                                }
                            ],
                            generationConfig: {
                                temperature: 0,
                                maxOutputTokens: 100
                            }
                        },
                        {
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 15000
                        }
                    );

                    answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    console.log(`Gemini [${model}] raw response:`, answer);
                    if (!answer) {
                        console.log(`Gemini [${model}] full response:`, JSON.stringify(response.data, null, 2));
                    }
                    break; // Success — stop trying further models

                } catch (modelErr) {
                    const status = modelErr.response?.status;
                    const errMsg = modelErr.response?.data?.error?.message || modelErr.message;
                    console.warn(`Gemini [${model}] failed (${status}): ${errMsg}`);
                    lastGeminiError = errMsg;

                    // Only continue cascade on quota (429) or not-found (404) errors
                    if (status !== 429 && status !== 404) {
                        throw new Error(`Gemini Vision analysis failed: ${errMsg}`);
                    }
                    // Otherwise loop to next model
                }
            }

            // All Gemini models exhausted their quota
            if (!answer && !openaiApiKey) {
                throw new Error(`All Gemini models quota exceeded. Last error: ${lastGeminiError}. Please try again later or add an OPENAI_API_KEY.`);
            }
        }
        // ─── 2. FALLBACK: OPENAI VISION ──────────────────────────────────────
        else if (openaiApiKey) {
            try {
                console.log("Using OpenAI Vision API for classification...");
                const base64Url = `data:${mimeType};base64,${imageBase64}`;
                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    { type: 'text', text: classificationPrompt },
                                    { type: 'image_url', image_url: { url: base64Url } }
                                ]
                            }
                        ],
                        max_tokens: 15,
                        temperature: 0
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${openaiApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000
                    }
                );

                answer = response.data?.choices?.[0]?.message?.content?.trim();
                console.log("OpenAI Vision raw response:", answer);

            } catch (openaiErr) {
                console.error("OpenAI Vision API call failed:", openaiErr.message);
                throw new Error(`OpenAI Vision analysis failed: ${openaiErr.response?.data?.error?.message || openaiErr.message}`);
            }
        }

        // ─── MATCHING: AI response → DB subcategory ───────────────────────────
        if (isVideoMode) {
            if (answer) {
                const cleaned = answer.toLowerCase().trim();
                if (cleaned.includes("ring")) {
                    detectedSlug = "rings";
                    detectedName = "Rings";
                } else if (cleaned.includes("pendant") || cleaned.includes("neck") || cleaned.includes("choker") || cleaned.includes("mangal")) {
                    detectedSlug = "pendants";
                    detectedName = "Pendants";
                } else if (cleaned.includes("bangle") || cleaned.includes("bracelet") || cleaned.includes("kada")) {
                    detectedSlug = "bangles";
                    detectedName = "Bangles";
                } else {
                    detectedSlug = "articles";
                    detectedName = "Articles";
                }
            }
            if (!detectedSlug) {
                detectedSlug = "articles";
                detectedName = "Articles";
            }
        } else {
            // 1. Clean: lowercase, trim, remove punctuation but KEEP spaces
            if (answer) {
                const cleaned = answer.toLowerCase().trim().replace(/[^a-z ]/g, '').trim();
                console.log("Cleaned AI answer:", cleaned);

                // Step 1: Exact match against space-slug keys (longest first → most specific wins)
                for (const key of spaceKeys) {
                    if (cleaned === key) {
                        detectedSlug = spaceSlugMap[key].slug;
                        detectedName = spaceSlugMap[key].name;
                        break;
                    }
                }

                // Step 2: Whole-word boundary match (handles "It is a BANGLE." style responses)
                if (!detectedSlug) {
                    for (const key of spaceKeys) {
                        const escapedKey = key.replace(/ /g, '\\s+');
                        const boundary = new RegExp(`(^|\\s)${escapedKey}(\\s|$)`);
                        if (boundary.test(cleaned)) {
                            detectedSlug = spaceSlugMap[key].slug;
                            detectedName = spaceSlugMap[key].name;
                            break;
                        }
                    }
                }

                // Step 3: Space-stripped exact match (last resort for single-word responses)
                if (!detectedSlug) {
                    const cleanedNoSpaces = cleaned.replace(/\s/g, '');
                    for (const key of spaceKeys) {
                        if (cleanedNoSpaces === key.replace(/\s/g, '')) {
                            detectedSlug = spaceSlugMap[key].slug;
                            detectedName = spaceSlugMap[key].name;
                            break;
                        }
                    }
                }
            }
        }

        if (!detectedSlug) {
            return res.status(400).json({
                success: false,
                message: `AI analyzed the image but returned '${answer}', which did not match any subcategory in the database.`
            });
        }

        console.log(`Detected subcategory: ${detectedName} (slug: ${detectedSlug})`);

        res.status(200).json({
            success: true,
            message: `Recognized jewelry category: ${detectedName}`,
            detectedSubcategory: {
                name: detectedName,
                slug: detectedSlug
            },
            filePath: fileUrl,
            localPath: localPath
        });

    } catch (error) {
        console.error('Scan jewellery Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during scan-jewellery'
        });
    }
});

router.post('/image', upload.single('imageFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Koi image upload nahi hui!' });
        }

        const fileUrl = `/uploads/images/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'Image successfully saved!',
            filePath: fileUrl,
            localPath: req.file.path
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});


router.post('/faq-media', faqUpload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded!' });
        }

        let folder = 'other';
        if (req.file.mimetype.startsWith('image/')) folder = 'images';
        else if (req.file.mimetype.startsWith('video/')) folder = 'videos';
        else if (req.file.mimetype === 'application/pdf') folder = 'pdfs';

        const fileUrl = `/uploads/faq/${folder}/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'File successfully saved!',
            fileUrl: fileUrl
        });

    } catch (error) {
        console.error('FAQ Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server error during FAQ upload' });
    }
});

export default router;