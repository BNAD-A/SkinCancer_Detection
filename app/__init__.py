from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('../config.py') 

    db.init_app(app)
    migrate.init_app(app, db)

    from app.auth.routes import auth_bp
    from app.main.routes import main_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(main_bp)

    return app