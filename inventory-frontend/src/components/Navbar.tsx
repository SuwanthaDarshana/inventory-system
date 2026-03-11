
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-xl font-bold text-blue-600">Inventory</span>
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
        <Link to="/items" className="text-gray-700 hover:text-blue-600">Items</Link>
        <Link to="/borrow" className="text-gray-700 hover:text-blue-600">Borrow</Link>
        {isAdmin && (
          <>
            <Link to="/cupboards" className="text-gray-700 hover:text-blue-600">Cupboards</Link>
            <Link to="/places" className="text-gray-700 hover:text-blue-600">Places</Link>
            <Link to="/users" className="text-gray-700 hover:text-blue-600">Users</Link>
            <Link to="/audit-logs" className="text-gray-700 hover:text-blue-600">Audit Logs</Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {user?.name} ({user?.role})
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
