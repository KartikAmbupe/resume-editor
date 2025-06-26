import SectionEditor from "./SectionEditor";

function ResumeEditor({ resume, setResume }) {
  const handleEnhance = async (section, content) => {
    const res = await fetch("http://localhost:3001/ai-enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, content }),
    });
    const data = await res.json();
    setResume({ ...resume, [section]: data.improved });
  };

  const handleChange = (section, value) => {
    setResume({ ...resume, [section]: value });
  };

  const handleSave = async () => {
    await fetch("http://localhost:3001/save-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resume),
    });
    alert("Resume saved!");
  };

  const downloadResume = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.json";
    a.click();
  };

  return (
    <div className="space-y-8">
      {Object.entries(resume).map(([section, content]) => (
        <SectionEditor
          key={section}
          section={section}
          content={content}
          onChange={handleChange}
          onEnhance={handleEnhance}
        />
      ))}
      <div className="flex gap-4 justify-center pt-4">
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          onClick={handleSave}
        >
          Save to Backend
        </button>
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          onClick={downloadResume}
        >
          Download JSON
        </button>
      </div>
    </div>
  );
}

export default ResumeEditor;
