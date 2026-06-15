from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3, os

app = Flask(__name__)
app.secret_key = "wellnesshub-secret-key-change-me"
DB = os.path.join(os.path.dirname(__file__), "wellness.db")


def db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with db() as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )""")
        conn.commit()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        data = request.get_json() or request.form
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        if not username or not email or not password:
            return jsonify({"ok": False, "msg": "All fields required"}), 400
        try:
            with db() as conn:
                conn.execute(
                    "INSERT INTO users(username,email,password) VALUES(?,?,?)",
                    (username, email, generate_password_hash(password)),
                )
                conn.commit()
            return jsonify({"ok": True, "msg": "Registered Successfully"})
        except sqlite3.IntegrityError:
            return jsonify({"ok": False, "msg": "User already exists"}), 409
    return render_template("signup.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        data = request.get_json() or request.form
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        with db() as conn:
            user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if user and check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            return jsonify({"ok": True, "username": user["username"]})
        return jsonify({"ok": False, "msg": "Invalid Credentials"}), 401
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))


@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("dashboard.html", username=session["username"])


FEATURES = {
    "symptom-checker": "symptom_checker.html",
    "women-health": "women_health.html",
    "mood-tracker": "mood_tracker.html",
    "breathing": "breathing.html",
    "emergency": "emergency.html",
    "wellness": "wellness.html",
    "hospitals": "hospitals.html",
    "fitness": "fitness.html",
    "water": "water.html",
    "sleep": "sleep.html",
}


@app.route("/feature/<key>")
def feature(key):
    if "user_id" not in session:
        return redirect(url_for("login"))
    tpl = FEATURES.get(key)
    if not tpl:
        return redirect(url_for("dashboard"))
    return render_template(tpl, username=session["username"])


@app.route("/api/symptom", methods=["POST"])
def api_symptom():
    text = (request.get_json() or {}).get("symptom", "").lower()
    suggestions = {
        "fever": "Stay hydrated, rest well, take paracetamol if needed. Consult a doctor if fever lasts >3 days.",
        "cold": "Warm fluids, steam inhalation, vitamin C rich foods, and proper rest.",
        "cough": "Honey with warm water, ginger tea, avoid cold drinks. See a doctor if persistent.",
        "headache": "Hydrate, rest in a dark room, gentle neck stretches, limit screen time.",
        "stress": "Try deep breathing, 10 min walk, journaling, and reduce caffeine.",
        "anxiety": "Practice 4-7-8 breathing, grounding (5-4-3-2-1) technique, talk to a loved one.",
        "stomach": "Sip warm water, eat light bland food, avoid spicy meals. Seek help if severe.",
        "diabetes": "Monitor sugar regularly, low-carb diet, daily 30 min walk, stay hydrated.",
    }
    match = next((v for k, v in suggestions.items() if k in text), None)
    if not match:
        match = "General tip: rest, hydrate, eat balanced meals. Please consult a doctor for diagnosis."
    return jsonify({"ok": True, "suggestion": match})


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
