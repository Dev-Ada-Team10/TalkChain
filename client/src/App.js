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
      const feedback = data.feedback || 'No feedback received.';

      setMessages(prev => [...prev, { role: 'user', message: transcribed }]);
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
  );
};

export default App;
