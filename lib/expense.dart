class Expense {
  final int? id;
  final String name;
  final String category;
  final double price;
  final String? description;
  final DateTime date;

  Expense({
    this.id,
    required this.name,
    required this.category,
    required this.price,
    this.description,
    required this.date,
  });

  // Convert Expense to Map for database insertion
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'price': price,
      'description': description,
      'date': date.toIso8601String(),
    };
  }

  // Create Expense from Map (database retrieval)
  factory Expense.fromMap(Map<String, dynamic> map) {
    return Expense(
      id: map['id'] as int?,
      name: map['name'] as String,
      category: map['category'] as String,
      price: map['price'] as double,
      description: map['description'] as String?,
      date: DateTime.parse(map['date'] as String),
    );
  }

  // Copy method for updating expenses
  Expense copyWith({
    int? id,
    String? name,
    String? category,
    double? price,
    String? description,
    DateTime? date,
  }) {
    return Expense(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      price: price ?? this.price,
      description: description ?? this.description,
      date: date ?? this.date,
    );
  }
}
