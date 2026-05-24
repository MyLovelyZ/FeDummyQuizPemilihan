import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdmins, toggleBanAdmin, deleteAdmin } from '../../api'
import Layout from '../../components/Layout'
import Alert from '../../components/Alert'
import ConfirmDialog from '../../components/ConfirmDialog'

function BanBadge({ bannedAt }) {
  if (!bannedAt) return <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">Aktif</span>
  return <span className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">Di-ban</span>
}

export default function AdminList() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [banTarget, setBanTarget] = useState(null)
  const [banLoading, setBanLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = async () => {
    try {
      const res = await getAdmins()
      setAdmins(res.data.data ?? [])
    } catch {
      setError('Gagal memuat daftar admin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleBan = async () => {
    setBanLoading(true)
    try {
      const res = await toggleBanAdmin(banTarget.id)
      const updated = res.data.data
      setAdmins((prev) => prev.map((a) => a.id === updated.id ? { ...a, banned_at: updated.banned_at } : a))
      setBanTarget(null)
    } catch {
      setError('Gagal mengubah status ban.')
    } finally {
      setBanLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteAdmin(deleteTarget.id)
      setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      setError('Gagal menghapus admin.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Layout>
      <ConfirmDialog
        open={!!banTarget}
        title={banTarget?.banned_at ? 'Unban Admin' : 'Ban Admin'}
        message={banTarget?.banned_at
          ? `Admin "${banTarget?.name}" akan di-unban dan dapat login kembali.`
          : `Admin "${banTarget?.name}" akan di-ban. Semua token aktifnya akan dicabut.`}
        onConfirm={handleBan}
        onCancel={() => setBanTarget(null)}
        loading={banLoading}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Admin"
        message={`Akun admin "${deleteTarget?.name}" akan dihapus permanen.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Admin</h1>
          <Link
            to="/superadmin/admins/create"
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tambah Admin
          </Link>
        </div>

        <Alert type="error" message={error} />

        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Belum ada admin.{' '}
            <Link to="/superadmin/admins/create" className="text-blue-600 hover:underline">Tambah admin pertama.</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link to={`/superadmin/admins/${admin.id}`} className="hover:text-blue-600">
                        {admin.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{admin.email}</td>
                    <td className="px-4 py-3">
                      <BanBadge bannedAt={admin.banned_at} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/superadmin/admins/${admin.id}`}
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                        >
                          Detail
                        </Link>
                        <button
                          onClick={() => setBanTarget(admin)}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${
                            admin.banned_at
                              ? 'text-green-700 bg-green-50 hover:bg-green-100'
                              : 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                          }`}
                        >
                          {admin.banned_at ? 'Unban' : 'Ban'}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(admin)}
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
