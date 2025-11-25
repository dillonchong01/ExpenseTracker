class Budget {
  final int? id;
  final String category;
  final double amount;

  Budget({
    this.id,
    required this.category,
    required this.amount,
  });

  // Convert Budget to Map for database insertion
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'category': category,
      'amount': amount,
    };
  }

  // Create Budget from Map (database retrieval)
  factory Budget.fromMap(Map<String, dynamic> map) {
    return Budget(
      id: map['id'] as int?,
      category: map['category'] as String,
      amount: map['amount'] as double,
    );
  }

  // Copy method for updating budgets
  Budget copyWith({
    int? id,
    String? category,
    double? amount,
  }) {
    return Budget(
      id: id ?? this.id,
      category: category ?? this.category,
      amount: amount ?? this.amount,
    );
  }
}
