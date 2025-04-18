from flask import Flask, render_template, redirect, url_for, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
import pandas as pd
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'test_scenario_manager_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test_scenarios.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

# Models
class TestFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    test_count = db.Column(db.Integer, default=0)
    pass_rate = db.Column(db.Float, default=0)
    test_cases = db.relationship('TestCase', backref='test_file', lazy=True, cascade="all, delete-orphan")

class TestCase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.String(50), nullable=False)
    test_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    precondition = db.Column(db.Text)
    expected_result = db.Column(db.Text)
    actual_result = db.Column(db.Text)
    status = db.Column(db.String(20), default='Not Run')
    test_type = db.Column(db.String(50))
    priority = db.Column(db.String(20))
    test_level = db.Column(db.String(50))
    automated = db.Column(db.Boolean, default=False)
    requirement_id = db.Column(db.String(50))
    file_id = db.Column(db.Integer, db.ForeignKey('test_file.id'), nullable=False)

# Create tables
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    test_files = TestFile.query.order_by(TestFile.upload_date.desc()).all()
    return render_template('index.html', test_files=test_files)

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({"success": False, "message": "No file part"})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "message": "No selected file"})
        
        title = request.form.get('title', 'Untitled Test File')
        
        # Save file
        filename = str(uuid.uuid4()) + '.xlsx'
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Process Excel file using pandas
            df = pd.read_excel(file_path, engine='openpyxl')
            
            # Create test file record
            test_file = TestFile(
                name=title,
                filename=filename
            )
            db.session.add(test_file)
            db.session.commit()
            
            # Parse test cases
            total_cases = 0
            passed_cases = 0
            
            for _, row in df.iterrows():
                test_case = TestCase(
                    test_id=str(row.get('Test Case Id', f"TC{total_cases+1:03d}")),
                    test_name=str(row.get('Test Case Name', 'Unnamed Test')),
                    description=str(row.get('Description', '')),
                    precondition=str(row.get('Pre-condition', '')),
                    expected_result=str(row.get('Expected Results', '')),
                    actual_result=str(row.get('Actual Results', '')),
                    status=str(row.get('Pass/Fail', 'Not Run')),
                    test_type=str(row.get('Test Case Type', '')),
                    priority=str(row.get('Test Case Priority', 'Medium')),
                    test_level=str(row.get('Associated Test Level', '')),
                    automated=str(row.get('TC Automation', '')).lower() in ['yes', 'true', '1'],
                    requirement_id=str(row.get('Requirement Id', '')),
                    file_id=test_file.id
                )
                
                total_cases += 1
                if test_case.status.lower() in ['pass', 'passed']:
                    passed_cases += 1
                
                db.session.add(test_case)
            
            # Update test file stats
            pass_rate = (passed_cases / total_cases * 100) if total_cases > 0 else 0
            test_file.test_count = total_cases
            test_file.pass_rate = pass_rate
            db.session.commit()
            
            return jsonify({"success": True, "file_id": test_file.id})
            
        except Exception as e:
            return jsonify({"success": False, "message": str(e)})
    
    test_files = TestFile.query.order_by(TestFile.upload_date.desc()).all()
    return render_template('upload.html', test_files=test_files)

@app.route('/analytics/<int:file_id>')
def analytics(file_id):
    test_file = TestFile.query.get_or_404(file_id)
    test_cases = TestCase.query.filter_by(file_id=file_id).all()
    
    # Calculate stats
    total = len(test_cases)
    passed = sum(1 for case in test_cases if case.status.lower() in ['pass', 'passed'])
    failed = sum(1 for case in test_cases if case.status.lower() in ['fail', 'failed'])
    automated = sum(1 for case in test_cases if case.automated)
    
    # Group for charts
    test_types = {}
    priorities = {'High': 0, 'Medium': 0, 'Low': 0}
    
    for case in test_cases:
        if case.test_type not in test_types and case.test_type:
            test_types[case.test_type] = 0
        if case.test_type:
            test_types[case.test_type] += 1
        
        if case.priority in priorities:
            priorities[case.priority] += 1
    
    return render_template(
        'analytics.html', 
        test_file=test_file,
        test_cases=test_cases,
        stats={
            'total': total,
            'passed': passed,
            'failed': failed,
            'automation_rate': (automated / total * 100) if total > 0 else 0,
            'pass_rate': (passed / total * 100) if total > 0 else 0,
            'test_types': test_types,
            'priorities': priorities
        }
    )

