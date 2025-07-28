import React, { useState, useEffect } from 'react'

const VoiceInput = ({ onResult, placeholder = "🎤" }) => {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.lang = 'he-IL'
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        onResult(transcript)
        setIsListening(false)
      }
      
      recognitionInstance.onerror = () => {
        setIsListening(false)
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    }
  }, [onResult])

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true)
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }

  if (!recognition) {
    return null // Speech recognition not supported
  }

  return (
    <button
      type="button"
      className={`voice-btn ${isListening ? 'listening' : ''}`}
      onClick={isListening ? stopListening : startListening}
      title={isListening ? 'לחץ להפסקת הקלטה' : 'לחץ להקלטה קולית'}
      style={{
        backgroundColor: isListening ? '#e74c3c' : '#f39c12',
        animation: isListening ? 'pulse 1s infinite' : 'none'
      }}
    >
      {isListening ? '⏹️' : '🎤'}
    </button>
  )
}

export default VoiceInput