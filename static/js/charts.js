// Chart.js configurations and chart initialization

// Chart.js default configuration
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;
Chart.defaults.plugins.legend.position = 'bottom';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 20;

// Color schemes for charts
const chartColors = {
    primary: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB'],
    gradients: {
        blue: ['#667eea', '#764ba2'],
        green: ['#56ab2f', '#a8e6cf'],
        orange: ['#f093fb', '#f5576c'],
        purple: ['#4facfe', '#00f2fe']
    }
};

// Chart instances storage
const chartInstances = {};

// Initialize category pie chart
function initCategoryChart(period = 'monthly') {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (chartInstances.categoryChart) {
        chartInstances.categoryChart.destroy();
    }

    // Fetch chart data
    fetch(`/api/chart-data/${period}`)
        .then(response => response.json())
        .then(data => {
            chartInstances.categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.labels,
                    datasets: [{
                        data: data.datasets[0].data,
                        backgroundColor: chartColors.primary.slice(0, data.labels.length),
                        borderWidth: 2,
                        borderColor: '#212529',
                        hoverBorderWidth: 3,
                        hoverBorderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 12
                                },
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        return data.labels.map((label, i) => {
                                            const value = data.datasets[0].data[i];
                                            const percentage = ((value / total) * 100).toFixed(1);
                                            return {
                                                text: `${label} (${percentage}%)`,
                                                fillStyle: data.datasets[0].backgroundColor[i],
                                                hidden: false,
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = ExpenseTracker.formatCurrency(context.parsed);
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1000
                    },
                    interaction: {
                        intersect: false
                    }
                }
            });
        })
        .catch(error => {
            console.error('Failed to load chart data:', error);
            showChartError(canvas, 'Failed to load chart data');
        });
}

// Initialize daily spending chart
function initDailyChart(period = 'monthly') {
    const canvas = document.getElementById('dailyChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (chartInstances.dailyChart) {
        chartInstances.dailyChart.destroy();
    }

    // Fetch summary data to get daily totals
    fetch(`/api/chart-data/${period}`)
        .then(response => response.json())
        .then(data => {
            // This is a simplified version - in a real app, you'd have a separate API endpoint for daily data
            // For now, we'll create a simple bar chart showing category data
            
            chartInstances.dailyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Amount Spent',
                        data: data.datasets[0].data,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return ExpenseTracker.formatCurrency(value);
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Amount: ${ExpenseTracker.formatCurrency(context.parsed.y)}`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });
        })
        .catch(error => {
            console.error('Failed to load daily chart data:', error);
            showChartError(canvas, 'Failed to load chart data');
        });
}

// Show chart error message
function showChartError(canvas, message) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6c757d';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// Responsive chart resizing
function resizeCharts() {
    Object.values(chartInstances).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

// Initialize responsive behavior
window.addEventListener('resize', debounce(resizeCharts, 250));

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Chart theme management
function updateChartTheme(isDark = true) {
    const textColor = isDark ? '#ffffff' : '#212529';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    Chart.defaults.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    
    // Update existing charts
    Object.values(chartInstances).forEach(chart => {
        if (chart) {
            chart.options.scales.y.grid.color = gridColor;
            chart.options.scales.y.ticks.color = textColor;
            chart.options.scales.x.ticks.color = textColor;
            chart.update();
        }
    });
}

// Initialize theme based on current theme
document.addEventListener('DOMContentLoaded', () => {
    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    updateChartTheme(isDarkTheme);
});

// Export functions for global use
window.chartFunctions = {
    initCategoryChart,
    initDailyChart,
    resizeCharts,
    updateChartTheme
};
