import { useEffect, useState } from "react";
import { FAQ_CONTENT } from "../../data/faqData";

const FAQSingleDropdown = () => {
  const [open, setOpen] = useState(false);

  /* ================= AUTO OPEN FIRST VISIT ================= */
  useEffect(() => {
    const seen = localStorage.getItem("faq_opened");
    if (!seen) {
      setOpen(true);
      localStorage.setItem("faq_opened", "true");
    }
  }, []);

  /* ================= SEO FAQ SCHEMA ================= */
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_CONTENT.sections.flatMap(section =>
        section.paragraphs.map(p => ({
          "@type": "Question",
          name: p.title,
          acceptedAnswer: {
            "@type": "Answer",
            text: p.text,
          },
        }))
      ),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-4 py-14 font-serif">
      <div className="border border-[#e7dcdc] rounded-md">
        {/* HEADER */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center px-6 py-5"
        >
          <h2 className="text-xs tracking-widest uppercase text-[#6b6b6b]">
            {FAQ_CONTENT.title}
          </h2>

          <span className="text-xl text-[#6b6b6b] font-light">
            {open ? "–" : "+"}
          </span>
        </button>

        {/* CONTENT */}
        <div
          className={`overflow-hidden transition-all duration-500 ${
            open ? "max-h-[3000px]" : "max-h-0"
          }`}
        >
          <div className="px-6 pb-6 space-y-10 text-sm text-[#8f8f8f] leading-relaxed">
            {FAQ_CONTENT.sections.map((section, i) => (
              <div key={i}>
                {/* SECTION HEADING */}
                <p className="font-semibold text-[#5f5f5f] mb-3">
                  {section.heading}
                </p>

                {/* PARAGRAPHS */}
                <div className="space-y-4">
                  {section.paragraphs.map((p, j) => (
                    <p key={j}>
                      <span className="font-semibold text-[#5f5f5f]">
                        {p.title}
                      </span>{" "}
                      {p.text}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSingleDropdown;
