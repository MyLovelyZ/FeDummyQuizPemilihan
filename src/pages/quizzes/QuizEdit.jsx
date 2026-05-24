import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getQuiz, updateQuiz } from '../../api'
import Layout from '../../components/Layout'
import Alert from '../../components/Alert'

export default function QuizEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQuiz(id).then((res) => {
      const q = res.data.data
      setForm({ title: q.title, description: q.description ?? '' })
      setLoading(false)
    }).catch(() => {
      setError('Quiz tidak ditemukan.')
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await updateQuiz(id, form)
      navigate(`/quizzes/${id}`)
    } catch (err) {
      const errs = err.response?.data?.errors
      const msg = errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal mengupdate quiz.')
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-400">Memuat...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-xl space-y-4">
        <div className="flex items-center gap-3">
          <Link to={`/quizzes/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← Kembali</Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert type="error" message={error} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Quiz</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <Link
                to={`/quizzes/${id}`}
                className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
