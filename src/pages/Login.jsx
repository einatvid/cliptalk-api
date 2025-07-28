import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import axios from 'axios'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/login', formData)
      login(response.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בהתחברות')
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

  return (
    <div style={{ padding: '2rem' }}>
      <div className="header">
        <h1>GoWork</h1>
        <p>כניסה לחשבון</p>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">אימייל</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="הזן את האימייל שלך"
            />
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
              placeholder="הזן את הסיסמה שלך"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p>אין לך חשבון?</p>
          <Link to="/register" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
            הרשמה
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login