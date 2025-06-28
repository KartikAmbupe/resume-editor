"use client";

export default function SectionEditor({ section, content, updateSection, enhanceSection }) {
  const isSimple = ["name", "contact", "education", "social"].some(s =>
    section.toLowerCase().includes(s)
  );

  const handleEnhance = async () => {
    const res = await fetch("http://localhost:3001/ai-enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, content }),
    });
    const data = await res.json();
    updateSection(section, data.improved || content);
  };

  return (
    <div className="border p-4 rounded mb-4 shadow-sm bg-white">
      <h2 className="font-semibold text-lg mb-2 capitalize">{section}</h2>

      {Array.isArray(content) ? (
        content.map((item, i) => (
          <textarea
            key={i}
            className="w-full border p-2 mb-2"
            value={item}
            onChange={(e) => {
              const updated = [...content];
              updated[i] = e.target.value;
              updateSection(section, updated);
            }}
          />
        ))
      ) : typeof content === "object" ? (
        Object.entries(content).map(([label, link], i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={label}
              className="w-1/2 border p-2"
              onChange={(e) => {
                const updated = { ...content };
                const value = updated[label];
                delete updated[label];
                updated[e.target.value] = value;
                updateSection(section, updated);
              }}
            />
            <input
              value={link}
              className="w-1/2 border p-2"
              onChange={(e) => {
                const updated = { ...content };
                updated[label] = e.target.value;
                updateSection(section, updated);
              }}
            />
          </div>
        ))
      ) : (
        <textarea
          className="w-full border p-2"
          rows={4}
          value={content}
          onChange={(e) => updateSection(section, e.target.value)}
        />
      )}

      {!isSimple && (
        <button
          className="bg-purple-600 text-white px-4 py-1 mt-2 rounded hover:bg-purple-700"
          onClick={handleEnhance}
        >
          Enhance with AI
        </button>
      )}
    </div>
  );
}
