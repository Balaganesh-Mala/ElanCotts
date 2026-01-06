import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5050; // ⚠️ NOT 5000 (your backend uses 5000)

// Serve static React files
app.use(
  express.static(path.join(__dirname, "frontend/dist"), {
    index: false
  })
);

// 🔥 SSR ONLY FOR PRODUCT PAGE
app.get("/product/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    console.log("🔥 SSR slug:", slug);

    const apiRes = await fetch(
  `https://elancotts-backend.onrender.com/api/products/${slug}`
);


    console.log("🔥 API status:", apiRes.status);

    if (!apiRes.ok) {
      throw new Error("API returned non-200");
    }

    // ✅ READ JSON ONCE
    const data = await apiRes.json();
    const product = data.product;

    console.log("🔥 PRODUCT NAME:", product.name);

    let html = fs.readFileSync(
      path.join(__dirname, "frontend/dist/index.html"),
      "utf-8"
    );

    html = html.replace(
      "<title>frontend</title>",
      `
<title>${product.name} | Elan Cotts</title>
<meta name="description" content="${product.shortDescription}" />

<meta property="og:title" content="${product.name}" />
<meta property="og:description" content="${product.shortDescription}" />
<meta property="og:image" content="${product.variants[0].images[0].url}" />
<meta property="og:type" content="product" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${product.name}" />
<meta name="twitter:description" content="${product.shortDescription}" />
<meta name="twitter:image" content="${product.variants[0].images[0].url}" />
`
    );

    res.send(html);
  } catch (err) {
    console.error("❌ SSR ERROR:", err.message);
    res.status(404).send("Product not found");
  }
});


// 🔁 ALL OTHER ROUTES → NORMAL REACT
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "frontend/dist/index.html")
  );
});

app.listen(PORT, () => {
  console.log(`🔥 SSR server running at http://localhost:${PORT}`);
});
