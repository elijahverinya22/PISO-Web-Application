import sqlite3
import os
from flask import Flask, request, jsonify, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, static_folder='.')
app.secret_key = 'super-secret-piso-key'
DB_FILE = 'piso.db'

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    # Create Users Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            income REAL DEFAULT 0.0
        )
    ''')
    # Create Debts Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS debts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            apr REAL NOT NULL,
            min_payment REAL NOT NULL,
            has_paid_min INTEGER DEFAULT 0,
            paid REAL DEFAULT 0.0,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    # Create Goals Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            cost REAL NOT NULL,
            value REAL NOT NULL,
            paid REAL DEFAULT 0.0,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB on startup
if not os.path.exists(DB_FILE):
    init_db()
else:
    init_db() # Ensure tables exist

# --- STATIC FILE ROUTES ---
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# --- API ROUTES ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    user = cursor.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    if user:
        conn.close()
        return jsonify({'error': 'User already exists'}), 409
        
    pwd_hash = generate_password_hash(password)
    cursor.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', (email, pwd_hash))
    conn.commit()
    
    user_id = cursor.lastrowid
    conn.close()
    
    session['user_id'] = user_id
    session['email'] = email
    
    return jsonify({'success': True, 'email': email})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    if user and check_password_hash(user['password_hash'], password):
        session['user_id'] = user['id']
        session['email'] = user['email']
        return jsonify({'success': True, 'email': user['email']})
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/state', methods=['GET'])
def get_state():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    user_id = session['user_id']
    conn = get_db_connection()
    
    user = conn.execute('SELECT email, income FROM users WHERE id = ?', (user_id,)).fetchone()
    debts = conn.execute('SELECT id, name, amount, apr, min_payment as minPayment, has_paid_min as hasPaidMin, paid FROM debts WHERE user_id = ?', (user_id,)).fetchall()
    goals = conn.execute('SELECT id, name, cost, value, paid FROM goals WHERE user_id = ?', (user_id,)).fetchall()
    
    conn.close()
    
    return jsonify({
        'user': user['email'],
        'income': user['income'],
        'debts': [{'id': d['id'], 'name': d['name'], 'amount': d['amount'], 'apr': d['apr'], 'minPayment': d['minPayment'], 'hasPaidMin': bool(d['hasPaidMin']), 'paid': d['paid']} for d in debts],
        'goals': [dict(g) for g in goals]
    })

@app.route('/api/state', methods=['POST'])
def save_state():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    user_id = session['user_id']
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Update income
    cursor.execute('UPDATE users SET income = ? WHERE id = ?', (data.get('income', 0), user_id))
    
    # Update debts (Simple approach: delete all and re-insert)
    cursor.execute('DELETE FROM debts WHERE user_id = ?', (user_id,))
    for d in data.get('debts', []):
        cursor.execute('''
            INSERT INTO debts (user_id, name, amount, apr, min_payment, has_paid_min, paid)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, d.get('name'), d.get('amount'), d.get('apr'), d.get('minPayment'), int(d.get('hasPaidMin', False)), d.get('paid', 0.0)))
        
    # Update goals
    cursor.execute('DELETE FROM goals WHERE user_id = ?', (user_id,))
    for g in data.get('goals', []):
        cursor.execute('''
            INSERT INTO goals (user_id, name, cost, value, paid)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, g.get('name'), g.get('cost'), g.get('value'), g.get('paid', 0.0)))
        
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    print("Starting PISO Backend Server on port 8080...")
    app.run(host='127.0.0.1', port=8080, debug=True)
