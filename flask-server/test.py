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