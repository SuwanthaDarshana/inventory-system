import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import Borrow from "./pages/Borrow";
import Cupboards from "./pages/Cupboards";
import Places from "./pages/Places";
import Users from "./pages/Users";
import AuditLogs from "./pages/AuditLogs";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Login />} />

          {/* Authenticated routes — wrapped in Layout (Navbar + content) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/items" element={<Items />} />
              <Route path="/borrow" element={<Borrow />} />
            </Route>
          </Route>

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<Layout />}>
              <Route path="/cupboards" element={<Cupboards />} />
              <Route path="/places" element={<Places />} />
              <Route path="/users" element={<Users />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
