from datetime import datetime, timedelta
from typing import List, Dict, Optional
from collections import defaultdict
from models import Expense, CategoryRule
from app import db
from sqlalchemy import or_

class ExpenseService:
    def __init__(self):
        self.default_categories = [
            "Food & Dining", "Transportation", "Shopping", "Entertainment",
            "Bills & Utilities", "Healthcare", "Travel", "Education",
            "Groceries", "Gas", "Other"
        ]
    
    def add_expense(self, amount: float, description: str, category: str = None) -> Expense:
        if not category:
            category = self.suggest_category(description)
        
        expense = Expense(
            amount=amount,
            description=description,
            category=category,
            date=datetime.utcnow()
        )
        db.session.add(expense)
        db.session.commit()
        
        self._learn_category_rule(description, category)
        
        return expense
    
    def get_expenses(self, limit: int = None) -> List[Expense]:
        query = Expense.query.order_by(Expense.date.desc())
        if limit:
            query = query.limit(limit)
        return query.all()
    
    def get_expense_by_id(self, expense_id: int) -> Optional[Expense]:
        return Expense.query.get(expense_id)
    
    def update_expense(self, expense_id: int, amount: float = None, 
                       description: str = None, category: str = None) -> bool:
        expense = self.get_expense_by_id(expense_id)
        if not expense:
            return False
        
        if amount is not None:
            expense.amount = amount
        if description is not None:
            expense.description = description
        if category is not None:
            expense.category = category
            self._learn_category_rule(expense.description, category)
        
        db.session.commit()
        return True
    
    def delete_expense(self, expense_id: int) -> bool:
        expense = self.get_expense_by_id(expense_id)
        if expense:
            db.session.delete(expense)
            db.session.commit()
            return True
        return False
    
    def suggest_category(self, description: str) -> str:
        description_lower = description.lower()
        rules = CategoryRule.query.all()
        best_match = None
        best_confidence = 0
        
        for rule in rules:
            if rule.keyword in description_lower:
                if rule.confidence > best_confidence:
                    best_match = rule.category
                    best_confidence = rule.confidence
        
        if best_match:
            return best_match
        
        category_keywords = {
            "Food & Dining": ["restaurant", "food", "lunch", "dinner", "breakfast", "cafe", "pizza", "burger"],
            "Transportation": ["uber", "taxi", "bus", "train", "gas", "fuel", "parking"],
            "Shopping": ["store", "mall", "amazon", "shop", "buy", "purchase"],
            "Entertainment": ["movie", "cinema", "game", "music", "concert", "theater"],
            "Bills & Utilities": ["electric", "water", "phone", "internet", "bill", "utility"],
            "Healthcare": ["doctor", "hospital", "pharmacy", "medicine", "health"],
            "Groceries": ["grocery", "supermarket", "market", "produce"],
            "Travel": ["hotel", "flight", "vacation", "trip", "airbnb"]
        }
        
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                if keyword in description_lower:
                    return category
        
        return "Other"
    
    def _learn_category_rule(self, description: str, category: str):
        words = [word.strip().lower() for word in description.split() 
                 if len(word.strip()) > 3 and word.strip().isalpha()]
        
        for word in words:
            existing_rule = CategoryRule.query.filter_by(keyword=word).first()
            if existing_rule:
                if existing_rule.category == category:
                    existing_rule.confidence = min(1.0, existing_rule.confidence + 0.1)
                else:
                    existing_rule.confidence = max(0.1, existing_rule.confidence - 0.1)
                existing_rule.updated_at = datetime.utcnow()
            else:
                new_rule = CategoryRule(
                    keyword=word,
                    category=category,
                    confidence=0.6
                )
                db.session.add(new_rule)
        db.session.commit()
    
    def get_summary(self, period: str = "monthly") -> Dict:
        now = datetime.utcnow()
        
        if period == "weekly":
            start_date = now - timedelta(days=7)
        elif period == "monthly":
            start_date = now - timedelta(days=30)
        elif period == "yearly":
            start_date = now - timedelta(days=365)
        else:
            start_date = datetime.min
        
        period_expenses = Expense.query.filter(Expense.date >= start_date).all()
        
        if not period_expenses:
            return {
                "period": period,
                "total_amount": 0,
                "total_count": 0,
                "categories": {},
                "daily_totals": {},
                "top_categories": []
            }
        
        category_totals = defaultdict(float)
        category_counts = defaultdict(int)
        daily_totals = defaultdict(float)
        
        for expense in period_expenses:
            category_totals[expense.category] += expense.amount
            category_counts[expense.category] += 1
            date_key = expense.date.strftime('%Y-%m-%d')
            daily_totals[date_key] += expense.amount
        
        sorted_categories = sorted(category_totals.items(), 
                                   key=lambda x: x[1], reverse=True)
        
        total_amount = sum(category_totals.values())
        
        categories = {}
        for category, amount in category_totals.items():
            percentage = (amount / total_amount * 100) if total_amount > 0 else 0
            categories[category] = {
                "amount": amount,
                "count": category_counts[category],
                "percentage": round(percentage, 1),
                "formatted_amount": f"${amount:.2f}"
            }
        
        return {
            "period": period,
            "total_amount": total_amount,
            "total_count": len(period_expenses),
            "formatted_total": f"${total_amount:.2f}",
            "categories": categories,
            "daily_totals": dict(daily_totals),
            "top_categories": sorted_categories[:5],
            "start_date": start_date.strftime('%Y-%m-%d'),
            "end_date": now.strftime('%Y-%m-%d')
        }
    
    def search_expenses(self, query: str) -> List[Expense]:
        query_lower = f"%{query.lower()}%"
        return Expense.query.filter(
            or_(
                Expense.description.ilike(query_lower),
                Expense.category.ilike(query_lower)
            )
        ).order_by(Expense.date.desc()).all()
    
    def get_categories(self) -> List[str]:
        used_categories = [cat[0] for cat in db.session.query(Expense.category).distinct().all()]
        all_categories = list(set(used_categories + self.default_categories))
        return sorted(all_categories)

expense_service = ExpenseService()