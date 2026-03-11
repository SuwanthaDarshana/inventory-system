import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-lg font-bold text-gray-800">Inventory</span>
      </div>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
