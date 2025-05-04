import os

SECRET_KEY = os.getenv('SECRET_KEY', 'dev_key_par_defaut')
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(os.path.dirname(__file__), 'app.db')
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'app/static/uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}