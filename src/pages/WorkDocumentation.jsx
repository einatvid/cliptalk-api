import React, { useState, useEffect, useRef } from 'react'
import VoiceInput from '../components/VoiceInput'
import SignatureCanvas from 'react-signature-canvas'
import axios from 'axios'

const WorkDocumentation = () => {
  const [workReports, setWorkReports] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [isCamera, setIsCamera] = useState(false)

  const [formData, setFormData] = useState({
    clientName: '',
    address: '',
    description: ''
  })

  const sigCanvas = useRef()
  const videoRef = useRef()
  const fileInputRef = useRef()

  useEffect(() => {
    fetchWorkReports()
  }, [])

  const fetchWorkReports = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/work-reports')
      setWorkReports(response.data)
    } catch (error) {
      console.error('Error fetching work reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const signature = sigCanvas.current.getTrimmedCanvas().toDataURL()
      
      const submitData = new FormData()
      submitData.append('clientName', formData.clientName)
      submitData.append('address', formData.address)
      submitData.append('description', formData.description)
      submitData.append('signature', signature)
      
      if (capturedPhoto) {
        submitData.append('photo', capturedPhoto)
      }

      const response = await axios.post('/api/work-reports', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setWorkReports([response.data, ...workReports])
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Error creating work report:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ clientName: '', address: '', description: '' })
    setCapturedPhoto(null)
    sigCanvas.current?.clear()
  }

  const handleVoiceResult = (field, result) => {
    setFormData({
      ...formData,
      [field]: result
    })
  }

  const startCamera = async () => {
    setIsCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setIsCamera(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0)
      
      canvas.toBlob((blob) => {
        setCapturedPhoto(blob)
        stopCamera()
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    }
    setIsCamera(false)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCapturedPhoto(file)
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">תיעוד עבודה</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            style={{ marginTop: '1rem' }}
          >
            ➕ דו״ח עבודה חדש
          </button>
        </div>
      </div>

      {/* New Work Report Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">דו״ח עבודה חדש</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">שם הלקוח</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-input"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  required
                  placeholder="הזן שם הלקוח"
                  style={{ flex: 1 }}
                />
                <VoiceInput 
                  onResult={(result) => handleVoiceResult('clientName', result)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">כתובת</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                  placeholder="הזן כתובת"
                  style={{ flex: 1 }}
                />
                <VoiceInput 
                  onResult={(result) => handleVoiceResult('address', result)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">תיאור העבודה</label>
              <div className="input-group">
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="תאר את העבודה שבוצעה"
                  rows="4"
                  style={{ flex: 1, resize: 'vertical' }}
                />
                <VoiceInput 
                  onResult={(result) => handleVoiceResult('description', result)}
                />
              </div>
            </div>

            {/* Photo Section */}
            <div className="form-group">
              <label className="form-label">תמונה</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={startCamera}
                >
                  📷 צלם תמונה
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 בחר קובץ
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              {/* Camera View */}
              {isCamera && (
                <div className="camera-container">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    style={{ width: '100%', maxHeight: '300px' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button 
                      type="button"
                      className="btn btn-success" 
                      onClick={capturePhoto}
                    >
                      📸 צלם
                    </button>
                    <button 
                      type="button"
                      className="btn btn-danger" 
                      onClick={stopCamera}
                    >
                      ❌ בטל
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Preview */}
              {capturedPhoto && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ color: 'var(--success-color)' }}>
                    ✅ תמונה נבחרה
                  </p>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setCapturedPhoto(null)}
                    style={{ marginTop: '0.5rem', padding: '0.5rem' }}
                  >
                    🗑️ הסר תמונה
                  </button>
                </div>
              )}
            </div>

            {/* Signature Section */}
            <div className="form-group">
              <label className="form-label">חתימת הלקוח</label>
              <div className="signature-container">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    width: 300,
                    height: 150,
                    className: 'signature-canvas',
                    style: { 
                      border: '1px solid var(--medium-gray)',
                      borderRadius: 'var(--border-radius)',
                      width: '100%',
                      height: '150px'
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => sigCanvas.current?.clear()}
                style={{ marginTop: '0.5rem' }}
              >
                🗑️ נקה חתימה
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'שומר...' : 'שמור דו״ח'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
              >
                בטל
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Work Reports List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">דוחות עבודה ({workReports.length})</h3>
        </div>
        
        {loading ? (
          <div className="loading">טוען...</div>
        ) : workReports.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dark-gray)' }}>
            אין דוחות עבודה
          </p>
        ) : (
          <div>
            {workReports.map((report) => (
              <div 
                key={report.id}
                style={{
                  border: '1px solid var(--light-gray)',
                  borderRadius: 'var(--border-radius)',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
                      {report.clientName}
                    </h4>
                    <p style={{ margin: '0.25rem 0', color: 'var(--dark-gray)' }}>
                      📍 {report.address}
                    </p>
                    <p style={{ margin: '0.5rem 0' }}>
                      {report.description}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--dark-gray)' }}>
                      📅 {new Date(report.createdAt).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {report.photo && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--success-color)' }}>
                        📷 תמונה
                      </span>
                    )}
                    {report.signature && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--success-color)' }}>
                        ✍️ חתימה
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkDocumentation