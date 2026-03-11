import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

// Layout wraps all authenticated pages.
// It shows the Navbar at top and renders the current route's page below it.
export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
