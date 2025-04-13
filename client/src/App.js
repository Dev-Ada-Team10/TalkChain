import React, { useState } from 'react';
import axios from 'axios';
import { useReactMediaRecorder } from 'react-media-recorder';
import { useEffect } from 'react';


const ChatMessage = ({ role, message }) => (
  <div style={{
    display: 'flex',
    justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
    padding: '5px 10px',
  }}>
    <div style={{
      maxWidth: '60%',
      padding: '10px',
      borderRadius: '15px',
      backgroundColor: role === 'user' ? '#DCF8C6' : '#E6E6E6',
      fontSize: '16px'
    }}>
      {message}
    </div>
  </div>
);

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Pacifico&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const {
    status,
    startRecording,
    stopRecording,
    clearBlobUrl
  } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      await handleUpload(blob);
    }
  });

  useEffect(() => {
    console.log('Recording status:', status);
  }, [status]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      clearBlobUrl();
      startRecording();
    } else {
      setIsRecording(false);
      stopRecording(); // onStop will handle the blob
    }
  };

  const handleUpload = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const res = await axios.post('/upload', formData);
      const data = res.data;

      const transcribed = data.transcribed || '[Your voice input]';
      setMessages(prev => [...prev, { role: 'user', message: transcribed }]);

      const res_feedback = await axios.post('/response', { answer: transcribed })
      const feedback_data = res_feedback.data
      const feedback = feedback_data.feedback || 'No feedback received.';

      // Sanitize feedback: keep letters, accents, punctuation
      const sanitized = feedback.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ .,!?'"¿¡\n\r]/g, '');

      // Wait for voices to load
      const loadVoices = () => new Promise(resolve => {
        const voices = speechSynthesis.getVoices();
        if (voices.length) return resolve(voices);
        speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
      });

      const voices = await loadVoices();
      const spanishVoice = voices.find(
        voice => voice.lang.startsWith("es") && voice.name.toLowerCase().includes("google")
      );

      // Create and configure utterance
      const utterance = new SpeechSynthesisUtterance(sanitized);
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      utterance.pitch = 1;
      utterance.rate = 1;

      // Clear queue and speak
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      
      setMessages(prev => [...prev, { role: 'assistant', message: feedback }]);
    } catch (err) {
      console.error('Upload error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        message: '❗ Error processing your audio.'
      }]);
    } finally {
      clearBlobUrl();
    }
  };

  return (
    <>
    <div style={{
      padding: '20px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center',
      fontFamily:"'Pacifico', cursive",
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#4CAF50',
      letterSpacing: '2px'
    }}>
      TalkChain 🎙️
    </div>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#F5F5F5'
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999' }}>
            Start speaking to begin chatting...
          </p>
        )}
        {messages.map((msg, index) => (
          <ChatMessage key={index} role={msg.role} message={msg.message} />
        ))}
      </div>

      <div style={{
        padding: '15px',
        borderTop: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}>
        <button
          onClick={toggleRecording}
          style={{
            backgroundColor: isRecording ? 'red' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            fontSize: '30px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            transition: '0.2s'
          }}
        >
          🎤
        </button>
      </div>
    </div>
    </>
  );
};

export default App;
