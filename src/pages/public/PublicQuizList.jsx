import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicQuizzes } from '../../api'

export default function PublicQuizList() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicQuizzes()
      .then((res) => setQuizzes(res.data.data ?? []))
      .catch(() => setError('Gagal memuat daftar quiz.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">Quiz Pemilihan</span>
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Login Admin →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Tersedia</h1>
          <p className="text-gray-500 mt-2">Pilih quiz di bawah ini dan lihat hasilnya langsung tanpa perlu mendaftar.</p>
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-12">Memuat quiz...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm text-center">
            {error}
          </div>
        )}

        {!loading && !error && quizzes.length === 0 && (
          <div className="text-center text-gray-400 py-12">Belum ada quiz yang tersedia.</div>
        )}

        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              to={`/quiz/${quiz.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all block"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-900">{quiz.title}</h2>
                  {quiz.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{quiz.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-gray-400">
                      {quiz.questions_count} pertanyaan
                    </span>
                    {quiz.has_grades && (
                      <span className="text-xs text-green-600 font-medium">Ada penilaian</span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">
                  Mulai
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
