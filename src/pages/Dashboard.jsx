import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import axios from 'axios'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    inventoryItems: 0,
    workReports: 0,
    pendingReminders: 0,
    customerReports: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [inventory, workReports, reminders, customerReports] = await Promise.all([
        axios.get('/api/inventory'),
        axios.get('/api/work-reports'),
        axios.get('/api/reminders'),
        axios.get('/api/customer-reports')
      ])

      // Calculate stats
      const inventoryCount = inventory.data.reduce((sum, item) => sum + item.quantity, 0)
      const pendingReminders = reminders.data.filter(reminder => 
        new Date(reminder.date) >= new Date()
      ).length

      setStats({
        inventoryItems: inventoryCount,
        workReports: workReports.data.length,
        pendingReminders,
        customerReports: customerReports.data.length
      })

      // Recent activity (last 5 items from all sources)
      const allActivities = [
        ...workReports.data.map(item => ({ ...item, type: 'work', icon: '📝' })),
        ...reminders.data.map(item => ({ ...item, type: 'reminder', icon: '⏰' })),
        ...customerReports.data.map(item => ({ ...item, type: 'customer', icon: '📞' }))
      ]
      
      const sorted = allActivities
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
      
      setRecentActivity(sorted)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWelcomeMessage = () => {
    switch (user.role) {
      case 'מנהל':
        return 'ברוך הבא לפאנל הניהול. כאן תוכל לראות את כל הפעילות והנתונים של הצוות.'
      case 'עצמאי':
        return 'ברוך הבא לחשבון העצמאי שלך. נהל את העבודות והמלאי שלך ביעילות.'
      case 'עובד':
        return 'ברוך הבא לאפליקציית העובדים. תעד עבודות, נהל מלאי וקבל תזכורות.'
      default:
        return 'ברוך הבא ל-GoWork!'
    }
  }

  if (loading) {
    return <div className="loading">טוען נתונים...</div>
  }

  return (
    <div>
      <div className="card">
        <h2 className="card-title">שלום, {user.name}!</h2>
        <p style={{ color: 'var(--dark-gray)', marginTop: '0.5rem' }}>
          {getWelcomeMessage()}
        </p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.inventoryItems}</div>
          <div className="stat-label">פריטי מלאי</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.workReports}</div>
          <div className="stat-label">דוחות עבודה</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.pendingReminders}</div>
          <div className="stat-label">תזכורות פעילות</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.customerReports}</div>
          <div className="stat-label">דיווחי לקוחות</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">גישה מהירה</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <Link to="/inventory" className="btn btn-primary">
            📦 מלאי
          </Link>
          <Link to="/work-documentation" className="btn btn-primary">
            📝 תיעוד עבודה
          </Link>
          <Link to="/reminders" className="btn btn-secondary">
            ⏰ תזכורות
          </Link>
          <Link to="/customer-reports" className="btn btn-secondary">
            📞 דיווח בעיה
          </Link>
        </div>
      </div>

      {recentActivity.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">פעילות אחרונה</h3>
          </div>
          
          <div>
            {recentActivity.map((activity, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid var(--light-gray)' : 'none'
                }}
              >
                <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem' }}>
                  {activity.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>
                    {activity.type === 'work' && activity.clientName}
                    {activity.type === 'reminder' && activity.content}
                    {activity.type === 'customer' && activity.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--dark-gray)' }}>
                    {new Date(activity.createdAt).toLocaleDateString('he-IL')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard