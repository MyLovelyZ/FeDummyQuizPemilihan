import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getQuestion, updateQuestion, deleteOption } from '../../api'
import Layout from '../../components/Layout'
import Alert from '../../components/Alert'

export default function QuestionEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ question_text: '', options: [] })

  useEffect(() => {
    getQuestion(id)
      .then((res) => {
        const q = res.data.data
        setForm({
          question_text: q.question_text,
          options: q.options.map((o) => ({ id: o.id, option_text: o.option_text, point: o.point, _delete: false })),
        })
      })
      .catch(() => setError('Pertanyaan tidak ditemukan.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleOptionChange = (index, field, value) => {
    setForm((f) => {
      const options = [...f.options]
      options[index] = { ...options[index], [field]: field === 'point' ? Number(value) : value }
      return { ...f, options }
    })
  }

  const addOption = () => {
    setForm((f) => ({ ...f, options: [...f.options, { option_text: '', point: 0 }] }))
  }

  const markDelete = (index) => {
    setForm((f) => {
      const options = [...f.options]
      options[index] = { ...options[index], _delete: true }
      return { ...f, options }
    })
  }

  const unmarkDelete = (index) => {
    setForm((f) => {
      const options = [...f.options]
      options[index] = { ...options[index], _delete: false }
      return { ...f, options }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Delete marked options
    const toDelete = form.options.filter((o) => o._delete && o.id)
    try {
      await Promise.all(toDelete.map((o) => deleteOption(o.id)))
    } catch {
      setError('Gagal menghapus beberapa opsi.')
      setSaving(false)
      return
    }

    const payload = {
      question_text: form.question_text,
      options: form.options
        .filter((o) => !o._delete)
        .map((o) => ({ ...(o.id ? { id: o.id } : {}), option_text: o.option_text, point: o.point })),
    }

    try {
      await updateQuestion(id, payload)
      navigate('/questions')
    } catch (err) {
      const errs = err.response?.data?.errors
      const msg = errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal mengupdate pertanyaan.')
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout><div className="text-center py-12 text-gray-400">Memuat...</div></Layout>

  const activeOptions = form.options.filter((o) => !o._delete)
  const canRemoveOption = activeOptions.length > 2

  return (
    <Layout>
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/questions" className="text-sm text-gray-500 hover:text-gray-700">← Kembali</Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Pertanyaan</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Alert type="error" message={error} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teks Pertanyaan</label>
              <textarea
                rows={2}
                required
                value={form.question_text}
                onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Opsi Jawaban</label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Tambah Opsi
                </button>
              </div>

              <div className="space-y-2">
                {form.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 ${opt._delete ? 'opacity-40' : ''}`}
                  >
                    <span className="text-sm text-gray-400 w-5 shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      required={!opt._delete}
                      placeholder="Teks opsi"
                      disabled={opt._delete}
                      value={opt.option_text}
                      onChange={(e) => handleOptionChange(idx, 'option_text', e.target.value)}
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                    />
                    <input
                      type="number"
                      required={!opt._delete}
                      min={0}
                      placeholder="Poin"
                      disabled={opt._delete}
                      value={opt.point}
                      onChange={(e) => handleOptionChange(idx, 'point', e.target.value)}
                      className="w-20 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                    />
                    {opt._delete ? (
                      <button
                        type="button"
                        onClick={() => unmarkDelete(idx)}
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                      >
                        Urungkan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (opt.id) {
                            markDelete(idx)
                          } else {
                            setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))
                          }
                        }}
                        disabled={!canRemoveOption && !opt.id}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-30 text-lg leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Opsi yang ditandai hapus akan dihapus saat menyimpan.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <Link
                to="/questions"
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
