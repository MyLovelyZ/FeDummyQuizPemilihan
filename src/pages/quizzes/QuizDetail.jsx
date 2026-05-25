import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getQuiz, deleteQuiz,
  getQuizGrades, createQuizGrade, updateGrade, deleteGrade,
} from '../../api'
import Layout from '../../components/Layout'
import Alert from '../../components/Alert'
import ConfirmDialog from '../../components/ConfirmDialog'

function GradeRow({ grade, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900">{grade.label}</td>
      <td className="px-4 py-3 text-gray-600">{grade.min_point} – {grade.max_point}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(grade)}
            className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(grade)}
            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
          >
            Hapus
          </button>
        </div>
      </td>
    </tr>
  )
}

const emptyGrade = { label: '', min_point: '', max_point: '' }

export default function QuizDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [gradeForm, setGradeForm] = useState(emptyGrade)
  const [editingGrade, setEditingGrade] = useState(null)
  const [gradeSaving, setGradeSaving] = useState(false)
  const [gradeError, setGradeError] = useState('')

  const [confirmQuizDelete, setConfirmQuizDelete] = useState(false)
  const [quizDeleting, setQuizDeleting] = useState(false)
  const [confirmGradeDelete, setConfirmGradeDelete] = useState(null)
  const [gradeDeleting, setGradeDeleting] = useState(false)

  const loadGrades = async () => {
    const res = await getQuizGrades(id)
    setGrades(res.data.data ?? [])
  }

  useEffect(() => {
    Promise.all([getQuiz(id), getQuizGrades(id)])
      .then(([qRes, gRes]) => {
        setQuiz(qRes.data.data)
        setGrades(gRes.data.data ?? [])
      })
      .catch(() => setError('Quiz tidak ditemukan.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleGradeSubmit = async (e) => {
    e.preventDefault()
    setGradeError('')
    setGradeSaving(true)
    try {
      if (editingGrade) {
        await updateGrade(editingGrade.id, gradeForm)
      } else {
        await createQuizGrade(id, gradeForm)
      }
      await loadGrades()
      setGradeForm(emptyGrade)
      setEditingGrade(null)
    } catch (err) {
      const errs = err.response?.data?.errors
      const msg = errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal menyimpan grade.')
      setGradeError(msg)
    } finally {
      setGradeSaving(false)
    }
  }

  const startEditGrade = (grade) => {
    setEditingGrade(grade)
    setGradeForm({ label: grade.label, min_point: grade.min_point, max_point: grade.max_point })
    setGradeError('')
  }

  const handleDeleteGrade = async () => {
    setGradeDeleting(true)
    try {
      await deleteGrade(confirmGradeDelete.id)
      setGrades((prev) => prev.filter((g) => g.id !== confirmGradeDelete.id))
      setConfirmGradeDelete(null)
    } catch {
      setGradeError('Gagal menghapus grade.')
    } finally {
      setGradeDeleting(false)
    }
  }

  const handleDeleteQuiz = async () => {
    setQuizDeleting(true)
    try {
      await deleteQuiz(id)
      navigate('/quizzes')
    } catch {
      setError('Gagal menghapus quiz.')
      setQuizDeleting(false)
      setConfirmQuizDelete(false)
    }
  }

  if (loading) return <Layout><div className="text-center py-12 text-gray-400">Memuat...</div></Layout>

  return (
    <Layout>
      <ConfirmDialog
        open={confirmQuizDelete}
        title="Hapus Quiz"
        message={`Quiz "${quiz?.title}" akan dihapus beserta semua data di dalamnya.`}
        onConfirm={handleDeleteQuiz}
        onCancel={() => setConfirmQuizDelete(false)}
        loading={quizDeleting}
      />
      <ConfirmDialog
        open={!!confirmGradeDelete}
        title="Hapus Grade"
        message={`Grade "${confirmGradeDelete?.label}" akan dihapus.`}
        onConfirm={handleDeleteGrade}
        onCancel={() => setConfirmGradeDelete(null)}
        loading={gradeDeleting}
      />

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to="/quizzes" className="text-sm text-gray-500 hover:text-gray-700">← Kembali ke Quiz</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{quiz.title}</h1>
            {quiz.description && <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>}
            <p className="text-xs text-gray-400 mt-1">Pemilik: {quiz.author?.name}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to={`/quizzes/${id}/edit`}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Edit
            </Link>
            <button
              onClick={() => setConfirmQuizDelete(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
            >
              Hapus
            </button>
          </div>
        </div>

        <Alert type="error" message={error} />

        {/* Grade Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Sistem Grade</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Grade ditentukan berdasarkan total poin yang dikumpulkan pengguna.
            </p>
          </div>

          {/* Grade form */}
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <form onSubmit={handleGradeSubmit} className="space-y-3">
              <Alert type="error" message={gradeError} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Baik"
                    value={gradeForm.label}
                    onChange={(e) => setGradeForm({ ...gradeForm, label: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Min Poin</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={gradeForm.min_point}
                    onChange={(e) => setGradeForm({ ...gradeForm, min_point: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Maks Poin</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={gradeForm.max_point}
                    onChange={(e) => setGradeForm({ ...gradeForm, max_point: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={gradeSaving}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {gradeSaving ? 'Menyimpan...' : editingGrade ? 'Update Grade' : 'Tambah Grade'}
                </button>
                {editingGrade && (
                  <button
                    type="button"
                    onClick={() => { setEditingGrade(null); setGradeForm(emptyGrade); setGradeError('') }}
                    className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {grades.length === 0 ? (
            <div className="px-5 py-6 text-sm text-center text-gray-400">Belum ada grade. Tambahkan grade di atas.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Label</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Rentang Poin</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map((grade) => (
                  <GradeRow
                    key={grade.id}
                    grade={grade}
                    onEdit={startEditGrade}
                    onDelete={setConfirmGradeDelete}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Questions link */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Pertanyaan</h2>
          <p className="text-sm text-gray-500 mb-4">Kelola pertanyaan untuk quiz ini di halaman Pertanyaan.</p>
          <Link
            to={`/questions/create?quiz_id=${id}`}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Tambah Pertanyaan untuk Quiz Ini
          </Link>
        </div>
      </div>
    </Layout>
  )
}
