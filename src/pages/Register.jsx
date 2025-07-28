import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import VoiceInput from '../components/VoiceInput'
import axios from 'axios'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'עובד'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/api/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      
      login(response.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה ברישום')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleVoiceResult = (field, result) => {
    setFormData({
      ...formData,
      [field]: result
    })
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div className="header">
        <h1>GoWork</h1>
        <p>הרשמה לחשבון חדש</p>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">שם מלא</label>
            <div className="input-group">
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="הזן את השם המלא שלך"
                style={{ flex: 1 }}
              />
              <VoiceInput 
                onResult={(result) => handleVoiceResult('name', result)}
                placeholder="🎤"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">אימייל</label>
            <div className="input-group">
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="הזן את האימייל שלך"
                style={{ flex: 1 }}
              />
              <VoiceInput 
                onResult={(result) => handleVoiceResult('email', result)}
                placeholder="🎤"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">תפקיד</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="מנהל">מנהל</option>
              <option value="עצמאי">עצמאי</option>
              <option value="עובד">עובד</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">סיסמה</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="הזן סיסמה"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label className="form-label">אישור סיסמה</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="הזן שוב את הסיסמה"
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'נרשם...' : 'הרשמה'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p>יש לך כבר חשבון?</p>
          <Link to="/login" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
            התחברות
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register