@app.route('/api/delete_file/<int:file_id>', methods=['POST'])
def delete_file(file_id):
    test_file = TestFile.query.get_or_404(file_id)
    
    # Delete physical file
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], test_file.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass
    
    # Delete database record
    db.session.delete(test_file)
    db.session.commit()
    
    return jsonify({"success": True})

# Add to app.py
@app.route('/test_cases')
def test_cases():
    test_files = TestFile.query.order_by(TestFile.upload_date.desc()).all()
    test_cases = TestCase.query.join(TestFile).order_by(TestCase.test_id).all()
    
    # Calculate stats
    total = len(test_cases)
    passed = sum(1 for case in test_cases if case.status.lower() in ['pass', 'passed'])
    automated = sum(1 for case in test_cases if case.automated)
    
    return render_template(
        'test_cases.html',
        test_files=test_files,
        test_cases=test_cases,
        stats={
            'total': total,
            'passed': passed,
            'pass_rate': (passed / total * 100) if total > 0 else 0,
            'automation_rate': (automated / total * 100) if total > 0 else 0
        }
    )

@app.route('/analytics_dashboard', methods=['GET'])
def analytics_dashboard():
    # Get query parameters
    file_ids = request.args.getlist('file_ids', type=int)
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    # Default to all files if none selected
    if not file_ids:
        test_files = TestFile.query.order_by(TestFile.upload_date.desc()).all()
        file_ids = [file.id for file in test_files]
    else:
        test_files = TestFile.query.order_by(TestFile.upload_date.desc()).all()
    
    # Parse dates
    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d') if start_date_str else datetime.now() - timedelta(days=30)
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d') if end_date_str else datetime.now()
    except ValueError:
        start_date = datetime.now() - timedelta(days=30)
        end_date = datetime.now()
    
    # Get test cases from selected files
    test_cases = TestCase.query.join(TestFile).filter(
        TestFile.id.in_(file_ids),
        TestFile.upload_date.between(start_date, end_date)
    ).all()
    
    # Calculate stats
    total = len(test_cases)
    passed = sum(1 for case in test_cases if case.status.lower() in ['pass', 'passed'])
    failed = sum(1 for case in test_cases if case.status.lower() in ['fail', 'failed'])
    automated = sum(1 for case in test_cases if case.automated)
    
    # Group for charts
    test_types = {}
    priorities = {'High': 0, 'Medium': 0, 'Low': 0}
    
    for case in test_cases:
        if case.test_type and case.test_type not in test_types:
            test_types[case.test_type] = 0
        if case.test_type:
            test_types[case.test_type] += 1
        
        if case.priority in priorities:
            priorities[case.priority] += 1
    
    # Results by file
    file_results = []
    for file_id in file_ids:
        file = TestFile.query.get(file_id)
        if file:
            cases = [case for case in test_cases if case.file_id == file_id]
            file_passed = sum(1 for case in cases if case.status.lower() in ['pass', 'passed'])
            file_failed = sum(1 for case in cases if case.status.lower() in ['fail', 'failed'])
            
            file_results.append({
                'name': file.name,
                'total': len(cases),
                'passed': file_passed,
                'failed': file_failed,
                'not_run': len(cases) - file_passed - file_failed
            })
    
    return render_template(
        'analytics_dashboard.html',
        test_files=test_files,
        test_cases=test_cases,
        selected_files=file_ids,
        start_date=start_date.strftime('%Y-%m-%d'),
        end_date=end_date.strftime('%Y-%m-%d'),
        file_results=file_results,
        stats={
            'total': total,
            'passed': passed,
            'failed': failed,
            'automation_rate': (automated / total * 100) if total > 0 else 0,
            'pass_rate': (passed / total * 100) if total > 0 else 0,
            'test_types': test_types,
            'priorities': priorities
        }
    )

if __name__ == '__main__':
    app.run(debug=True)