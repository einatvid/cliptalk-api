import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../App'

const Layout = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()

  const menuItems = [
    { path: '/', label: 'לוח בקרה', icon: '🏠' },
    { path: '/inventory', label: 'מלאי', icon: '📦' },
    { path: '/work-documentation', label: 'תיעוד עבודה', icon: '📝' },
    { path: '/reminders', label: 'תזכורות', icon: '⏰' },
    { path: '/customer-reports', label: 'דיווחי לקוחות', icon: '📞' },
    { path: '/settings', label: 'הגדרות', icon: '⚙️' },
  ]

  return (
    <div>
      <header className="header">
        <h1>GoWork</h1>
        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          שלום, {user?.name} ({user?.role})
        </div>
      </header>

      <nav className="nav-menu">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span style={{ marginLeft: '0.5rem' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <main style={{ padding: '1rem' }}>
        {children}
      </main>
    </div>
  )
}

export default Layout