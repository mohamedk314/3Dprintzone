import React from "react";

/**
 * Renders a legal page body as plain text safely.
 *
 * Splits the body on blank lines into paragraphs. Each paragraph's first line
 * is treated as a heading if the paragraph has more than one line — a simple
 * convention that matches how the defaults are written. No HTML is rendered,
 * so untrusted content cannot execute scripts.
 */
export default function LegalArticle({
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
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10">
      <header className="mb-7 pb-6 border-b border-gray-100">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-2">Last updated: {lastUpdated}</p>
        )}
      </header>

      <div className="space-y-5">
        {blocks.length === 0 ? (
          <p className="text-sm text-gray-500">This page will be updated soon.</p>
        ) : (
          blocks.map((block, i) => {
            const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
            if (lines.length > 1) {
              const [head, ...rest] = lines;
              return (
                <section key={i} className="space-y-2">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">{head}</h2>
                  {rest.map((line, j) => (
                    <p key={j} className="text-sm text-gray-600 leading-relaxed">{line}</p>
                  ))}
                </section>
              );
            }
            return (
              <p key={i} className="text-sm text-gray-600 leading-relaxed">{block}</p>
            );
          })
        )}
      </div>
    </article>
  );
}
