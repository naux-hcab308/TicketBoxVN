'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Copy, Check, X, Loader2, UserPlus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStaff, addStaff, updateStaffStatus, deleteStaff } from '../actions'

export default function StaffPage() {
  const [staffList, setStaffList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingShift, setEditingShift] = useState<{ id: string; value: string } | null>(null)

  useEffect(() => {
    getStaff().then(({ data }) => {
      setStaffList(data)
      setLoading(false)
    })
  }, [])

  async function handleAdd(formData: FormData) {
    setFormLoading(true)
    const result = await addStaff(formData)
    if (result.success) {
      setShowForm(false)
      const { data } = await getStaff()
      setStaffList(data)
    }
    setFormLoading(false)
  }

  async function handleDelete(staffId: string) {
    if (!confirm('Xóa nhân viên này?')) return
    await deleteStaff(staffId)
    const { data } = await getStaff()
    setStaffList(data)
  }

  async function handleShiftUpdate(staffId: string, shiftId: string) {
    await updateStaffStatus(staffId, shiftId)
    setEditingShift(null)
    const { data } = await getStaff()
    setStaffList(data)
  }

  function copyCode(code: string, staffId: string) {
    navigator.clipboard.writeText(code)
    setCopiedId(staffId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân viên check-in</h1>
          <p className="text-muted-foreground mt-1">Thêm và quản lý nhân viên soát vé</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Add Staff Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Thêm nhân viên mới</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4" /></button>
          </div>
          <form action={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên nhân viên *</label>
              <input name="name" required
                className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số nhân viên</label>
              <input name="staff_number"
                className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="NV001" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ca làm việc</label>
              <select name="shift_id"
                className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <Button type="submit" size="sm" disabled={formLoading}>
                {formLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                Thêm
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tên</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mã nhân viên</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Số NV</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ngày thêm</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-secondary rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Chưa có nhân viên nào
                  </td>
                </tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s.staff_id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-secondary px-2 py-0.5 rounded">{s.employee_code}</code>
                        <button
                          onClick={() => copyCode(s.employee_code, s.staff_id)}
                          className="p-1 hover:bg-secondary rounded transition-colors"
                          title="Copy mã truy cập"
                        >
                          {copiedId === s.staff_id
                            ? <Check className="w-3.5 h-3.5 text-green-500" />
                            : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          }
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.staff_number || '—'}</td>
                    <td className="px-4 py-3">
                      {editingShift && editingShift.id === s.staff_id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={editingShift.value}
                            onChange={(e) => setEditingShift({ ...editingShift, value: e.target.value })}
                            className="px-2 py-1 text-xs bg-card border border-border rounded"
                          >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Ngừng</option>
                          </select>
                          <button onClick={() => handleShiftUpdate(s.staff_id, editingShift.value)} className="p-1 hover:bg-green-50 rounded">
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          </button>
                          <button onClick={() => setEditingShift(null)} className="p-1 hover:bg-red-50 rounded">
                            <X className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingShift({ id: s.staff_id, value: s.shift_id || 'active' })}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            s.shift_id === 'inactive'
                              ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {s.shift_id === 'inactive' ? 'Ngừng' : 'Hoạt động'}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => copyCode(s.employee_code, s.staff_id)}
                          className="p-1.5 hover:bg-secondary rounded-md transition-colors"
                          title="Gửi lại mã truy cập"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.staff_id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && staffList.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            Tổng: {staffList.length} nhân viên
          </div>
        )}
      </div>
    </div>
  )
}
