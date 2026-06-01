import express from "express";
import Blog from "../models/Blog.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper middleware: Restrict writes strictly to ADMIN or SUPER ADMIN
const isBlogManager = (req, res, next) => {
  if (req.user && (req.user.role === "ADMIN" || req.user.role === "SUPER ADMIN")) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Access denied. Admins only." });
};

// Seeding dataset
const INITIAL_BLOGS = [
  {
    title: "The Future of AI in Jewelry Photography",
    excerpt: "Discover how generative AI models capture macro gold reflections, diamond facets, and gemstone details without a physical camera or expensive lighting gear.",
    content: `
      <p>Jewelry photography has always been one of the most challenging areas of commercial staging. The metallic reflections, high reflectivity of gold and silver, and the precise refractivity of gemstones require expert lighting, macro lenses, and hours of post-production cleaning. Today, Generative AI is turning this workflow on its head.</p>
      
      <h4>Understanding Light and Reflections in AI</h4>
      <p>Traditional photography uses complex softboxes, diffusers, and reflector cards to avoid harsh highlights on polished gold bands. Modern AI diffusion models, trained specifically on high-quality jewelry photography, simulate these exact lighting setups mathematically. By defining prompt parameters, the model stages the gold weight and diamond sparkles with realistic depth-of-field, capturing precise light paths and gemstone facets.</p>
      
      <blockquote>
        "The physics of gemstone refraction is incredibly complex, but generative neural networks can replicate how light bends through a diamond's table facet with stunning accuracy."
      </blockquote>
      
      <h4>The Cost Efficiency of Virtual Studios</h4>
      <p>Typically, a luxury jewelry catalog shoot costs thousands of dollars per day in equipment rentals, models, and photographers. By switching to virtual staging pipelines, brands can create hundreds of product variations, from studio backdrops to realistic hand-model mockups, in a fraction of the time and cost.</p>
      
      <h4>Future Outlook</h4>
      <p>As the rendering resolution increases, the line between physical and synthetic jewelry imagery is blurring. Brands using AI staging are releasing entire new collections onto digital storefronts before manufacturing even a single catalog unit.</p>
    `,
    category: "Jewelry Studio",
    readTime: "5 min read",
    date: "May 28, 2026",
    author: "Elena Rostova",
    authorRole: "Lead Jewelry Designer",
    image: "/image/ekodex_jewelry.png",
    authorAvatar: "/image/clay_avatar.png",
    featured: true
  },
  {
    title: "AI Fashion Models: The Lookbook Revolution",
    excerpt: "How apparel brands use hyperrealistic digital models to showcase collection lookbooks in record time and save studio scheduling costs.",
    content: `
      <p>For fashion brands, launching a new season means staging extensive lookbook shoots, hiring model agencies, and booking professional studios. The emergence of specialized AI model placement algorithms is creating a new design ecosystem where apparel sketches or simple clay renders can be synthesized into fully staged collections instantly.</p>
      
      <h4>From Flat Lays to Realistic Model Assets</h4>
      <p>The traditional method of staging flat lay garments on white backgrounds is functional but lacks emotional appeal. Generative models allow designers to upload a raw garment photo and overlay it onto virtual models of diverse ethnicities, poses, and backgrounds. The results are highly realistic fashion catalog assets that feel natural, catching the right drapery folds and textures of the fabric.</p>
      
      <h4>Scaling Custom Campaigns</h4>
      <p>With virtual models, clothing labels can launch personalized marketing campaigns targeting specific demographics within hours. The ability to swap backgrounds from a sleek industrial warehouse to a sunny beach without changing locations saves weeks of production time.</p>
      
      <blockquote>
        "Virtual models give clothing lines the agility to deploy targeted local campaigns worldwide, reflecting local cultures and seasonal elements on demand."
      </blockquote>
      
      <h4>Workflow Acceleration</h4>
      <p>By bypassing casting calls and sample shipping, modern labels are cutting lookbook turnaround times from six weeks to under one day, allowing rapid testing of new product designs.</p>
    `,
    category: "Fashion Trends",
    readTime: "6 min read",
    date: "May 25, 2026",
    author: "Marcus Vance",
    authorRole: "Fashion Creative Director",
    image: "/image/ekodex_model.png",
    authorAvatar: "/image/clay_avatar.png",
    featured: false
  },
  {
    title: "Staging Perfect Backdrops: Shadow and Reflection Mapping",
    excerpt: "A technical dive into how EKODEX matches ground reflections, ambient occlusions, and soft shadows to synthesize realistic studio assets.",
    content: `
      <p>Staging a product in a digital space requires more than just placing the item on a pretty backdrop. The human brain is highly sensitive to inconsistent lighting, floating objects, and missing shadows. To create believable e-commerce assets, specialized ambient mapping is required.</p>
      
      <h4>The Power of Ambient Occlusion</h4>
      <p>Ambient occlusion describes the soft, dark shadows that occur when objects get very close to one another or a surface. Without these contact shadows, products look like they are floating. AI staging models use advanced depth maps to ensure that where the base of a necklace or shoe touches the stone slab, a realistic contact shadow is blended naturally.</p>
      
      <h4>Reflective Ground Staging</h4>
      <p>High-end cosmetic and jewelry brands love glossy black or marble tables that mirror the product. Replicating this reflection in AI requires calculating the Fresnel effect—how reflectivity increases at grazing angles. EKODEX's custom pipeline ensures that ground reflections maintain the right level of blur and color saturation relative to the product.</p>
      
      <h4>Consistency Across Angles</h4>
      <p>To support multi-angle catalog listings, the background staging shadows must dynamically adapt to camera position. By mathematically positioning a single virtual sun, our algorithm ensures every view displays consistent directional shadowing.</p>
    `,
    category: "AI Staging",
    readTime: "4 min read",
    date: "May 22, 2026",
    author: "Dr. Kenji Tanaka",
    authorRole: "AI Research Engineer",
    image: "/image/ekodex_jewelry.png",
    authorAvatar: "/image/clay_avatar.png",
    featured: false
  },
  {
    title: "Maximizing E-commerce Conversions with Dynamic Visuals",
    excerpt: "Analyze how high-fidelity AI-generated catalog visuals affect user engagement, click-through rates, and overall online sales conversions.",
    content: `
      <p>In e-commerce, the product image is the single most important factor in a buyer's decision. Over 80% of online shoppers state that product photos are highly influential when purchasing. Changing how you present your products can directly lift your bottom line.</p>
      
      <h4>Staging Lifestyle vs. Studio Visuals</h4>
      <p>While clean white background images are required for marketplaces like Amazon, lifestyle staging (showing the item in use or in a beautiful setting) drives high click-through rates on social platforms and category headers. AI generation makes it trivial to take a single product image and export both styles instantly.</p>
      
      <h4>Reducing Return Rates with Accuracy</h4>
      <p>One risk of generative assets is over-embellishing details, leading to customer disappointment. The key to high conversions and low returns is using constrained generation pipelines, ensuring that the core physical product stays 100% accurate, while only the background, staging elements, and lighting are synthesized.</p>
      
      <blockquote>
        "Adding contextual, premium staging backgrounds around existing flat lays increases buyer confidence and time-on-page metrics by over 45%."
      </blockquote>
      
      <h4>Automated A/B Testing</h4>
      <p>By generating multiple background presets, e-commerce stores can automatically run staging split tests to identify if marble pedestals or rustic wood settings convert better for specific customer segments.</p>
    `,
    category: "E-commerce",
    readTime: "5 min read",
    date: "May 18, 2026",
    author: "Sarah Jenkins",
    authorRole: "E-commerce Growth Specialist",
    image: "/image/ekodex_model.png",
    authorAvatar: "/image/clay_avatar.png",
    featured: false
  },
  {
    title: "Sourcing Creative Content: The Shift in Agency Workflows",
    excerpt: "Traditional creative agencies are integrating generative tools into their core design loops to brainstorm and draft templates at lightning speed.",
    content: `
      <p>Design agencies have historically separated the ideation phase from the final production shoot. However, the boundaries between drafting and final output are blurring as generative tools allow designers to pitch fully realized mockups in minutes instead of sketch boards.</p>
      
      <h4>Rapid Staging Prototypes</h4>
      <p>When pitching a concept to a jewelry brand, agencies can create 10 different staging environments (e.g., rustic wood, luxury marble, geometric concrete pedestals) using AI texturing in real-time. Clients can make adjustments during the meeting, aligning expectations before any final shoots or major resources are committed.</p>
      
      <h4>Co-creation and Ideation Loops</h4>
      <p>Rather than replacing artists, generative systems act as an infinite source of creative layouts. Graphic designers use these platforms to discover unique color schemes, light angles, and compositing styles that they can then refine and paint over, elevating the final human-crafted output.</p>
      
      <h4>Operational Speedups</h4>
      <p>By shortening the time needed to draft visuals, agencies are handling double the campaign requests without increasing designer burnout, shifting focus back to high-level brand storytelling.</p>
    `,
    category: "AI Staging",
    readTime: "7 min read",
    date: "May 15, 2026",
    author: "Liam O'Connor",
    authorRole: "Creative Agency Director",
    image: "/image/ekodex_model.png",
    authorAvatar: "/image/clay_avatar.png",
    featured: false
  }
];

