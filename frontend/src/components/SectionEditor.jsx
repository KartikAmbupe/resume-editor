function SectionEditor({ section, content, onChange, onEnhance }) {
  const isList = Array.isArray(content);

  const handleEdit = (e, index = null) => {
    if (isList) {
      const updated = [...content];
      updated[index] = e.target.value;
      onChange(section, updated);
    } else {
      onChange(section, e.target.value);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800 capitalize mb-2">{section}</h2>

      {isList ? (
        content.map((item, idx) => (
          <input
            key={idx}
            className="block w-full border border-gray-300 rounded px-3 py-2 my-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={item}
            onChange={(e) => handleEdit(e, idx)}
          />
        ))
      ) : (
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          rows={3}
          value={content}
          onChange={handleEdit}
        />
      )}

      <button
        onClick={() => onEnhance(section, content)}
        className="mt-3 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded"
      >
        Enhance with AI
      </button>
    </div>
  );
}

export default SectionEditor;
