import { useState } from 'react';
import ResumeEditor from './components/ResumeEditor';

const dummyResume = {
  name: "John Doe",
  summary: "Experienced software engineer with a focus on backend development.",
  experience: ["Software Engineer at Google", "Intern at Amazon"],
  education: ["B.Tech in Computer Science"],
  skills: ["Python", "React", "Docker"]
};

function App() {
  const [resume, setResume] = useState(dummyResume);

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Resume Editor</h1>
        <ResumeEditor resume={resume} setResume={setResume} />
      </div>
    </div>
  );
}

export default App;
