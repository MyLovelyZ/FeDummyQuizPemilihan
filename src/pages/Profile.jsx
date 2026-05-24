import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile, deleteProfile } from '../api'
import Layout from '../components/Layout'
import Alert from '../components/Alert'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Profile() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', current_password: '', new_password: '', new_password_confirmation: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getProfile().then((res) => {
      const u = res.data.user
      setProfile(u)
      setForm((f) => ({ ...f, name: u.name, email: u.email }))
    })
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    const payload = { name: form.name, email: form.email }
    if (form.current_password) {
      payload.current_password = form.current_password
      payload.new_password = form.new_password
      payload.new_password_confirmation = form.new_password_confirmation
    }
    try {
      const res = await updateProfile(payload)
      setSuccess('Profil berhasil diperbarui.')
      const u = res.data.user
      setProfile(u)
      setForm((f) => ({ ...f, current_password: '', new_password: '', new_password_confirmation: '' }))
    } catch (err) {
      const errs = err.response?.data?.errors
      const msg = errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal memperbarui profil.')
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteProfile()
      await logout()
      navigate('/login')
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-40 text-gray-400">Memuat profil...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <ConfirmDialog
        open={confirmDelete}
        title="Hapus Akun"
        message="Akun Anda akan dihapus permanen beserta semua data terkait. Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleting}
      />

      <div className="max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleUpdate} className="space-y-4">
            <Alert type="success" message={success} />
            <Alert type="error" message={error} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <hr className="my-2" />
            <p className="text-xs text-gray-500">Isi bagian ini hanya jika ingin mengganti password.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
              <input
                type="password"
                value={form.current_password}
                onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input
                type="password"
                value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={form.new_password_confirmation}
                onChange={(e) => setForm({ ...form, new_password_confirmation: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-base font-semibold text-red-700 mb-2">Zona Berbahaya</h2>
          <p className="text-sm text-gray-600 mb-4">Hapus akun Anda secara permanen. Tindakan ini tidak dapat diurungkan.</p>
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Hapus Akun
          </button>
        </div>
      </div>
    </Layout>
  )
}
