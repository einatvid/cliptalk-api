import React, { useState, useEffect, useRef } from 'react'
import VoiceInput from '../components/VoiceInput'
import axios from 'axios'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  
  const [newItem, setNewItem] = useState({
    name: '',
    serialNumber: '',
    status: 'חדש',
    quantity: 1
  })

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    filterInventory()
  }, [inventory, searchTerm, statusFilter])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/inventory')
      setInventory(response.data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterInventory = () => {
    let filtered = inventory

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    setFilteredInventory(filtered)
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/inventory', newItem)
      setInventory([...inventory, response.data])
      setNewItem({ name: '', serialNumber: '', status: 'חדש', quantity: 1 })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) {
      try {
        await axios.delete(`/api/inventory/${id}`)
        setInventory(inventory.filter(item => item.id !== id))
      } catch (error) {
        console.error('Error removing item:', error)
      }
    }
  }

  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase()
    if (lowerCommand.includes('הוסף') || lowerCommand.includes('add')) {
      setShowAddForm(true)
    } else if (lowerCommand.includes('הסר') || lowerCommand.includes('remove')) {
      // Could be enhanced to select item by voice
      alert('בחר פריט להסרה מהרשימה')
    }
  }

  const startCamera = async () => {
    setIsScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    }
    setIsScanning(false)
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        processImageForOCR(blob)
      })
    }
  }

  const processImageForOCR = async (imageBlob) => {
    try {
      // This would typically use Tesseract.js or send to a backend OCR service
      // For demo purposes, we'll simulate OCR
      const simulatedSerialNumber = `SN${Math.random().toString(36).substr(2, 8).toUpperCase()}`
      
      setNewItem({
        ...newItem,
        serialNumber: simulatedSerialNumber
      })
      
      stopCamera()
      setShowAddForm(true)
    } catch (error) {
      console.error('OCR Error:', error)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      processImageForOCR(file)
    }
  }

  const getInventorySummary = () => {
    const summary = {}
    inventory.forEach(item => {
      if (summary[item.name]) {
        summary[item.name] += item.quantity
      } else {
        summary[item.name] = item.quantity
      }
    })
    return Object.entries(summary)
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">ניהול מלאי</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              ➕ הוסף פריט
            </button>
            <button 
              className="btn btn-secondary"
              onClick={startCamera}
            >
              📷 סרוק ברקוד
            </button>
            <VoiceInput 
              onResult={handleVoiceCommand}
              placeholder="🎤"
            />
          </div>
        </div>

        {/* Inventory Summary */}
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>סיכום מלאי</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
            {getInventorySummary().map(([name, count]) => (
              <div key={name} className="stat-card" style={{ padding: '0.75rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{count}</div>
                <div style={{ fontSize: '0.8rem' }}>{name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            className="form-input filter-input"
            placeholder="חיפוש לפי שם או מספר סריאלי..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="all">כל הסטטוסים</option>
            <option value="חדש">חדש</option>
            <option value="פגום">פגום</option>
            <option value="מחודש">מחודש</option>
          </select>
        </div>
      </div>

      {/* Camera Scanner */}
      {isScanning && (
        <div className="card">
          <div className="camera-container">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              style={{ width: '100%', maxHeight: '300px' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn btn-success" onClick={captureImage}>
                📸 צלם
              </button>
              <button className="btn btn-danger" onClick={stopCamera}>
                ❌ בטל
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">הוספת פריט חדש</h3>
          </div>
          
          <form onSubmit={handleAddItem}>
            <div className="form-group">
              <label className="form-label">שם הפריט</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-input"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  required
                  placeholder="הזן שם הפריט"
                  style={{ flex: 1 }}
                />
                <VoiceInput 
                  onResult={(result) => setNewItem({...newItem, name: result})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">מספר סריאלי</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={newItem.serialNumber}
                  onChange={(e) => setNewItem({...newItem, serialNumber: e.target.value})}
                  required
                  placeholder="הזן מספר סריאלי"
                  style={{ flex: 1 }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">סטטוס</label>
              <select
                className="form-select"
                value={newItem.status}
                onChange={(e) => setNewItem({...newItem, status: e.target.value})}
              >
                <option value="חדש">חדש</option>
                <option value="פגום">פגום</option>
                <option value="מחודש">מחודש</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">כמות</label>
              <input
                type="number"
                className="form-input"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                min="1"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'מוסיף...' : 'הוסף פריט'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                בטל
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">רשימת מלאי ({filteredInventory.length} פריטים)</h3>
        </div>
        
        {loading ? (
          <div className="loading">טוען...</div>
        ) : filteredInventory.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dark-gray)' }}>
            לא נמצאו פריטים
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>מספר סריאלי</th>
                  <th>סטטוס</th>
                  <th>כמות</th>
                  <th>תאריך הוספה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.serialNumber}</td>
                    <td>
                      <span 
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          backgroundColor: 
                            item.status === 'חדש' ? '#d4edda' :
                            item.status === 'פגום' ? '#f8d7da' : '#fff3cd',
                          color:
                            item.status === 'חדש' ? '#155724' :
                            item.status === 'פגום' ? '#721c24' : '#856404'
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString('he-IL')}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventory