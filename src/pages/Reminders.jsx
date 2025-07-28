import React, { useState, useEffect } from 'react'
import VoiceInput from '../components/VoiceInput'
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns'
import { he } from 'date-fns/locale'
import axios from 'axios'

const Reminders = () => {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  
  const [newReminder, setNewReminder] = useState({
    content: '',
    date: ''
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/reminders')
      setReminders(response.data)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/reminders', newReminder)
      setReminders([response.data, ...reminders])
      setNewReminder({ content: '', date: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Error creating reminder:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseVoiceInput = (voiceText) => {
    const text = voiceText.toLowerCase()
    
    // Extract date patterns
    const datePatterns = [
      { pattern: /(\d{1,2})\.(\d{1,2})/, format: (match) => `2024-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` },
      { pattern: /(\d{1,2})\/(\d{1,2})/, format: (match) => `2024-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` },
      { pattern: /מחר/, format: () => format(addDays(new Date(), 1), 'yyyy-MM-dd') },
      { pattern: /השבוע/, format: () => format(addDays(new Date(), 7), 'yyyy-MM-dd') },
      { pattern: /יום ראשון/, format: () => getNextDayOfWeek(0) },
      { pattern: /יום שני/, format: () => getNextDayOfWeek(1) },
      { pattern: /יום שלישי/, format: () => getNextDayOfWeek(2) },
      { pattern: /יום רביעי/, format: () => getNextDayOfWeek(3) },
      { pattern: /יום חמישי/, format: () => getNextDayOfWeek(4) },
      { pattern: /יום שישי/, format: () => getNextDayOfWeek(5) },
      { pattern: /שבת/, format: () => getNextDayOfWeek(6) }
    ]

    let detectedDate = ''
    let cleanContent = voiceText

    for (const { pattern, format: formatter } of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        detectedDate = formatter(match)
        cleanContent = voiceText.replace(match[0], '').trim()
        break
      }
    }

    // Remove common time/date words from content
    cleanContent = cleanContent.replace(/(ב|ה|את|על|תזכורת|להזכיר|זכור)/g, '').trim()

    setNewReminder({
      content: cleanContent || voiceText,
      date: detectedDate || newReminder.date
    })
  }

  const getNextDayOfWeek = (dayOfWeek) => {
    const today = new Date()
    const currentDay = today.getDay()
    const daysUntilTarget = (dayOfWeek + 7 - currentDay) % 7 || 7
    const targetDate = addDays(today, daysUntilTarget)
    return format(targetDate, 'yyyy-MM-dd')
  }

  const getFilteredReminders = () => {
    const now = new Date()
    
    switch (filter) {
      case 'today':
        return reminders.filter(reminder => {
          const reminderDate = parseISO(reminder.date)
          return format(reminderDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
        })
      case 'upcoming':
        return reminders.filter(reminder => {
          const reminderDate = parseISO(reminder.date)
          return isAfter(reminderDate, now)
        })
      case 'past':
        return reminders.filter(reminder => {
          const reminderDate = parseISO(reminder.date)
          return isBefore(reminderDate, now)
        })
      default:
        return reminders
    }
  }

  const getDaysUntilReminder = (date) => {
    const now = new Date()
    const reminderDate = parseISO(date)
    const diffTime = reminderDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'היום'
    if (diffDays === 1) return 'מחר'
    if (diffDays === -1) return 'אתמול'
    if (diffDays > 0) return `בעוד ${diffDays} ימים`
    return `לפני ${Math.abs(diffDays)} ימים`
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">תזכורות חכמות</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ תזכורת חדשה
            </button>
            <VoiceInput 
              onResult={parseVoiceInput}
              placeholder="🎤 הוסף תזכורת קולית"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="filters">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            הכל ({reminders.length})
          </button>
          <button 
            className={`btn ${filter === 'today' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('today')}
          >
            היום
          </button>
          <button 
            className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('upcoming')}
          >
            קרובות
          </button>
          <button 
            className={`btn ${filter === 'past' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('past')}
          >
            עברו
          </button>
        </div>
      </div>

      {/* Add Reminder Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">תזכורת חדשה</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">תוכן התזכורת</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-input"
                  value={newReminder.content}
                  onChange={(e) => setNewReminder({...newReminder, content: e.target.value})}
                  required
                  placeholder='למשל: "רופא שיניים מחר" או "10.8 רופא שיניים"'
                  style={{ flex: 1 }}
                />
                <VoiceInput 
                  onResult={parseVoiceInput}
                />
              </div>
              <small style={{ color: 'var(--dark-gray)', fontSize: '0.8rem' }}>
                💡 ניתן לומר למשל: "10.8 רופא שיניים" והמערכת תזהה את התאריך אוטומטית
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">תאריך</label>
              <input
                type="date"
                className="form-input"
                value={newReminder.date}
                onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'שומר...' : 'הוסף תזכורת'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setNewReminder({ content: '', date: '' })
                  setShowForm(false)
                }}
              >
                בטל
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {filter === 'all' && `כל התזכורות (${getFilteredReminders().length})`}
            {filter === 'today' && 'תזכורות היום'}
            {filter === 'upcoming' && 'תזכורות קרובות'}
            {filter === 'past' && 'תזכורות שעברו'}
          </h3>
        </div>
        
        {loading ? (
          <div className="loading">טוען...</div>
        ) : getFilteredReminders().length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dark-gray)' }}>
            אין תזכורות
          </p>
        ) : (
          <div>
            {getFilteredReminders()
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((reminder) => {
                const isPast = isBefore(parseISO(reminder.date), new Date())
                const isToday = format(parseISO(reminder.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                
                return (
                  <div 
                    key={reminder.id}
                    style={{
                      border: '1px solid var(--light-gray)',
                      borderRadius: 'var(--border-radius)',
                      padding: '1rem',
                      marginBottom: '1rem',
                      backgroundColor: isToday ? '#fff3cd' : isPast ? '#f8f9fa' : 'white',
                      opacity: isPast ? 0.7 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>
                            {isToday ? '🔔' : isPast ? '⏰' : '📅'}
                          </span>
                          <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>
                            {reminder.content}
                          </h4>
                        </div>
                        
                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--dark-gray)' }}>
                          <span>📅 {format(parseISO(reminder.date), 'dd/MM/yyyy', { locale: he })}</span>
                          <span style={{ marginRight: '1rem' }}>⏱️ {getDaysUntilReminder(reminder.date)}</span>
                        </div>
                      </div>
                      
                      {isToday && (
                        <span style={{
                          backgroundColor: 'var(--warning-color)',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          היום!
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reminders