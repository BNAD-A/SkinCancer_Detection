from werkzeug.utils import secure_filename
import os
from flask import current_app

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@main_bp.route('/analyze', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        flash('Aucun fichier sélectionné')
        return redirect(request.url)
    file = request.files['file']
    if file.filename == '':
        flash('Aucun fichier sélectionné')
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Simuler une réponse IA (à remplacer par l'appel au modèle CNN)
        return jsonify({
            'diagnosis': 'melanoma',
            'confidence': 0.92,
            'image_url': url_for('static', filename=f'uploads/{filename}')
        })