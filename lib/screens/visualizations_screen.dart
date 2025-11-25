import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/expense_provider.dart';
import '../widgets/category_pie_chart.dart';
import '../widgets/weekly_bar_chart.dart';
import '../widgets/monthly_line_chart.dart';

class VisualizationsScreen extends StatelessWidget {
  const VisualizationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Insights'),
      ),
      body: Consumer<ExpenseProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.expenses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.insights_outlined,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No data to visualize',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Add some expenses to see insights',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[500],
                    ),
                  ),
                ],
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Month indicator
                Center(
                  child: Text(
                    DateFormat('MMMM yyyy').format(provider.selectedMonth),
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                ),
                const SizedBox(height: 24),

                // Category breakdown
                _SectionCard(
                  title: 'Spending by Category',
                  subtitle: 'Breakdown for ${DateFormat('MMMM').format(provider.selectedMonth)}',
                  child: SizedBox(
                    height: 300,
                    child: CategoryPieChart(
                      categoryData: provider.spendingByCategory,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Weekly trend
                _SectionCard(
                  title: 'Weekly Spending',
                  subtitle: 'Trend for ${DateFormat('MMMM').format(provider.selectedMonth)}',
                  child: SizedBox(
                    height: 250,
                    child: FutureBuilder<List<double>>(
                      future: provider.getWeeklySpending(),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState == ConnectionState.waiting) {
                          return const Center(child: CircularProgressIndicator());
                        }
                        if (!snapshot.hasData || snapshot.data!.isEmpty) {
                          return const Center(child: Text('No data available'));
                        }
                        return WeeklyBarChart(weeklyData: snapshot.data!);
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Monthly trend
                _SectionCard(
                  title: 'Monthly Spending Trend',
                  subtitle: 'Last 6 months',
                  child: SizedBox(
                    height: 250,
                    child: FutureBuilder<Map<String, double>>(
                      future: provider.getMonthlySpending(),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState == ConnectionState.waiting) {
                          return const Center(child: CircularProgressIndicator());
                        }
                        if (!snapshot.hasData || snapshot.data!.isEmpty) {
                          return const Center(child: Text('No data available'));
                        }
                        return MonthlyLineChart(monthlyData: snapshot.data!);
                      },
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget child;

  const _SectionCard({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            const SizedBox(height: 16),
            child,
          ],
        ),
      ),
    );
  }
}
