import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between">
        <h1 className="font-semibold">Inventory System</h1>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="px-3 py-1 rounded border border-slate-600"
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </header>

      <aside
        className={`${
          menuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-900 text-white md:min-h-screen`}
      >
        <div className="p-6 hidden md:block">
          <h1 className="text-xl font-bold">Inventory System</h1>
          <p className="text-slate-400 text-sm mt-1">Order Management</p>
        </div>
        <nav className="p-4 md:pt-0 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
