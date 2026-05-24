import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getQuizzes, deleteQuiz } from '../../api'
import Layout from '../../components/Layout'
import ConfirmDialog from '../../components/ConfirmDialog'
import Alert from '../../components/Alert'

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    try {
      const res = await getQuizzes()
      setQuizzes(res.data.data ?? [])
    } catch {
      setError('Gagal memuat daftar quiz.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteQuiz(target.id)
      setQuizzes((prev) => prev.filter((q) => q.id !== target.id))
      setTarget(null)
    } catch {
      setError('Gagal menghapus quiz.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Layout>
      <ConfirmDialog
        open={!!target}
        title="Hapus Quiz"
        message={`Quiz "${target?.title}" akan dihapus beserta semua pertanyaan dan opsinya.`}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
        loading={deleting}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quiz</h1>
          <Link
            to="/quizzes/create"
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buat Quiz
          </Link>
        </div>

        <Alert type="error" message={error} />

        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Belum ada quiz.{' '}
            <Link to="/quizzes/create" className="text-blue-600 hover:underline">Buat quiz pertama.</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Judul</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Deskripsi</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Pemilik</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link to={`/quizzes/${quiz.id}`} className="hover:text-blue-600">{quiz.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                      {quiz.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {quiz.author?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/quizzes/${quiz.id}`}
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                        >
                          Detail
                        </Link>
                        <Link
                          to={`/quizzes/${quiz.id}/edit`}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setTarget(quiz)}
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
