from flask import Flask, send_file

app = Flask(__name__)

@app.route("/languages")
def languages():
    return {"languages": ["English", "Spanish", "Dutch"]}

@app.route("/spanish")
def spanish():
    return send_file('spanish.json', as_attachment=True, mimetype='application/json')

if __name__ == "__main__":
    app.run(debug=True)