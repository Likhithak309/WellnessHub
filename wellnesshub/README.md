# WellnessHub — Smart Healthcare Assistant

AI-powered preventive healthcare and wellness platform.
Built with Python Flask + SQLite + vanilla HTML/CSS/JS (glassmorphism pastel UI).

## Project Structure
```
wellnesshub/
├── app.py                  # Flask backend + API + auth
├── requirements.txt
├── sanjeevani.db           # SQLite (auto-created)
├── static/
│   ├── css/style.css       # Pastel theme + glassmorphism
│   └── js/main.js          # Frontend interactions
└── templates/
    ├── base.html
    ├── index.html          # Hero / landing
    ├── signup.html
    ├── login.html
    ├── dashboard.html      # 10 feature cards
    ├── symptom_checker.html
    ├── women_health.html
    ├── mood_tracker.html
    ├── breathing.html
    ├── emergency.html
    ├── wellness.html
    ├── hospitals.html
    ├── fitness.html
    ├── water.html
    └── sleep.html
```

## Run Locally
```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Open http://localhost:5000

## Features
1. AI Symptom Checker — keyword-driven suggestions (Fever, Cold, Cough, Headache, Stress, Anxiety, Stomach Pain, Diabetes)
2. Women Health & Wellness
3. Mood Tracker (Happy/Sad/Angry/Calm/Stressed)
4. Breathing Exercises (animated circle, inhale/exhale timer)
5. Emergency Guidance (CPR, first aid, helplines)
6. Daily Wellness
7. Nearby Hospitals (uses geolocation)
8. Fitness Tips (workouts, BMI)
9. Water Reminder (progress bar + localStorage)
10. Sleep Monitor (stats + tips)

## Security
- Passwords hashed with Werkzeug PBKDF2 (`generate_password_hash` / `check_password_hash`)
- Session-based auth
- Change `app.secret_key` in `app.py` before deploying
