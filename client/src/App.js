import React, { useState, useEffect } from 'react'
import _ from 'lodash';

function App() {

  const [data, setData] = useState([{}])

  const [spanish_data, spanish_setData] = useState(null)

  const [question, setQuestion] = useState(null);

  const [inputAnswer, setInputAnswer] = useState('');

  const [feedback, setFeedback] = useState(null);

  // Handler to update the state as the user types
  const handleInputChange = (e) => {
    setInputAnswer(e.target.value);
  };

  const handleButtonClick = async () => {
    try {
      const response = await fetch("/generate-question", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setQuestion(data.question); // Store only the question
      } else {
        console.error("Failed to get question. Status:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handler to collect the string when the button is clicked
  const handleAnswerButtonClick = async () => {
    if (inputAnswer.trim() === '') {
      alert('Please enter something first!');
      return;
    }

    try {
      const response = await fetch(`/receive-answer?answer=${encodeURIComponent(inputAnswer)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Server response:', result);
        setFeedback(result.feedback);  // Store feedback in state
      } else {
        console.error('Failed to check answer. Status:', response.status);
        setFeedback('Failed to check answer. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setFeedback('An error occurred while checking the answer.');
    }

    setInputAnswer('');  // Clear input
  };
  


  // function to convert lesson plan json into presentable data
  const renderData = (data) => {

    // undefined parameter
    if (data === undefined || data === null) {
      return <span>No data available</span>;
    }

    // if data is an array, generate a list of all its contents
    if (_.isArray(data)) {
      return (
        <ul>
          {data.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    // if data is an object, treat it like a subheading and make a recursive call
    if (_.isObject(data)) {
      return (
        <ul>
          {_.map(data, (value, key) => (
            <li key={key}>
              <strong>{key}:</strong> {renderData(value)}
            </li>
          ))}
        </ul>
      );
    }

    // if data is primitive, return it
    return <span>{data}</span>;
  };

  return (
    <>
    <div>
      <button onClick={handleButtonClick}>Generate New Question</button>

      <div>
        {question ? (
          <div>
            <h3>Question:</h3>
            <p>question: {renderData(question)}</p>
          </div>
        ) : (
          <p>No question generated yet.</p>
        )}
      </div>
    </div>
    <div style={{ padding: '20px' }}>
      <h3>Enter Text Below:</h3>
      <input
        type="text"
        value={inputAnswer} // Bind input value to state
        onChange={handleInputChange} // Update state on change
        placeholder="Type your answer here"
        style={{ padding: '5px', marginRight: '10px' }}
      />
      <button onClick={handleAnswerButtonClick} style={{ padding: '5px 10px' }}>
        Check Answer
      </button>
    </div>
    
    {/* Display feedback */}
    {feedback && (
        <div style={{ padding: '20px' }}>
          <h3>Feedback:</h3>
          <p>{feedback}</p>
        </div>
      )}
    </>
  );
}

export default App