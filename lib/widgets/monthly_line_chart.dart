import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class MonthlyLineChart extends StatelessWidget {
  final Map<String, double> monthlyData;

  const MonthlyLineChart({super.key, required this.monthlyData});

  @override
  Widget build(BuildContext context) {
    return LineChart(
      LineChartData(
        gridData: FlGridData(show: true),
        titlesData: FlTitlesData(show: true),
        borderData: FlBorderData(show: true),
        lineBarsData: [
          LineChartBarData(
            spots: monthlyData.entries.map((entry) {
              final dateParts = entry.key.split('-');
              final month = int.parse(dateParts[1]);
              return FlSpot(month.toDouble(), entry.value);
            }).toList(),
            isCurved: true,
            colors: [Colors.blue],
            barWidth: 4,
            belowBarData: BarAreaData(show: false),
          ),
        ],
      ),
    );
  }
}
