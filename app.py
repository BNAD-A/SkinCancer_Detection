from flask import Flask, render_template, redirect, url_for, flash, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os

# Initialisation de l'application
app = Flask(__name__)
app.config['SECRET_KEY'] = 'votre_cle_secrete_difficile_a_deviner'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///skinia.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Initialisation de la base de données
db = SQLAlchemy(app)

# Configuration de Flask-Login
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Veuillez vous connecter pour accéder à cette page'
login_manager.login_message_category = 'warning'

# Modèle Utilisateur
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Fonction de chargement d'utilisateur pour Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = 'remember' in request.form
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user, remember=remember)
            next_page = request.args.get('next')
            flash('Connexion réussie!', 'success')
            return redirect(next_page if next_page else url_for('home'))
        else:
            flash('Nom d\'utilisateur ou mot de passe incorrect', 'danger')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            flash('Les mots de passe ne correspondent pas', 'danger')
            return render_template('register.html')
            
        if User.query.filter_by(username=username).first():
            flash('Ce nom d\'utilisateur existe déjà', 'danger')
            return render_template('register.html')
            
        if User.query.filter_by(email=email).first():
            flash('Cette adresse email est déjà utilisée', 'danger')
            return render_template('register.html')
            
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Votre compte a été créé avec succès! Vous pouvez maintenant vous connecter', 'success')
        return redirect(url_for('login'))
        
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Vous avez été déconnecté avec succès', 'info')
    return redirect(url_for('home'))

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')

@app.route('/history')
@login_required
def history():
    return render_template('historique.html')

@app.route('/analyze')
@login_required
def analyze():
    return render_template('analyze.html')

@app.route('/tips')
def conseils():
    return render_template('conseils.html')

@app.route('/aboutus')
def aboutus():
    return render_template('aboutus.html')

@app.route('/privacy')
def privacy_policy():
    return render_template('politique.html')

@app.route('/condition')
def condition():
    return render_template('condition.html')

@app.route('/disclaimer')
def disclaimer():
    return render_template('clause.html')


# Ajoutez cette nouvelle route à votre fichier app.py

@app.route('/find_dermatologist')
def find_dermatologist():
    return render_template('find_dermatologist.html')

# Modifiez également votre route contact existante pour ajouter un lien vers la nouvelle page
@app.route('/contact')
def contact():
    return render_template('contact.html')


# Création de la base de données si elle n'existe pas
def initialize_db():
    db_path = 'instance/skinia.db'
    if not os.path.exists(db_path):
        with app.app_context():
            db.create_all()
            print("Base de données créée avec succès!")
            
            # Créer un utilisateur de test (optionnel)
            if not User.query.filter_by(username='test').first():
                test_user = User(username='test', email='test@example.com')
                test_user.set_password('password')
                db.session.add(test_user)
                db.session.commit()
                print("Utilisateur de test créé avec succès!")

# Point d'entrée principal
if __name__ == '__main__':
    initialize_db()
    app.run(debug=True)