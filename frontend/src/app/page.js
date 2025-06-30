"use client";

import { useState } from "react";
import ResumeUpload from "./components/ResumeUpload";
import SectionEditor from "./components/SectionEditor";
import html2pdf from "html2pdf.js";

export default function Home() {
  const [resumeData, setResumeData] = useState(null);

  const updateSection = (section, updatedValue) => {
    setResumeData({ ...resumeData, [section]: updatedValue });
  };

  const handleEnhance = async (section) => {
    const res = await fetch("http://localhost:3001/ai-enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section,
        content: resumeData[section],
      }),
    });

    const data = await res.json();
    if (data.improved) {
      updateSection(section, data.improved);
    }
  };

  const handleDownload = () => {
    const element = document.getElementById("resume-editor");
    html2pdf()
      .from(element)
      .set({
        filename: "Modified_Resume.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { format: "a4" },
      })
      .save();
  };

  return (
    <main className="min-h-screen p-6 bg-gray-900 font-sans text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-500 mb-4">Resume Editor</h1>
        <ResumeUpload onParsed={setResumeData} />

        {resumeData && (
          <>
            <div id="resume-editor" className="space-y-6">
              {Object.entries(resumeData).map(([section, content]) => (
                <SectionEditor
                  key={section}
                  section={section}
                  content={content}
                  updateSection={updateSection}
                  handleEnhance={handleEnhance}
                />
              ))}
            </div>

            <button
              onClick={handleDownload}
              className="mt-6 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download as PDF
            </button>
          </>
        )}
      </div>
    </main>
  );
}
