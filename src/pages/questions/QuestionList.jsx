import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getQuestions, deleteQuestion } from '../../api'
import Layout from '../../components/Layout'
import ConfirmDialog from '../../components/ConfirmDialog'
import Alert from '../../components/Alert'

export default function QuestionList() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    try {
      const res = await getQuestions()
      setQuestions(res.data.data ?? [])
    } catch {
      setError('Gagal memuat daftar pertanyaan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteQuestion(target.id)
      setQuestions((prev) => prev.filter((q) => q.id !== target.id))
      setTarget(null)
    } catch {
      setError('Gagal menghapus pertanyaan.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Layout>
      <ConfirmDialog
        open={!!target}
        title="Hapus Pertanyaan"
        message="Pertanyaan ini akan dihapus beserta semua opsi jawabannya."
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
        loading={deleting}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Pertanyaan</h1>
          <Link
            to="/questions/create"
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buat Pertanyaan
          </Link>
        </div>

        <Alert type="error" message={error} />

        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Belum ada pertanyaan.{' '}
            <Link to="/questions/create" className="text-blue-600 hover:underline">Buat pertanyaan pertama.</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Pertanyaan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Quiz</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 max-w-sm">
                      <p className="truncate">{q.question_text}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {q.quiz?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/questions/${q.id}/edit`}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setTarget(q)}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
