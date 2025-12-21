from flask import Flask, render_template, request, redirect, url_for, flash
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = "your-secret-key"

# ---------- File Path ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MESSAGES_FILE = os.path.join(BASE_DIR, "messages.json")


# ---------- Helpers ----------
def load_messages():
    if not os.path.exists(MESSAGES_FILE):
        # Create empty file if not exists
        with open(MESSAGES_FILE, "w") as f:
            json.dump([], f)
        return []

    with open(MESSAGES_FILE, "r") as f:
        return json.load(f)


def save_message(email, message):
    messages = load_messages()

    messages.append({
        "email": email,
        "message": message,
        "timestamp": datetime.now().isoformat()
    })

    with open(MESSAGES_FILE, "w") as f:
        json.dump(messages, f, indent=2)


# ---------- Routes ----------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/send-message", methods=["POST"])
def send_message():
    email = request.form.get("email")
    message = request.form.get("message")

    if not email or not message:
        flash("Please fill all fields!", "error")
        return redirect(url_for("index") + "#contact")

    save_message(email, message)
    flash("Message sent successfully!", "success")

    return redirect(url_for("index") + "#contact")


@app.route("/admin/messages")
def view_messages():
    messages = load_messages()
    return render_template("admin/messages.html", messages=messages)


@app.route("/projects/<project_name>")
def project_detail(project_name):
    try:
        return render_template(f"projects/{project_name}.html")
    except:
        return "Project not found", 404
@app.route("/admin/delete-message/<int:index>", methods=["POST"])
def delete_message(index):
    messages = load_messages()

    if 0 <= index < len(messages):
        messages.pop(index)

        with open(MESSAGES_FILE, "w") as f:
            json.dump(messages, f, indent=2)

    return redirect(url_for("view_messages"))


# ---------- Run ----------
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