// 1. GET ALL BLOGS (with auto-seeding if empty)
router.get("/", async (req, res) => {
  try {
    let blogs = await Blog.find().sort({ createdAt: -1 });

    if (blogs.length === 0) {
      console.log("No blogs found. Seeding initial dynamic blog posts...");
      await Blog.insertMany(INITIAL_BLOGS);
      blogs = await Blog.find().sort({ createdAt: -1 });
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Fetch blogs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blogs." });
  }
});

// Helper to ensure strictly one featured post
const handleFeaturedCheck = async (isFeatured, currentId = null) => {
  if (isFeatured) {
    if (currentId) {
      await Blog.updateMany({ _id: { $ne: currentId } }, { featured: false });
    } else {
      await Blog.updateMany({}, { featured: false });
    }
  }
};

// 2. CREATE BLOG
router.post("/", authMiddleware, isBlogManager, async (req, res) => {
  try {
    const { title, excerpt, content, category, readTime, date, author, authorRole, image, authorAvatar, featured } = req.body;

    if (!title || !excerpt || !content || !category || !author || !image) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const isFeatured = featured === true || featured === "true";
    await handleFeaturedCheck(isFeatured);

    const newBlog = new Blog({
      title,
      excerpt,
      content,
      category,
      readTime: readTime || "5 min read",
      date: date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      author,
      authorRole: authorRole || "Author",
      image,
      authorAvatar: authorAvatar || "/image/clay_avatar.png",
      featured: isFeatured
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({ success: true, blog: savedBlog });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ success: false, message: "Failed to create blog post." });
  }
});

// 3. UPDATE BLOG
router.put("/:id", authMiddleware, isBlogManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, category, readTime, date, author, authorRole, image, authorAvatar, featured } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found." });
    }

    const isFeatured = featured === true || featured === "true";
    await handleFeaturedCheck(isFeatured, id);

    blog.title = title || blog.title;
    blog.excerpt = excerpt || blog.excerpt;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.readTime = readTime || blog.readTime;
    blog.date = date || blog.date;
    blog.author = author || blog.author;
    blog.authorRole = authorRole || blog.authorRole;
    blog.image = image || blog.image;
    blog.authorAvatar = authorAvatar || blog.authorAvatar;
    blog.featured = isFeatured;

    const updatedBlog = await blog.save();
    res.status(200).json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ success: false, message: "Failed to update blog post." });
  }
});

// 4. DELETE BLOG
router.delete("/:id", authMiddleware, isBlogManager, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found." });
    }

    await blog.deleteOne();
    res.status(200).json({ success: true, message: "Blog post successfully deleted." });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ success: false, message: "Failed to delete blog post." });
  }
});

export default router;
