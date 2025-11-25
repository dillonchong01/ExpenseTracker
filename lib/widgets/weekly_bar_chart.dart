import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class WeeklyBarChart extends StatelessWidget {
  final List<double> weeklyData;

  const WeeklyBarChart({super.key, required this.weeklyData});

  @override
  Widget build(BuildContext context) {
    return BarChart(
      BarChartData(
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(show: false),
        gridData: FlGridData(show: false),
        barGroups: weeklyData.asMap().entries.map((entry) {
          final weekIndex = entry.key;
          final weekSpending = entry.value;
          return BarChartGroupData(
            x: weekIndex,
            barRods: [
              BarChartRodData(
                y: weekSpending,
                color: _getColor(weekIndex),
                width: 15,
                borderRadius: BorderRadius.zero,
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Color _getColor(int index) {
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.red,
      Colors.teal,
      Colors.pink,
      Colors.amber,
      Colors.indigo,
      Colors.cyan,
    ];
    return colors[index % colors.length];
  }
}
