from flask import render_template, request, redirect, url_for, flash, jsonify
from app import app
from expense_service import expense_service
import logging

@app.route('/')
def index():
    recent_expenses = expense_service.get_expenses(limit=5)
    monthly_summary = expense_service.get_summary("monthly")
    
    return render_template('index.html', 
                           recent_expenses=recent_expenses,
                           monthly_summary=monthly_summary)

@app.route('/add', methods=['GET', 'POST'])
def add_expense():
    if request.method == 'POST':
        try:
            amount = float(request.form.get('amount', 0))
            description = request.form.get('description', '').strip()
            category = request.form.get('category', '').strip()
            
            if amount <= 0:
                flash('Please enter a valid amount', 'error')
                return redirect(url_for('add_expense'))
            
            if not description:
                flash('Please enter a description', 'error')
                return redirect(url_for('add_expense'))
            
            expense = expense_service.add_expense(amount, description, category if category else None)
            
            flash(f'Expense added successfully! Categorized as: {expense.category}', 'success')
            return redirect(url_for('index'))
            
        except ValueError:
            flash('Please enter a valid amount', 'error')
            return redirect(url_for('add_expense'))
        except Exception as e:
            logging.error(f"Error adding expense: {e}")
            flash('An error occurred while adding the expense', 'error')
            return redirect(url_for('add_expense'))
    
    categories = expense_service.get_categories()
    return render_template('add_expense.html', categories=categories)

@app.route('/expenses')
def expenses():
    search_query = request.args.get('search', '').strip()
    category_filter = request.args.get('category', '').strip()
    
    if search_query:
        expenses_list = expense_service.search_expenses(search_query)
    else:
        expenses_list = expense_service.get_expenses()
    
    if category_filter and category_filter != 'all':
        expenses_list = [exp for exp in expenses_list if exp.category == category_filter]
    
    categories = expense_service.get_categories()
    
    return render_template('expenses.html', 
                           expenses=expenses_list,
                           categories=categories,
                           search_query=search_query,
                           category_filter=category_filter)

@app.route('/summary')
def summary():
    period = request.args.get('period', 'monthly')
    if period not in ['weekly', 'monthly', 'yearly']:
        period = 'monthly'
    
    summary_data = expense_service.get_summary(period)
    
    return render_template('summary.html', 
                           summary=summary_data,
                           period=period)

@app.route('/expense/<int:expense_id>/edit', methods=['POST'])
def edit_expense(expense_id):
    try:
        amount = float(request.form.get('amount', 0))
        description = request.form.get('description', '').strip()
        category = request.form.get('category', '').strip()
        
        if amount <= 0 or not description:
            flash('Please provide valid amount and description', 'error')
            return redirect(url_for('expenses'))
        
        success = expense_service.update_expense(expense_id, amount, description, category)
        
        if success:
            flash('Expense updated successfully', 'success')
        else:
            flash('Expense not found', 'error')
    except ValueError:
        flash('Please enter a valid amount', 'error')
    except Exception as e:
        logging.error(f"Error updating expense: {e}")
        flash('An error occurred while updating the expense', 'error')
    
    return redirect(url_for('expenses'))

@app.route('/expense/<int:expense_id>/delete', methods=['POST'])
def delete_expense(expense_id):
    try:
        success = expense_service.delete_expense(expense_id)
        if success:
            flash('Expense deleted successfully', 'success')
        else:
            flash('Expense not found', 'error')
    except Exception as e:
        logging.error(f"Error deleting expense: {e}")
        flash('An error occurred while deleting the expense', 'error')
    
    return redirect(url_for('expenses'))

@app.route('/api/suggest-category')
def suggest_category():
    description = request.args.get('description', '').strip()
    
    if not description:
        return jsonify({'category': 'Other'})
    
    suggested_category = expense_service.suggest_category(description)
    return jsonify({'category': suggested_category})

@app.route('/api/chart-data/<period>')
def chart_data(period):
    if period not in ['weekly', 'monthly', 'yearly']:
        period = 'monthly'
    
    summary_data = expense_service.get_summary(period)
    
    categories = list(summary_data['categories'].keys())
    amounts = [summary_data['categories'][cat]['amount'] for cat in categories]
    
    chart_data = {
        'labels': categories,
        'datasets': [{
            'data': amounts,
            'backgroundColor': [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                '#4BC0C0', '#FF6384', '#36A2EB'
            ][:len(categories)]
        }]
    }
    
    return jsonify(chart_data)

@app.errorhandler(404)
def not_found(error):
    return render_template('base.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('base.html'), 500