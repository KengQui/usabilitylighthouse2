import os
from flask import Flask, render_template, send_from_directory, jsonify
from database import db
from datetime import datetime, date

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-for-payroll-assistant")

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.route('/<path:filename>')
def serve_js_css(filename):
    return send_from_directory('.', filename)

@app.route('/api/database/status')
def database_status():
    """Check database connection and table status"""
    try:
        from models import PayrollSchedule, EarningCode, Employee, PayrollRun, ChatHistory
        
        # Count records in each table
        schedule_count = PayrollSchedule.query.count()
        earning_count = EarningCode.query.count()
        employee_count = Employee.query.count()
        payroll_count = PayrollRun.query.count()
        chat_count = ChatHistory.query.count()
        
        return jsonify({
            'status': 'connected',
            'tables': {
                'payroll_schedules': schedule_count,
                'earning_codes': earning_count,
                'employees': employee_count,
                'payroll_runs': payroll_count,
                'chat_history': chat_count
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/database/seed')
def seed_database():
    """Add sample data to the database"""
    try:
        from models import PayrollSchedule, EarningCode, Employee, PayrollRun, ChatHistory
        
        # Create sample payroll schedules
        if PayrollSchedule.query.count() == 0:
            schedules = [
                PayrollSchedule(
                    name='Weekly Production',
                    frequency='Weekly',
                    pay_date=date(2025, 8, 8),
                    pay_period_start=date(2025, 8, 1),
                    pay_period_end=date(2025, 8, 7)
                ),
                PayrollSchedule(
                    name='Bi-weekly Office',
                    frequency='Bi-weekly',
                    pay_date=date(2025, 8, 15),
                    pay_period_start=date(2025, 8, 1),
                    pay_period_end=date(2025, 8, 14)
                )
            ]
            for schedule in schedules:
                db.session.add(schedule)
        
        # Create sample earning codes
        if EarningCode.query.count() == 0:
            earning_codes = [
                EarningCode(
                    code='REG',
                    description='Regular Hours',
                    rate_type='hourly',
                    rate=25.00,
                    multiplier=1.0
                ),
                EarningCode(
                    code='OT',
                    description='Overtime Hours',
                    rate_type='hourly',
                    rate=37.50,
                    is_overtime=True,
                    multiplier=1.5
                ),
                EarningCode(
                    code='SAL',
                    description='Salary',
                    rate_type='salary',
                    rate=75000.00,
                    multiplier=1.0
                )
            ]
            for code in earning_codes:
                db.session.add(code)
        
        # Create sample employees
        if Employee.query.count() == 0:
            employees = [
                Employee(
                    employee_id='EMP001',
                    first_name='John',
                    last_name='Smith',
                    email='john.smith@company.com',
                    hire_date=date(2024, 1, 15),
                    department='Production',
                    position='Production Worker',
                    pay_rate=25.00,
                    schedule_id=1
                ),
                Employee(
                    employee_id='EMP002',
                    first_name='Sarah',
                    last_name='Johnson',
                    email='sarah.johnson@company.com',
                    hire_date=date(2024, 3, 1),
                    department='Administration',
                    position='Office Manager',
                    pay_rate=75000.00,
                    schedule_id=2
                )
            ]
            for employee in employees:
                db.session.add(employee)
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Sample data added successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

with app.app_context():
    # Import models to ensure they are registered with SQLAlchemy
    from models import PayrollSchedule, EarningCode, Employee, PayrollRun, ChatHistory
    # Create all database tables
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
