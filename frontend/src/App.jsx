import { useState } from "react"
import { Upload, FileCode, Loader, AlertTriangle, CheckCircle } from "lucide-react"
import axios from "axios"

export default function App() {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(dropped)
  }

  const analyseFiles = async () => {
    setLoading(true)
    setResults([])
    const analyses = []

    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await axios.post(
          "http://localhost:8000/analyse",
          formData
        )
        analyses.push(response.data)
      } catch (error) {
        analyses.push({
          filename: file.name,
          analysis: "Could not analyse this file. Please try again."
        })
      }
    }

    setResults(analyses)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-8">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <FileCode size={36} className="text-blue-400" />
          <h1 className="text-4xl font-bold">Codebase Intel</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Upload your code and understand it instantly
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
          ${dragging
            ? "border-blue-400 bg-blue-950"
            : "border-gray-700 bg-gray-900 hover:border-gray-500"
          }`}
      >
        <Upload size={48} className="text-gray-500 mb-4" />
        <p className="text-xl font-medium text-gray-300 mb-2">
          Drag and drop your code files here
        </p>
        <p className="text-gray-500 text-sm">
          Supports .py .js .ts .jsx .tsx .cpp .java and more
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-8 w-full max-w-2xl bg-gray-900 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-4">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
          <div className="flex flex-col gap-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                <FileCode size={16} className="text-blue-400" />
                <span className="text-sm text-gray-300">{file.name}</span>
                <span className="ml-auto text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={analyseFiles}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Analysing...
              </>
            ) : (
              "Analyse Codebase"
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8 w-full max-w-2xl flex flex-col gap-6">
          {results.map((result, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={20} className="text-green-400" />
                <h2 className="text-lg font-semibold">{result.filename}</h2>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {result.analysis}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
