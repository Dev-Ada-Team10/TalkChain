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
            
        print(text)

@app.route("/languages")
def languages():
    return {"languages": ["English", "Spanish", "Dutch"]}

@app.route("/spanish")
def spanish():
    return send_file('spanish.json', as_attachment=True, mimetype='application/json')

# Endpoint to receive the question from Jupyter
@app.route('/send_string', methods=['POST'])
def receive_string():
    global latest_question
    latest_question = request.json  # Expect JSON with question
    return jsonify({'message': 'Question received'})

# Endpoint to trigger question generation and return the latest question
@app.route("/generate-question", methods=['GET'])
def generate_question():
    global latest_question
    # Trigger Jupyter to generate a new question
    jupyter_url = 'http://localhost:5001/trigger-question'
    try:
        requests.post(jupyter_url)
    except Exception as e:
        print(f"Error triggering Jupyter: {e}")

    # Return the latest question (may take a moment to update)
    if latest_question:
        return jsonify(latest_question)
    return jsonify({"question": "No question yet"})

@app.route('/receive-answer', methods=['GET'])
def receive_answer():
    global answer
    global latest_answer_correction
    answer = request.args.get('answer', '')
    print(f"Received answer (GET): {answer}")
    if not answer:
        return jsonify({"error": "No answer provided"}), 400
    if not latest_question:
        return jsonify({"error": "No question available to check against"}), 400
    
    jupyter_url = 'http://localhost:5001/trigger-feedback'
    try:
        response = requests.post(
            jupyter_url,
            json={"answer": answer},
            headers={'Content-Type': 'application/json'}
        )
        if latest_answer_correction:
            return jsonify(latest_answer_correction)
        return jsonify({"feedback": "No feedback yet"})
        print(f"Jupyter response status: {response.status_code}")
    except Exception as e:
        print(f"Error contacting Jupyter server: {str(e)}")
        return jsonify({"error": f"Error contacting Jupyter server: {str(e)}"}), 500

@app.route('/send_answer', methods=['POST'])
def send_answer():
    global latest_answer_correction
    latest_answer_correction = request.json  # Expect JSON with question
    return jsonify({'message': 'Question received'})

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
        
        transcribe_webm_folder()

        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'size': os.path.getsize(filename)
        }), 200

if __name__ == "__main__":
    app.run(debug=True)