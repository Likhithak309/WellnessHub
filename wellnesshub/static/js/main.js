// WellnessHub - shared JS

async function postJSON(url, body) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: r.status, data: await r.json() };
}

function showModal(title, text) {
    let bg = document.getElementById('modal-bg');
    if (!bg) {
        bg = document.createElement('div');
        bg.id = 'modal-bg';
        bg.className = 'modal-bg';
        bg.innerHTML = `<div class="modal glass"><h3 id="m-t"></h3><p id="m-p"></p><button class="btn" onclick="document.getElementById('modal-bg').classList.remove('show')">OK</button></div>`;
        document.body.appendChild(bg);
    }
    bg.querySelector('#m-t').textContent = title;
    bg.querySelector('#m-p').textContent = text;
    bg.classList.add('show');
}

// SIGNUP
function bindSignup() {
    const f = document.getElementById('signup-form');
    if (!f) return;
    const msg = document.getElementById('auth-msg');
    f.addEventListener('submit', async(e) => {
        e.preventDefault();
        msg.textContent = '';
        msg.className = 'auth-msg';
        const body = {
            username: f.username.value.trim(),
            email: f.email.value.trim(),
            password: f.password.value
        };
        const { status, data } = await postJSON('/signup', body);
        if (status === 200 && data.ok) {
            msg.textContent = 'Registered Successfully';
            msg.className = 'auth-msg ok';
            f.reset();
        } else {
            msg.textContent = data.msg || 'Registration failed';
            msg.className = 'auth-msg err';
        }
    });
}

// LOGIN
function bindLogin() {
    const f = document.getElementById('login-form');
    if (!f) return;
    const msg = document.getElementById('auth-msg');
    f.addEventListener('submit', async(e) => {
        e.preventDefault();
        msg.textContent = '';
        msg.className = 'auth-msg';
        const body = { email: f.email.value.trim(), password: f.password.value };
        const { status, data } = await postJSON('/login', body);
        if (status === 200 && data.ok) {
            showModal('Welcome ' + data.username, 'You have been logged in successfully.');
            setTimeout(() => { window.location.href = '/dashboard'; }, 1200);
        } else {
            msg.textContent = 'Invalid Credentials';
            msg.className = 'auth-msg err';
        }
    });
}

// SYMPTOM CHECKER
function bindSymptom() {
    const btn = document.getElementById('analyze-btn');
    if (!btn) return;
    btn.addEventListener('click', async() => {
        const v = document.getElementById('symptom-input').value.trim();
        if (!v) return;
        const { data } = await postJSON('/api/symptom', { symptom: v });
        const r = document.getElementById('symptom-result');
        r.className = 'result glass';
        r.innerHTML = `<h3>Suggestion</h3><p style="margin-top:8px;color:#3d527a">${data.suggestion}</p>`;
    });
    document.querySelectorAll('[data-quick]').forEach(t => {
        t.addEventListener('click', () => {
            document.getElementById('symptom-input').value = t.dataset.quick;
            document.getElementById('analyze-btn').click();
        });
    });
}

// MOOD
const MOODS = {
    Happy: 'Keep the positivity flowing! Share your joy with someone today.',
    Sad: 'Gentle walk, journaling, and talking to a friend can help lift the mood.',
    Angry: 'Try 4-7-8 breathing, hydrate, and step away for 5 minutes.',
    Calm: 'Beautiful. Try a short meditation to extend this calm state.',
    Stressed: 'Box breathing 4x4, light stretching, and a warm cup of tea help reset.'
};

function bindMood() {
    const tags = document.querySelectorAll('[data-mood]');
    if (!tags.length) return;
    tags.forEach(t => t.addEventListener('click', () => {
        tags.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        const m = t.dataset.mood;
        document.getElementById('mood-result').innerHTML =
            `<h3>${m}</h3><p style="margin-top:8px;color:#3d527a">${MOODS[m]}</p>`;
        document.getElementById('mood-result').className = 'result glass';
    }));
}

// BREATHING
function bindBreath() {
    const btn = document.getElementById('breath-start');
    if (!btn) return;
    const c = document.getElementById('breath-circle');
    const label = document.getElementById('breath-label');
    let running = false,
        t;
    btn.addEventListener('click', () => {
        running = !running;
        btn.textContent = running ? 'Stop Session' : 'Start Session';
        if (!running) {
            clearInterval(t);
            c.className = 'breath-circle';
            label.textContent = 'Ready';
            return;
        }
        let phase = 0;
        const cycle = () => {
            if (phase % 2 === 0) {
                c.className = 'breath-circle in';
                label.textContent = 'Inhale...';
            } else {
                c.className = 'breath-circle out';
                label.textContent = 'Exhale...';
            }
            phase++;
        };
        cycle();
        t = setInterval(cycle, 4000);
    });
}

// WATER
function bindWater() {
    const btn = document.getElementById('water-btn');
    if (!btn) return;
    const bar = document.getElementById('water-bar');
    const count = document.getElementById('water-count');
    const goal = 8;
    let n = parseInt(localStorage.getItem('water') || '0', 10);
    const render = () => {
        bar.style.width = Math.min(100, (n / goal) * 100) + '%';
        count.textContent = `${n} / ${goal} glasses`;
    };
    render();
    btn.addEventListener('click', () => {
        if (n < goal) {
            n++;
            localStorage.setItem('water', n);
            render();
            if (n === goal) showModal('Goal Reached', 'Great job staying hydrated today!');
        }
    });
    document.getElementById('water-reset') ? .addEventListener('click', () => {
        n = 0;
        localStorage.setItem('water', 0);
        render();
    });
}

// HOSPITALS
function bindHospitals() {
    const btn = document.getElementById('locate-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const out = document.getElementById('loc-out');
        out.textContent = 'Detecting location...';
        if (!navigator.geolocation) { out.textContent = 'Geolocation not supported'; return; }
        navigator.geolocation.getCurrentPosition(
            p => { out.textContent = `Location: ${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)} — showing nearby hospitals.`; },
            () => { out.textContent = 'Permission denied. Showing general listings.'; }
        );
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindSignup();
    bindLogin();
    bindSymptom();
    bindMood();
    bindBreath();
    bindWater();
    bindHospitals();
});
