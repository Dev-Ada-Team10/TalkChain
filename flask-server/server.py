from flask import Flask, send_file, request, jsonify
import requests
from flask_cors import CORS
import os
import whisper
import ffmpeg

app = Flask(__name__)
CORS(app)  # Allow requests from React

# Global variable to store the latest question
latest_question = None
latest_answer_correction = None
answer = None

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Convert webm to wav
def convert_webm_to_wav():
    input_path = "uploads/recording.webm"
    output_path = "uploads/recording.wav"
    
    ffmpeg.input(input_path).output(output_path).run(overwrite_output=True)

# Transcribe using Whisper
def transcribe_audio():
    model = whisper.load_model("base")
    result = model.transcribe(r"uploads\recording.wav")
    return result['text']

# Applying the above two functions to /uploads
def transcribe_webm_folder():
            
        convert_webm_to_wav()
        text = transcribe_audio()
            
        return text

@app.route('/upload', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if audio_file:
        # Save the file
        filename = os.path.join(app.config['UPLOAD_FOLDER'], audio_file.filename)
        audio_file.save(filename)
        
        # Here you can process the audio file as needed
        # For example, convert it, transcribe it, etc.
        
        answer = transcribe_webm_folder()

        return jsonify({"transcribed": answer})
    
@app.route('/response', methods=['POST'])
def response_from_chatbot():
    
    print("checkpoint1")

    data = request.get_json()  # get json

    print("Received JSON:", data)
    
    answer = data.get("answer", "")  # extract answer

    print(answer)

    print("The user replied the following: ", answer)

    jupyter_url = 'http://localhost:5001/trigger-feedback'
    try:
        response = requests.post(
            jupyter_url,
            json={"answer": answer},
            headers={'Content-Type': 'application/json'}
        )
        feedback = response.json().get("feedback", "No feedback returned!")

        print("The chatbot replied the following: ", feedback)
        return jsonify({"transcribed": answer, "feedback": feedback})
    except Exception as e:
        print(f"Error contacting Jupyter server: {str(e)}")
        return jsonify({"error": f"Error contacting Jupyter server: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)