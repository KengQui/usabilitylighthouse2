from datetime import datetime
from database import db

class PayrollSchedule(db.Model):
    __tablename__ = 'payroll_schedules'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.String(50), nullable=False)  # Weekly, Bi-weekly, Monthly, etc.
    pay_date = db.Column(db.Date, nullable=False)
    pay_period_start = db.Column(db.Date, nullable=False)
    pay_period_end = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'frequency': self.frequency,
            'pay_date': self.pay_date.isoformat() if self.pay_date else None,
            'pay_period_start': self.pay_period_start.isoformat() if self.pay_period_start else None,
            'pay_period_end': self.pay_period_end.isoformat() if self.pay_period_end else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class EarningCode(db.Model):
    __tablename__ = 'earning_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    rate_type = db.Column(db.String(20), nullable=False)  # hourly, salary, overtime, etc.
    rate = db.Column(db.Numeric(10, 2), nullable=True)
    is_overtime = db.Column(db.Boolean, default=False)
    multiplier = db.Column(db.Numeric(4, 2), default=1.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'description': self.description,
            'rate_type': self.rate_type,
            'rate': float(self.rate) if self.rate else None,
            'is_overtime': self.is_overtime,
            'multiplier': float(self.multiplier) if self.multiplier else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Employee(db.Model):
    __tablename__ = 'employees'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    hire_date = db.Column(db.Date, nullable=False)
    department = db.Column(db.String(100))
    position = db.Column(db.String(100))
    pay_rate = db.Column(db.Numeric(10, 2), nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('payroll_schedules.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    schedule = db.relationship('PayrollSchedule', backref='employees')
    
    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'department': self.department,
            'position': self.position,
            'pay_rate': float(self.pay_rate) if self.pay_rate else None,
            'schedule_id': self.schedule_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class PayrollRun(db.Model):
    __tablename__ = 'payroll_runs'
    
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('payroll_schedules.id'), nullable=False)
    pay_period_start = db.Column(db.Date, nullable=False)
    pay_period_end = db.Column(db.Date, nullable=False)
    pay_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='draft')  # draft, processed, approved, paid
    total_gross = db.Column(db.Numeric(12, 2), default=0)
    total_net = db.Column(db.Numeric(12, 2), default=0)
    employee_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    schedule = db.relationship('PayrollSchedule', backref='payroll_runs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'schedule_id': self.schedule_id,
            'pay_period_start': self.pay_period_start.isoformat() if self.pay_period_start else None,
            'pay_period_end': self.pay_period_end.isoformat() if self.pay_period_end else None,
            'pay_date': self.pay_date.isoformat() if self.pay_date else None,
            'status': self.status,
            'total_gross': float(self.total_gross) if self.total_gross else None,
            'total_net': float(self.total_net) if self.total_net else None,
            'employee_count': self.employee_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False)
    message_type = db.Column(db.String(10), nullable=False)  # 'user' or 'ai'
    message_content = db.Column(db.Text, nullable=False)
    workflow_step = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'message_type': self.message_type,
            'message_content': self.message_content,
            'workflow_step': self.workflow_step,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }