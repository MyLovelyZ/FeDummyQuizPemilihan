import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicQuiz, submitPublicQuiz } from '../../api'

function ResultCard({ score, gradeLabel, minPoint, maxPoint, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Quiz Selesai!</h2>
        <p className="text-sm text-gray-500 mb-6">Berikut adalah hasil jawaban Anda.</p>

        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <p className="text-sm text-gray-500 mb-1">Total Poin</p>
          <p className="text-5xl font-bold text-blue-600">{score}</p>

          {gradeLabel ? (
            <div className="mt-4">
              <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full">
                {gradeLabel}
              </span>
              {minPoint != null && maxPoint != null && (
                <p className="text-xs text-gray-400 mt-2">
                  Rentang: {minPoint} – {maxPoint} poin
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-3">
              Tidak ada penilaian yang cocok untuk skor ini.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-5 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Coba Lagi
          </button>
          <Link
            to="/quiz"
            className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Quiz Lain
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PublicQuizTake() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // answers: { [questionId]: optionId }
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState(null)

  const loadQuiz = () => {
    setLoading(true)
    setError('')
    setResult(null)
    setAnswers({})
    getPublicQuiz(id)
      .then((res) => setQuiz(res.data.data))
      .catch(() => setError('Quiz tidak ditemukan atau server tidak tersedia.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadQuiz() }, [id])

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = quiz?.questions?.length ?? 0
  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allAnswered) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const optionIds = Object.values(answers)
      const res = await submitPublicQuiz(id, optionIds)
      setResult(res.data.data)
    } catch {
      setSubmitError('Gagal mengirim jawaban. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <ResultCard
        score={result.score}
        gradeLabel={result.grade_label}
        minPoint={result.min_point}
        maxPoint={result.max_point}
        onRetry={loadQuiz}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-400">Memuat quiz...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-sm w-full">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Link to="/quiz" className="text-sm text-blue-600 hover:underline">← Kembali ke daftar quiz</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/quiz" className="text-sm text-gray-500 hover:text-gray-700">← Kembali</Link>
          <span className="text-sm font-medium text-gray-600">
            {answeredCount}/{totalQuestions} terjawab
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-blue-500 transition-all duration-300"
            style={{ width: totalQuestions ? `${(answeredCount / totalQuestions) * 100}%` : '0%' }}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
          )}
        </div>

        {quiz.questions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            Quiz ini belum memiliki pertanyaan.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {quiz.questions.map((question, qIdx) => (
              <div key={question.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-500 mb-2">Soal {qIdx + 1}</p>
                <p className="text-base font-medium text-gray-900 mb-4">{question.question_text}</p>

                <div className="space-y-2">
                  {question.options.map((opt) => {
                    const selected = answers[question.id] === opt.id
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                          ${selected
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={opt.id}
                          checked={selected}
                          onChange={() => handleSelect(question.id, opt.id)}
                          className="accent-blue-600 h-4 w-4 shrink-0"
                        />
                        <span className="text-sm text-gray-800">{opt.option_text}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {submitError}
              </div>
            )}

            <div className="sticky bottom-4">
              <button
                type="submit"
                disabled={!allAnswered || submitting}
                className="w-full py-3 px-6 bg-blue-600 text-white text-sm font-semibold rounded-xl
                  hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                {submitting
                  ? 'Mengirim...'
                  : !allAnswered
                    ? `Jawab semua soal (${answeredCount}/${totalQuestions})`
                    : 'Lihat Hasil'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
