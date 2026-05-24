import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { getQuizzes, createQuestion } from '../../api'
import Layout from '../../components/Layout'
import Alert from '../../components/Alert'

const newOption = () => ({ option_text: '', point: 0 })

export default function QuestionCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const presetQuizId = searchParams.get('quiz_id') || ''

  const [quizzes, setQuizzes] = useState([])
  const [form, setForm] = useState({ quiz_id: presetQuizId, question_text: '', options: [newOption(), newOption()] })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getQuizzes().then((res) => setQuizzes(res.data.data ?? []))
  }, [])

  const handleOptionChange = (index, field, value) => {
    setForm((f) => {
      const options = [...f.options]
      options[index] = { ...options[index], [field]: field === 'point' ? Number(value) : value }
      return { ...f, options }
    })
  }

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, newOption()] }))

  const removeOption = (index) => {
    if (form.options.length <= 2) return
    setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createQuestion(form)
      navigate('/questions')
    } catch (err) {
      const errs = err.response?.data?.errors
      const msg = errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal membuat pertanyaan.')
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/questions" className="text-sm text-gray-500 hover:text-gray-700">← Kembali</Link>
          <h1 className="text-2xl font-bold text-gray-900">Buat Pertanyaan Baru</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Alert type="error" message={error} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiz</label>
              <select
                required
                value={form.quiz_id}
                onChange={(e) => setForm({ ...form, quiz_id: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">-- Pilih Quiz --</option>
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teks Pertanyaan</label>
              <textarea
                rows={2}
                required
                value={form.question_text}
                onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Masukkan teks pertanyaan"
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
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-5 shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      required
                      placeholder="Teks opsi"
                      value={opt.option_text}
                      onChange={(e) => handleOptionChange(idx, 'option_text', e.target.value)}
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Poin"
                      value={opt.point}
                      onChange={(e) => handleOptionChange(idx, 'point', e.target.value)}
                      className="w-20 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      disabled={form.options.length <= 2}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-30 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimal 2 opsi. "Poin" adalah nilai yang diberikan jika opsi ini dipilih.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Membuat...' : 'Buat Pertanyaan'}
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
