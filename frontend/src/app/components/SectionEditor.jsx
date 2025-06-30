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
    <div className="border p-4 rounded mb-4 shadow-sm bg-grey-700">
      <h2 className="font-semibold text-lg mb-2 capitalize">{section}</h2>

      {
        Array.isArray(content)
          ? content.map((item, i) => (
              <textarea
                key={i}
                value={
                  typeof item === "object"
                    ? Object.entries(item)
                        .map(([key, value]) => `${value}`)
                        .join(": ")
                    : item
                }
                onChange={(e) => {
                  const updated = [...content];
                  updated[i] = e.target.value;
                  updateSection(section, updated);
                }}
                className="w-full mb-2 p-2 bg-gray-800 text-white rounded"
              />
            ))
          : typeof content === "object"
          ? (
            <textarea
              value={Object.entries(content)
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n")}
              onChange={(e) => updateSection(section, e.target.value)}
              className="w-full p-2 bg-gray-800 text-white rounded"
            />
          )
          : (
            <textarea
              value={content}
              onChange={(e) => updateSection(section, e.target.value)}
              className="w-full p-2 bg-gray-800 text-white rounded"
            />
          )
      }



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
