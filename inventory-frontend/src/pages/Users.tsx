import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import type { User } from "../types";

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">+ Add User</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editing ? "Edit" : "Add"} User</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border rounded p-2" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border rounded p-2" />
              <input type="password" placeholder={editing ? "New password (leave blank to keep)" : "Password"} value={password} onChange={(e) => setPassword(e.target.value)} {...(!editing && { required: true })} className="w-full border rounded p-2" />
              <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "staff")} className="w-full border rounded p-2">
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">{editing ? "Update" : "Create"}</button>
              <button type="button" onClick={resetForm} className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => openEdit(u)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
