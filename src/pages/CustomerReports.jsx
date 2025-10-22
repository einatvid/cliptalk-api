import React, { useState, useEffect } from 'react'
import VoiceInput from '../components/VoiceInput'
import axios from 'axios'

const CustomerReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  
  const [newReport, setNewReport] = useState({
    title: '',
    description: ''
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/customer-reports')
      setReports(response.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/customer-reports', newReport)
      setReports([response.data, ...reports])
      setNewReport({ title: '', description: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Error creating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceResult = (field, result) => {
    setNewReport({
      ...newReport,
      [field]: result
    })
  }

  const getFilteredReports = () => {
    switch (filter) {
      case 'open':
        return reports.filter(report => report.status === 'פתוח')
      case 'closed':
        return reports.filter(report => report.status === 'סגור')
      case 'in-progress':
        return reports.filter(report => report.status === 'בטיפול')
      default:
        return reports
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'פתוח':
        return { backgroundColor: '#fff3cd', color: '#856404' }
      case 'בטיפול':
        return { backgroundColor: '#d1ecf1', color: '#0c5460' }
      case 'סגור':
        return { backgroundColor: '#d4edda', color: '#155724' }
      default:
        return { backgroundColor: '#f8f9fa', color: '#6c757d' }
    }
  }

  const commonIssueTemplates = [
    {
      title: 'בעיה בחיבור לאינטרנט',
      description: 'הלקוח מדווח על בעיה בחיבור לאינטרנט. יש לבדוק את החיבורים והגדרות הנתב.'
    },
    {
      title: 'ציוד פגום',
      description: 'נמצא ציוד פגום אצל הלקוח שדורש החלפה.'
    },
    {
      title: 'בעיה בטלוויזיה',
      description: 'הלקוח מדווח על בעיה בקליטת הטלוויזיה או באיכות התמונה.'
    },
    {
      title: 'בקשה להתקנה נוספת',
      description: 'הלקוח מבקש התקנה נוספת או שדרוג השירות.'
    }
  ]

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">דיווחי לקוחות</h2>
          <p style={{ color: 'var(--dark-gray)', marginTop: '0.5rem' }}>
            דווח על בעיות, תלונות או בקשות לקוחות לצוות השירות
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            style={{ marginTop: '1rem' }}
          >
            ➕ דיווח חדש
          </button>
        </div>

        {/* Quick Filters */}
        <div className="filters">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            הכל ({reports.length})
          </button>
          <button 
            className={`btn ${filter === 'open' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('open')}
          >
            פתוחים
          </button>
          <button 
            className={`btn ${filter === 'in-progress' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('in-progress')}
          >
            בטיפול
          </button>
          <button 
            className={`btn ${filter === 'closed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('closed')}
          >
            סגורים
          </button>
        </div>
      </div>

      {/* New Report Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">דיווח חדש</h3>
          </div>
          
          {/* Quick Templates */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">תבניות מהירות</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {commonIssueTemplates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setNewReport(template)}
                  style={{ 
                    padding: '0.5rem', 
                    fontSize: '0.85rem',
                    textAlign: 'right',
                    height: 'auto',
                    whiteSpace: 'normal'
                  }}
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">כותרת הדיווח</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-input"
                  value={newReport.title}
                  onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                  required
                  placeholder="תאר בקצרה את הבעיה"
                  style={{ flex: 1 }}
                />
                <VoiceInput 
                  onResult={(result) => handleVoiceResult('title', result)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">תיאור מפורט</label>
              <div className="input-group">
                <textarea
                  className="form-input"
                  value={newReport.description}
                  onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                  required
                  placeholder="תאר את הבעיה בפירוט, כולל מידע על הלקוח, מיקום, וכל פרט רלוונטי"
                  rows="5"
                  style={{ flex: 1, resize: 'vertical' }}
                />
                <VoiceInput 
                  onResult={(result) => handleVoiceResult('description', result)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'שולח...' : 'שלח דיווח'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setNewReport({ title: '', description: '' })
                  setShowForm(false)
                }}
              >
                בטל
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {filter === 'all' && `כל הדיווחים (${getFilteredReports().length})`}
            {filter === 'open' && 'דיווחים פתוחים'}
            {filter === 'in-progress' && 'דיווחים בטיפול'}
            {filter === 'closed' && 'דיווחים סגורים'}
          </h3>
        </div>
        
        {loading ? (
          <div className="loading">טוען...</div>
        ) : getFilteredReports().length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dark-gray)' }}>
            אין דיווחים
          </p>
        ) : (
          <div>
            {getFilteredReports()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((report) => (
                <div 
                  key={report.id}
                  style={{
                    border: '1px solid var(--light-gray)',
                    borderRadius: 'var(--border-radius)',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📞</span>
                        <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>
                          {report.title}
                        </h4>
                      </div>
                      
                      <p style={{ margin: '0.5rem 0', lineHeight: '1.5' }}>
                        {report.description}
                      </p>
                      
                      <div style={{ fontSize: '0.85rem', color: 'var(--dark-gray)' }}>
                        📅 {new Date(report.createdAt).toLocaleDateString('he-IL')} - {new Date(report.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <span 
                      style={{
                        ...getStatusColor(report.status),
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        marginRight: '1rem'
                      }}
                    >
                      {report.status}
                    </span>
                  </div>
                  
                  {report.status === 'פתוח' && (
                    <div style={{ 
                      backgroundColor: '#fff3cd', 
                      padding: '0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: '#856404',
                      marginTop: '0.5rem'
                    }}>
                      💡 הדיווח נשלח לצוות השירות ויטופל בהקדם
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">💡 עזרה ותמיכה</h3>
        </div>
        
        <div style={{ lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>מתי לדווח?</strong>
          </p>
          <ul style={{ marginBottom: '1rem', paddingRight: '1.5rem' }}>
            <li>בעיות טכניות שלא הצלחת לפתור</li>
            <li>ציוד פגום או חסר</li>
            <li>תלונות לקוחות</li>
            <li>בקשות מיוחדות מלקוחות</li>
            <li>בעיות בטיחות או חירום</li>
          </ul>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--dark-gray)' }}>
            <strong>זמן תגובה:</strong> דיווחים רגילים - עד 24 שעות | דיווחי חירום - מיידי
          </p>
        </div>
      </div>
    </div>
  )
}

export default CustomerReports