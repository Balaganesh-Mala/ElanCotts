import { useEffect } from "react";

const SEO = ({ title, description, keywords, image }) => {
  useEffect(() => {
    if (title) document.title = title;

    const setMeta = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const setProperty = (property, content) => {
      let tag = document.querySelector(
        `meta[property="${property}"]`
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    if (description) setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);

    // OpenGraph
    if (title) setProperty("og:title", title);
    if (description) setProperty("og:description", description);
    if (image) setProperty("og:image", image);
    setProperty("og:type", "product");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    if (title) setMeta("twitter:title", title);
    if (description)
      setMeta("twitter:description", description);
  }, [title, description, keywords, image]);

  return null;
};

export default SEO;
