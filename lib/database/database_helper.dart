import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/expense.dart';
import '../models/budget.dart';
import '../models/category_mapping.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('expenses.db');
    return _database!;
  }

  // Initialize the database
  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  // Create tables
  Future _createDB(Database db, int version) async {
    const idType = 'INTEGER PRIMARY KEY AUTOINCREMENT';
    const textType = 'TEXT NOT NULL';
    const realType = 'REAL NOT NULL';

    // Expenses table
    await db.execute('''
      CREATE TABLE expenses (
        id $idType,
        name $textType,
        category $textType,
        price $realType,
        description TEXT,
        date $textType
      )
    ''');

    // Budgets table
    await db.execute('''
      CREATE TABLE budgets (
        id $idType,
        category $textType,
        amount $realType
      )
    ''');

    // Category mappings table for autocomplete
    await db.execute('''
      CREATE TABLE category_mappings (
        id $idType,
        name $textType,
        category $textType,
        UNIQUE(name, category)
      )
    ''');
  }

  // ========== EXPENSE OPERATIONS ==========

  // Insert expense
  Future<Expense> insertExpense(Expense expense) async {
    final db = await instance.database;
    final id = await db.insert('expenses', expense.toMap());
    return expense.copyWith(id: id);
  }

  // Get all expenses
  Future<List<Expense>> getAllExpenses() async {
    final db = await instance.database;
    final result = await db.query('expenses', orderBy: 'date DESC');
    return result.map((json) => Expense.fromMap(json)).toList();
  }

  // Get expenses for a specific month
  Future<List<Expense>> getExpensesByMonth(int year, int month) async {
    final db = await instance.database;
    final startDate = DateTime(year, month, 1);
    final endDate = DateTime(year, month + 1, 0, 23, 59, 59);

    final result = await db.query(
      'expenses',
      where: 'date >= ? AND date <= ?',
      whereArgs: [startDate.toIso8601String(), endDate.toIso8601String()],
      orderBy: 'date DESC',
    );

    return result.map((json) => Expense.fromMap(json)).toList();
  }

  // Update expense
  Future<int> updateExpense(Expense expense) async {
    final db = await instance.database;
    return db.update(
      'expenses',
      expense.toMap(),
      where: 'id = ?',
      whereArgs: [expense.id],
    );
  }

  // Delete expense
  Future<int> deleteExpense(int id) async {
    final db = await instance.database;
    return db.delete(
      'expenses',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // ========== BUDGET OPERATIONS ==========

  // Insert or update budget
  Future<Budget> insertOrUpdateBudget(Budget budget) async {
    final db = await instance.database;
    
    // Check if budget exists for this category
    final existing = await db.query(
      'budgets',
      where: 'category = ?',
      whereArgs: [budget.category],
    );

    if (existing.isNotEmpty) {
      // Update existing budget
      await db.update(
        'budgets',
        budget.toMap(),
        where: 'category = ?',
        whereArgs: [budget.category],
      );
      return budget.copyWith(id: existing.first['id'] as int);
    } else {
      // Insert new budget
      final id = await db.insert('budgets', budget.toMap());
      return budget.copyWith(id: id);
    }
  }

  // Get all budgets
  Future<List<Budget>> getAllBudgets() async {
    final db = await instance.database;
    final result = await db.query('budgets', orderBy: 'category ASC');
    return result.map((json) => Budget.fromMap(json)).toList();
  }

  // Get budget by category
  Future<Budget?> getBudgetByCategory(String category) async {
    final db = await instance.database;
    final result = await db.query(
      'budgets',
      where: 'category = ?',
      whereArgs: [category],
    );

    if (result.isNotEmpty) {
      return Budget.fromMap(result.first);
    }
    return null;
  }

  // Delete budget
  Future<int> deleteBudget(int id) async {
    final db = await instance.database;
    return db.delete(
      'budgets',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // ========== CATEGORY MAPPING OPERATIONS ==========

  // Insert category mapping
  Future<void> insertCategoryMapping(String name, String category) async {
    final db = await instance.database;
    try {
      await db.insert(
        'category_mappings',
        {'name': name, 'category': category},
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } catch (e) {
      // Ignore duplicate entries
    }
  }

  // Get suggested category for a name
  Future<String?> getSuggestedCategory(String name) async {
    final db = await instance.database;
    final result = await db.query(
      'category_mappings',
      where: 'name = ?',
      whereArgs: [name],
      limit: 1,
    );

    if (result.isNotEmpty) {
      return result.first['category'] as String;
    }
    return null;
  }

  // Get all unique categories
  Future<List<String>> getAllCategories() async {
    final db = await instance.database;
    final result = await db.rawQuery(
      'SELECT DISTINCT category FROM expenses ORDER BY category ASC'
    );
    return result.map((row) => row['category'] as String).toList();
  }

  // Close database
  Future close() async {
    final db = await instance.database;
    db.close();
  }
}
