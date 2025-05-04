from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_user, logout_user
from app.models import User
from app.auth.forms import LoginForm, RegistrationForm

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.password == form.password.data:  # À hasher en prod!
            login_user(user)
            return redirect(url_for('main.home'))
    return render_template('auth/login.html', form=form)