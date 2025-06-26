import { useState } from 'react';

function ResumeUpload({ setResume }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a .docx or .pdf file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/upload-resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResume(data); // Fill parsed resume into editor
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 bg-gray-800 p-6 rounded-lg shadow-md">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Upload Resume (.pdf or .docx)
      </label>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="mb-4 text-white"
      />
      <button
        onClick={handleUpload}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Parsing..." : "Upload & Parse"}
      </button>
      {error && <p className="text-red-400 mt-2">{error}</p>}
    </div>
  );
}

export default ResumeUpload;
