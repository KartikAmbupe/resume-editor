'use client';

import { useState } from "react";

export default function ResumeUpload({ onParsed }) {
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        const res = await fetch("http://localhost:3001/upload-resume", {
            method: "POST",
            body: formData,        
        });
        const data = await res.json();
        onParsed(data);
        setLoading(false);
    };

  return (
    <div className="my-4">
      <input
        type="file"
        accept=".pdf"
        onChange={handleUpload}
        className="mb-2"
      />
      {loading && <p className="text-sm text-gray-600">Parsing...</p>}
    </div>
  );
}