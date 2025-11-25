import 'package:flutter/foundation.dart';
import '../models/budget.dart';
import '../database/database_helper.dart';

class BudgetProvider with ChangeNotifier {
  List<Budget> _budgets = [];
  bool _isLoading = false;

  List<Budget> get budgets => _budgets;
  bool get isLoading => _isLoading;

  BudgetProvider() {
    loadBudgets();
  }

  // Load all budgets
  Future<void> loadBudgets() async {
    _isLoading = true;
    notifyListeners();

    _budgets = await DatabaseHelper.instance.getAllBudgets();

    _isLoading = false;
    notifyListeners();
  }

  // Add or update a budget
  Future<void> setBudget(String category, double amount) async {
    final budget = Budget(category: category, amount: amount);
    await DatabaseHelper.instance.insertOrUpdateBudget(budget);
    await loadBudgets();
  }

  // Delete a budget
  Future<void> deleteBudget(int id) async {
    await DatabaseHelper.instance.deleteBudget(id);
    await loadBudgets();
  }

  // Get budget for a specific category
  Budget? getBudgetForCategory(String category) {
    try {
      return _budgets.firstWhere((budget) => budget.category == category);
    } catch (e) {
      return null;
    }
  }

  // Check if a category has a budget
  bool hasBudget(String category) {
    return _budgets.any((budget) => budget.category == category);
  }
}
```

---

## FILE 9: lib/screens/home_screen.dart

```dart
import 'package:flutter/material.dart';
import 'expenses_screen.dart';
import 'visualizations_screen.dart';
import 'budgets_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const ExpensesScreen(),
    const VisualizationsScreen(),
    const BudgetsScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: _onItemTapped,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long),
            label: 'Expenses',
          ),
          NavigationDestination(
            icon: Icon(Icons.insights_outlined),
            selectedIcon: Icon(Icons.insights),
            label: 'Insights',
          ),
          NavigationDestination(
            icon: Icon(Icons.account_balance_wallet_outlined),
            selectedIcon: Icon(Icons.account_balance_wallet),
            label: 'Budgets',
          ),
        ],
      ),
    );
  }
}
