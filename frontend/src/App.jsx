import { useState } from 'react';
import ResumeEditor from './components/ResumeEditor';
import ResumeUpload from './components/ResumeUpload';

function App() {
  const [resume, setResume] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-sans text-gray-100">
      <div className="max-w-3xl mx-auto bg-gray-800 shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6 text-center">AI Resume Editor</h1>

        <ResumeUpload setResume={setResume} />

        {resume && <ResumeEditor resume={resume} setResume={setResume} />}
      </div>
    </div>
  );
}

export default App;
