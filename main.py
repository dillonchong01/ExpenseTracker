from app import app, db
import models
import expense_service
import routes

with app.app_context():
    db.create_all()
