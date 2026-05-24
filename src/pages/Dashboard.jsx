import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getQuizzes, getQuestions, getAdmins } from '../api'
import Layout from '../components/Layout'

function StatCard({ label, value, to, loading }) {
  return (
    <Link to={to} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow block">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">
        {loading ? <span className="text-gray-300 animate-pulse">—</span> : value}
      </p>
    </Link>
  )
}

export default function Dashboard() {
  const { isSuperadmin } = useAuth()
  const [stats, setStats] = useState({ quizzes: 0, questions: 0, admins: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [qzRes, qqRes] = await Promise.all([getQuizzes(), getQuestions()])
        const newStats = {
          quizzes: qzRes.data.data?.length ?? 0,
          questions: qqRes.data.data?.length ?? 0,
          admins: 0,
        }
        if (isSuperadmin) {
          const adRes = await getAdmins()
          newStats.admins = adRes.data.data?.length ?? 0
        }
        setStats(newStats)
      } catch {
        // silently ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isSuperadmin])

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Selamat datang di Sistem Quiz Pemilihan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Quiz" value={stats.quizzes} to="/quizzes" loading={loading} />
          <StatCard label="Total Pertanyaan" value={stats.questions} to="/questions" loading={loading} />
          {isSuperadmin && (
            <StatCard label="Total Admin" value={stats.admins} to="/superadmin/admins" loading={loading} />
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Aksi Cepat</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/quizzes/create"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buat Quiz Baru
            </Link>
            <Link
              to="/questions/create"
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Buat Pertanyaan
            </Link>
            {isSuperadmin && (
              <Link
                to="/superadmin/admins/create"
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                Tambah Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
