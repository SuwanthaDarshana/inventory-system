import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import type { User } from "../types";
import Modal from "../components/Modal";

const inputClass =
  "w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");

  const fetchUsers = () => {
    api.get("/users").then((res) => setUsers(res.data));
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => { setName(""); setEmail(""); setPassword(""); setRole("staff"); setEditing(null); setShowForm(false); };

  const openEdit = (u: User) => {
    setEditing(u); setName(u.name); setEmail(u.email); setPassword(""); setRole(u.role); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const data: Record<string, string> = { name, email, role };
        if (password) data.password = password;
        await api.put(`/users/${editing.id}`, data);
        toast.success("User updated");
      } else {
        await api.post("/users", { name, email, password, role });
        toast.success("User created");
      }
      fetchUsers(); resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to save user");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted"); fetchUsers();
    } catch { toast.error("Failed to delete"); }
  };

  const RoleBadge = ({ role }: { role: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${
      role === "admin"
        ? "bg-purple-50 text-purple-700 ring-purple-600/20"
        : "bg-sky-50 text-sky-700 ring-sky-600/20"
    }`}>
      {role}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} user{users.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add User
        </button>
      </div>

      {/* Modal */}
      <Modal open={showForm} onClose={resetForm} title={editing ? "Edit User" : "Add User"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {editing && <span className="text-gray-400 font-normal">(leave blank to keep)</span>}
            </label>
            <input type="password" placeholder={editing ? "••••••••" : "Create a password"} value={password} onChange={(e) => setPassword(e.target.value)} {...(!editing && { required: true })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "staff")} className={inputClass}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
              {editing ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white ${u.role === "admin" ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-sky-400 to-blue-500"}`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600 text-sm">{u.email}</td>
                <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                No users found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${u.role === "admin" ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-sky-400 to-blue-500"}`}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
              </div>
              <RoleBadge role={u.role} />
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
              <button onClick={() => openEdit(u)} className="flex-1 text-center py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all cursor-pointer">
                Edit
              </button>
              <button onClick={() => handleDelete(u.id)} className="flex-1 text-center py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">No users found</div>
        )}
      </div>
    </div>
  );
}
