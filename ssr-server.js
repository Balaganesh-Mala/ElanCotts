import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const app = express();
const PORT = 5001;

const __dirname = path.resolve();

// Read built HTML
const indexHtml = fs.readFileSync(
  path.join(__dirname, "frontend/dist/index.html"),
  "utf-8"
);

// Serve static assets
app.use(express.static(path.join(__dirname, "frontend/dist")));

/* ================= PRODUCT SSR ================= */
app.get("/product/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const apiRes = await fetch(
      `http://localhost:4000/api/products/${slug}` // backend
    );
    const data = await apiRes.json();
    const product = data.product;

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const image =
      product.variants?.[0]?.images?.[0]?.url || "";

    const html = indexHtml
      .replace(
        "<title>frontend</title>",
        `<title>${product.name} | Elan Cotts</title>`
      )
      .replace(
        "</head>",
        `
<meta name="description" content="${product.shortDescription || ""}" />
<meta property="og:title" content="${product.name}" />
<meta property="og:description" content="${product.shortDescription || ""}" />
<meta property="og:image" content="${image}" />
<meta property="og:type" content="product" />
<meta property="og:url" content="https://elancotts.com/product/${slug}" />
</head>
`
      );

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("SSR error");
  }
});

/* ================= FALLBACK ================= */
app.get("*", (req, res) => {
  res.send(indexHtml);
});

app.listen(PORT, () => {
  console.log(`✅ SSR Server running on port ${PORT}`);
});
