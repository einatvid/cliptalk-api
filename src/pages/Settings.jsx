import React, { useState } from 'react'
import { useAuth } from '../App'
import { useNavigate } from 'react-router-dom'

const Settings = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const handleLogout = () => {
    if (window.confirm('האם אתה בטוח שברצונך להתנתק?')) {
      logout()
      navigate('/login')
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('הסיסמאות החדשות אינן תואמות')
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('הסיסמה החדשה חייבת להכיל לפחות 6 תווים')
      setLoading(false)
      return
    }

    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setSuccess('הסיסמה שונתה בהצלחה')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
    } catch (err) {
      setError('שגיאה בשינוי הסיסמה')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setSuccess('הפרופיל עודכן בהצלחה')
      setShowProfileForm(false)
    } catch (err) {
      setError('שגיאה בעדכון הפרופיל')
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // In a real app, this would upload the file
      setSuccess('תמונת הפרופיל עודכנה בהצלחה')
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">הגדרות</h2>
        </div>
        
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
      </div>

      {/* Profile Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">פרופיל משתמש</h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || '👤'}
          </div>
          
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{user?.name}</h4>
            <p style={{ color: 'var(--dark-gray)', margin: '0 0 0.5rem 0' }}>{user?.email}</p>
            <p style={{ 
              backgroundColor: 'var(--light-gray)', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              display: 'inline-block',
              fontSize: '0.9rem'
            }}>
              {user?.role}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowProfileForm(true)}
          >
            ✏️ עדכן פרטים
          </button>
          
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            📷 שנה תמונה
            <input
              type="file"
              onChange={handleProfilePictureChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Update Profile Form */}
      {showProfileForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">עדכון פרטי פרופיל</h3>
          </div>
          
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="form-label">שם מלא</label>
              <input
                type="text"
                className="form-input"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">אימייל</label>
              <input
                type="email"
                className="form-input"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'שומר...' : 'שמור שינויים'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowProfileForm(false)}
              >
                בטל
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">אבטחה</h3>
        </div>
        
        <button 
          className="btn btn-secondary"
          onClick={() => setShowPasswordForm(true)}
        >
          🔒 שנה סיסמה
        </button>
      </div>

      {/* Change Password Form */}
      {showPasswordForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">שינוי סיסמה</h3>
          </div>
          
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">סיסמה נוכחית</label>
              <input
                type="password"
                className="form-input"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">סיסמה חדשה</label>
              <input
                type="password"
                className="form-input"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label className="form-label">אישור סיסמה חדשה</label>
              <input
                type="password"
                className="form-input"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
                minLength="6"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'משנה...' : 'שנה סיסמה'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  setShowPasswordForm(false)
                }}
              >
                בטל
              </button>
            </div>
          </form>
        </div>
      )}

      {/* App Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">אודות האפליקציה</h3>
        </div>
        
        <div style={{ lineHeight: '1.6' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>GoWork</strong> - אפליקציית עובדי שטח
          </p>
          <p style={{ marginBottom: '0.5rem', color: 'var(--dark-gray)' }}>
            גרסה 1.0.0
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--dark-gray)' }}>
            אפליקציה לניהול מלאי, תיעוד עבודות ותזכורות לעובדי שטח
          </p>
        </div>
      </div>

      {/* Logout Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">יציאה מהמערכת</h3>
        </div>
        
        <p style={{ marginBottom: '1rem', color: 'var(--dark-gray)' }}>
          לחץ על הכפתור למטה כדי להתנתק מהחשבון
        </p>
        
        <button 
          className="btn btn-danger"
          onClick={handleLogout}
        >
          🚪 התנתק
        </button>
      </div>
    </div>
  )
}

export default Settings