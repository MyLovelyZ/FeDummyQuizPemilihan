import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getAdmin, getAdminQuizzes, toggleBanAdmin, deleteAdmin, deleteAdminQuiz } from '../../api'
import Layout from '../../components/Layout'
import Alert from '../../components/Alert'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function AdminDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [banLoading, setBanLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [quizDeleteTarget, setQuizDeleteTarget] = useState(null)
  const [quizDeleteLoading, setQuizDeleteLoading] = useState(false)

  const load = async () => {
    try {
      const [aRes, qRes] = await Promise.all([getAdmin(id), getAdminQuizzes(id)])
      setAdmin(aRes.data.data)
      setQuizzes(qRes.data.data ?? [])
    } catch {
      setError('Admin tidak ditemukan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleBan = async () => {
    setBanLoading(true)
    try {
      const res = await toggleBanAdmin(id)
      setAdmin(res.data.data)
    } catch {
      setError('Gagal mengubah status ban.')
    } finally {
      setBanLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteAdmin(id)
      navigate('/superadmin/admins')
    } catch {
      setError('Gagal menghapus admin.')
      setDeleteLoading(false)
      setConfirmDelete(false)
    }
  }

  const handleDeleteQuiz = async () => {
    setQuizDeleteLoading(true)
    try {
      await deleteAdminQuiz(quizDeleteTarget.id)
      setQuizzes((prev) => prev.filter((q) => q.id !== quizDeleteTarget.id))
      setQuizDeleteTarget(null)
    } catch {
      setError('Gagal menghapus quiz.')
    } finally {
      setQuizDeleteLoading(false)
    }
  }

  if (loading) return <Layout><div className="text-center py-12 text-gray-400">Memuat...</div></Layout>

  return (
    <Layout>
      <ConfirmDialog
        open={confirmDelete}
        title="Hapus Admin"
        message={`Akun admin "${admin?.name}" akan dihapus permanen.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleteLoading}
      />
      <ConfirmDialog
        open={!!quizDeleteTarget}
        title="Hapus Quiz Admin"
        message={`Quiz "${quizDeleteTarget?.title}" milik admin ini akan dihapus.`}
        onConfirm={handleDeleteQuiz}
        onCancel={() => setQuizDeleteTarget(null)}
        loading={quizDeleteLoading}
      />

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to="/superadmin/admins" className="text-sm text-gray-500 hover:text-gray-700">← Kembali</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{admin?.name}</h1>
            <p className="text-sm text-gray-500">{admin?.email}</p>
            <div className="mt-2">
              {admin?.banned_at ? (
                <span className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">Di-ban sejak {new Date(admin.banned_at).toLocaleDateString('id-ID')}</span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">Aktif</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleBan}
              disabled={banLoading}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg disabled:opacity-50 ${
                admin?.banned_at
                  ? 'text-green-700 bg-green-50 hover:bg-green-100'
                  : 'text-orange-600 bg-orange-50 hover:bg-orange-100'
              }`}
            >
              {banLoading ? '...' : admin?.banned_at ? 'Unban' : 'Ban'}
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
            >
              Hapus Admin
            </button>
          </div>
        </div>

        <Alert type="error" message={error} />

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Quiz Milik Admin Ini</h2>
          </div>
          {quizzes.length === 0 ? (
            <div className="px-5 py-8 text-sm text-center text-gray-400">Admin ini belum memiliki quiz.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Judul</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Pertanyaan</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quizzes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{q.title}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{q.questions_count ?? 0} soal</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setQuizDeleteTarget(q)}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}
