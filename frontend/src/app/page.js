"use client";

import { useState } from "react";
import ResumeUpload from "./components/ResumeUpload";
import SectionEditor from "./components/SectionEditor";

export default function Home() {
  const [resumeData, setResumeData] = useState(null);

  const updateSection = (section, updatedValue) => {
    setResumeData({ ...resumeData, [section]: updatedValue });
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">Resume Editor</h1>
        <ResumeUpload onParsed={setResumeData} />

        {resumeData &&
          Object.entries(resumeData).map(([section, content]) => (
            <SectionEditor
              key={section}
              section={section}
              content={content}
              updateSection={updateSection}
            />
          ))}
      </div>
    </main>
  );
}
