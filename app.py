from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
from utils import predict_image

app = Flask(__name__)
app.config['SECRET_KEY'] = 'votre_cle_secrete_difficile_a_deviner'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///skinia.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Veuillez vous connecter pour accéder à cette page'
login_manager.login_message_category = 'warning'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_name = db.Column(db.String(255), nullable=False)
    prediction = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    date = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('predictions', lazy=True))

# ✅ Corrigée : Ajout du champ location
def insert_prediction_sqlalchemy(image_name, prediction, confidence, explanation, date, location, user_id):
    new_pred = Prediction(
        image_name=image_name,
        prediction=prediction,
        confidence=confidence,
        explanation=explanation,
        date=date,
        location=location,
        user_id=user_id
    )
    db.session.add(new_pred)
    db.session.commit()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

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
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        if password != confirm_password:
            flash('Les mots de passe ne correspondent pas', 'danger')
            return render_template('register.html')

        if User.query.filter_by(username=username).first():
            flash('Ce nom d\'utilisateur existe déjà', 'danger')
            return render_template('register.html')

        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        login_user(user)
        flash("Bienvenue sur SKINIA ! Votre compte a été créé avec succès, vous êtes maintenant connecté.", "success")
        return redirect(url_for('home'))

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

# ✅ Corrigée : filtrer seulement les prédictions avec une location valide
@app.route('/myhistory')
@login_required
def myhistory():
    predictions = Prediction.query.filter_by(user_id=current_user.id).order_by(Prediction.id.desc()).all()
    data = []
    for p in predictions:
        if not p.location:
            continue  # ne pas inclure les prédictions sans localisation
        # Dans la route /myhistory
        data.append({
            'id': p.id,  # ✅ AJOUT
            'image': p.image_name,
            'diagnostic': p.prediction,
            'confiance': f"{p.confidence:.2f}%",
            'explication': p.explanation,
            'date': p.date,
            'location': p.location
        })

    return jsonify(data)

@app.route('/history')
@login_required
def history():
    return render_template('historique.html')

@app.route('/analyze', methods=['GET'])
@login_required
def show_analyze_page():
    return render_template('analyze.html')

@app.route('/analyze', methods=['POST'])
@login_required
def handle_analysis():
    if 'image' not in request.files:
        return jsonify({"error": "Aucune image reçue"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Fichier vide"}), 400

    location = request.form.get('location', 'inconnue')

    image_path = os.path.join('static/uploads', file.filename)
    file.save(image_path)

    result = predict_image(image_path)
    result["location"] = location
    return jsonify(result)

@app.route('/save-result', methods=['POST'])
@login_required
def save_result():
    data = request.json
    new_pred = Prediction(
        image_name=data['image_name'],
        prediction=data['diagnostic'],
        confidence=float(data['confiance'].replace('%', '')),
        explanation=data['explication'],
        date=data['date'],
        location=data['location'],
        user_id=current_user.id
    )
    db.session.add(new_pred)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/delete-prediction/<int:prediction_id>', methods=['DELETE'])
@login_required
def delete_prediction(prediction_id):
    prediction = Prediction.query.get_or_404(prediction_id)

    if prediction.user_id != current_user.id:
        return jsonify({'error': 'Accès refusé'}), 403

    db.session.delete(prediction)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Prédiction supprimée avec succès'})

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

@app.route('/find_dermatologist')
def find_dermatologist():
    return render_template('find_dermatologist.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

def initialize_db():
    db_path = 'instance/skinia.db'
    if not os.path.exists(db_path):
        with app.app_context():
            db.create_all()
            print("Base de données créée avec succès!")
            if not User.query.filter_by(username='test').first():
                test_user = User(username='test')
                test_user.set_password('password')
                db.session.add(test_user)
                db.session.commit()
                print("Utilisateur de test créé avec succès!")

if __name__ == '__main__':
    initialize_db()
    app.run(debug=True)
