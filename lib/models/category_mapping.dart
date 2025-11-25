class CategoryMapping {
  final int? id;
  final String name;
  final String category;

  CategoryMapping({
    this.id,
    required this.name,
    required this.category,
  });

  // Convert CategoryMapping to Map for database insertion
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'category': category,
    };
  }

  // Create CategoryMapping from Map (database retrieval)
  factory CategoryMapping.fromMap(Map<String, dynamic> map) {
    return CategoryMapping(
      id: map['id'] as int?,
      name: map['name'] as String,
      category: map['category'] as String,
    );
  }
}
