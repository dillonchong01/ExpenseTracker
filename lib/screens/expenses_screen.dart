import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/expense_provider.dart';
import '../models/expense.dart';
import '../widgets/add_expense_dialog.dart';

class ExpensesScreen extends StatelessWidget {
  const ExpensesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Expenses'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_month),
            onPressed: () => _showMonthPicker(context),
          ),
        ],
      ),
      body: Consumer<ExpenseProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return Column(
            children: [
              // Month selector and total
              Container(
                padding: const EdgeInsets.all(16),
                color: Theme.of(context).colorScheme.primaryContainer,
                child: Column(
                  children: [
                    Text(
                      DateFormat('MMMM yyyy').format(provider.selectedMonth),
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Total: \$${provider.totalSpending.toStringAsFixed(2)}',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                    ),
                  ],
                ),
              ),

              // Expense list
              Expanded(
                child: provider.expenses.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.receipt_long_outlined,
                              size: 64,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No expenses yet',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(8),
                        itemCount: provider.expenses.length,
                        itemBuilder: (context, index) {
                          final expense = provider.expenses[index];
                          return _ExpenseCard(
                            expense: expense,
                            onEdit: () => _editExpense(context, expense),
                            onDelete: () => _deleteExpense(context, expense),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _addExpense(context),
        icon: const Icon(Icons.add),
        label: const Text('Add Expense'),
      ),
    );
  }

  void _showMonthPicker(BuildContext context) async {
    final provider = Provider.of<ExpenseProvider>(context, listen: false);
    final selected = await showDatePicker(
      context: context,
      initialDate: provider.selectedMonth,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDatePickerMode: DatePickerMode.year,
    );

    if (selected != null) {
      provider.changeMonth(selected);
    }
  }

  void _addExpense(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const AddExpenseDialog(),
    );
  }

  void _editExpense(BuildContext context, Expense expense) {
    showDialog(
      context: context,
      builder: (context) => AddExpenseDialog(expense: expense),
    );
  }

  void _deleteExpense(BuildContext context, Expense expense) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Expense'),
        content: Text('Are you sure you want to delete "${expense.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Provider.of<ExpenseProvider>(context, listen: false)
                  .deleteExpense(expense.id!);
              Navigator.pop(context);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class _ExpenseCard extends StatelessWidget {
  final Expense expense;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _ExpenseCard({
    required this.expense,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
          child: Icon(
            _getCategoryIcon(expense.category),
            color: Theme.of(context).colorScheme.onSecondaryContainer,
          ),
        ),
        title: Text(
          expense.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(expense.category),
            if (expense.description != null && expense.description!.isNotEmpty)
              Text(
                expense.description!,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            Text(
              DateFormat('MMM dd, yyyy').format(expense.date),
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '\$${expense.price.toStringAsFixed(2)}',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            PopupMenuButton(
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(Icons.edit, size: 20),
                      SizedBox(width: 8),
                      Text('Edit'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete, size: 20, color: Colors.red),
                      SizedBox(width: 8),
                      Text('Delete', style: TextStyle(color: Colors.red)),
                    ],
                  ),
                ),
              ],
              onSelected: (value) {
                if (value == 'edit') {
                  onEdit();
                } else if (value == 'delete') {
                  onDelete();
                }
              },
            ),
          ],
        ),
        isThreeLine: true,
      ),
    );
  }

  IconData _getCategoryIcon(String category) {
    final categoryLower = category.toLowerCase();
    if (categoryLower.contains('food') || categoryLower.contains('restaurant')) {
      return Icons.restaurant;
    } else if (categoryLower.contains('transport')) {
      return Icons.directions_bus;
    } else if (categoryLower.contains('shopping')) {
      return Icons.shopping_bag;
    } else if (categoryLower.contains('entertainment')) {
      return Icons.movie;
    } else if (categoryLower.contains('health')) {
      return Icons.medical_services;
    } else if (categoryLower.contains('utilities') || categoryLower.contains('bills')) {
      return Icons.receipt;
    } else {
      return Icons.category;
    }
  }
}
