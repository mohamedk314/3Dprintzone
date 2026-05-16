import React from "react";

/**
 * RAYK-styled plain-text renderer for legal page bodies.
 *
 * Splits the body on blank lines into paragraphs. Each paragraph's first line
 * is treated as a heading if the paragraph has more than one line. No HTML is
 * rendered so untrusted content cannot execute scripts.
 *
 * Visual identity: black-on-cream RAYK type, uppercase eyebrow + serif-like
 * tracked headings, generous line height. No 3dprintzone styles are reused.
 */
export default function RaykLegalArticle({
  title,
  body,
  lastUpdated,
}: {
  title: string;
  body: string;
  lastUpdated?: string;
}) {
  const blocks = body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <article
      className="border border-black/10 bg-white"
      style={{ padding: "32px 24px" }}
    >
      <header className="mb-8 pb-6 border-b border-black/10">
        <p
          className="uppercase mb-3"
          style={{
            color: "#77736D",
            fontSize: "10px",
            letterSpacing: "0.32em",
            fontWeight: 600,
          }}
        >
          RAYK
        </p>
        <h1
          className="font-bold tracking-tight"
          style={{
            color: "#151515",
            fontSize: "clamp(22px, 2.4vw, 30px)",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {lastUpdated && (
          <p
            className="mt-3 uppercase"
            style={{ color: "#A6A29A", fontSize: "10px", letterSpacing: "0.28em" }}
          >
            Last updated: {lastUpdated}
          </p>
        )}
      </header>

      <div className="space-y-6">
        {blocks.length === 0 ? (
          <p className="text-sm" style={{ color: "#77736D" }}>
            This page will be updated soon.
          </p>
        ) : (
          blocks.map((block, i) => {
            const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
            if (lines.length > 1) {
              const [head, ...rest] = lines;
              return (
                <section key={i} className="space-y-2.5">
                  <h2
                    className="uppercase"
                    style={{
                      color: "#151515",
                      fontSize: "12px",
                      letterSpacing: "0.24em",
                      fontWeight: 700,
                    }}
                  >
                    {head}
                  </h2>
                  {rest.map((line, j) => (
                    <p
                      key={j}
                      className="leading-relaxed"
                      style={{ color: "#3a3833", fontSize: "14px", lineHeight: 1.7 }}
                    >
                      {line}
                    </p>
                  ))}
                </section>
              );
            }
            return (
              <p
                key={i}
                className="leading-relaxed"
                style={{ color: "#3a3833", fontSize: "14px", lineHeight: 1.7 }}
              >
                {block}
              </p>
            );
          })
        )}
      </div>
    </article>
  );
}
