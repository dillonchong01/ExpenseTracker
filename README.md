# Expense Tracker App

A cross-platform expense tracking application built with Flutter for Android and iOS. Track your expenses, visualize spending patterns, and manage budgets with offline storage.

## Features

### 1. Expense Management
- **Add Expenses**: Track expenses with name, category, price, description, and date
- **Edit & Delete**: Modify or remove expenses easily
- **Category Autocomplete**: Smart category suggestions based on expense names
- **Monthly View**: View and navigate expenses by month

### 2. Visualizations
- **Category Breakdown**: Pie chart showing spending distribution by category
- **Weekly Trends**: Bar chart displaying weekly spending patterns
- **Monthly Trends**: Line chart showing spending trends over the last 6 months

### 3. Budget Management
- **Set Budgets**: Create budgets for different spending categories
- **Visual Progress**: See how close you are to your budget limits
- **Color-coded Alerts**: Green (safe), Orange (75%+), Red (over budget)
- **Budget Tracking**: Real-time spending vs. budget comparison

### 4. Additional Features
- **Offline Storage**: All data stored locally using SQLite
- **Clean UI**: Modern, intuitive Material Design 3 interface
- **Responsive Design**: Works seamlessly on phones and tablets
- **Month Navigation**: Easy switching between different months

## Technology Stack

- **Framework**: Flutter 3.x (Dart)
- **Database**: SQLite with sqflite package
- **State Management**: Provider
- **Charts**: fl_chart
- **Date Formatting**: intl package

## Project Structure

```
lib/
├── main.dart                          # App entry point
├── models/
│   ├── expense.dart                   # Expense data model
│   ├── budget.dart                    # Budget data model
│   └── category_mapping.dart          # Category autocomplete model
├── database/
│   └── database_helper.dart           # SQLite database operations
├── providers/
│   ├── expense_provider.dart          # Expense state management
│   └── budget_provider.dart           # Budget state management
├── screens/
│   ├── home_screen.dart               # Main navigation screen
│   ├── expenses_screen.dart           # Expense list and management
│   ├── visualizations_screen.dart     # Charts and insights
│   └── budgets_screen.dart            # Budget management
└── widgets/
    ├── add_expense_dialog.dart        # Expense input form
    ├── add_budget_dialog.dart         # Budget input form
    ├── category_pie_chart.dart        # Category breakdown chart
    ├── weekly_bar_chart.dart          # Weekly spending chart
    └── monthly_line_chart.dart        # Monthly trend chart
```

## Setup Instructions

### Prerequisites

1. **Install Flutter**: Follow the [official Flutter installation guide](https://docs.flutter.dev/get-started/install)
2. **Install Android Studio** (for Android development)
3. **Install Xcode** (for iOS development, macOS only)

### Installation

1. **Clone or create the project**:
```bash
flutter create expense_tracker
cd expense_tracker
```

2. **Copy all the provided files** into their respective locations in the project directory

3. **Install dependencies**:
```bash
flutter pub get
```

4. **Run the app**:

For Android:
```bash
flutter run
```

For iOS (macOS only):
```bash
flutter run -d ios
```

For a specific device:
```bash
flutter devices  # List available devices
flutter run -d <device-id>
```

### Building for Production

**Android APK**:
```bash
flutter build apk --release
```
The APK will be located at: `build/app/outputs/flutter-apk/app-release.apk`

**Android App Bundle** (for Google Play):
```bash
flutter build appbundle --release
```

**iOS** (macOS only):
```bash
flutter build ios --release
```
Then open `ios/Runner.xcworkspace` in Xcode to archive and distribute.

## Usage Guide

### Adding an Expense

1. Tap the **"+ Add Expense"** button on the Expenses screen
2. Fill in the expense details:
   - **Name**: What you purchased (e.g., "Bus ticket")
   - **Category**: The expense category (e.g., "Transportation")
   - **Price**: Amount spent
   - **Description**: Optional notes
   - **Date**: When the expense occurred
3. Tap **"Add"** to save

**Note**: The app will remember category associations. If you add "Bus" under "Transportation", next time you type "Bus", it will suggest "Transportation" automatically.

### Managing Expenses

- **Edit**: Tap the three-dot menu on any expense and select "Edit"
- **Delete**: Tap the three-dot menu and select "Delete"
- **Change Month**: Tap the calendar icon in the top-right to view different months

### Setting Budgets

1. Navigate to the **Budgets** tab
2. Tap **"+ Add Budget"**
3. Select or enter a category
4. Enter your budget amount
5. Tap **"Add"** to save

The budget screen will show:
- Your spending vs. budget for each category
- Visual progress bar
- Percentage used
- Remaining amount (or overage)

### Viewing Insights

Navigate to the **Insights** tab to see:
- **Category Breakdown**: Visual representation of where your money goes
- **Weekly Spending**: How much you spend each week
- **Monthly Trends**: Your spending patterns over time

## Database Schema

### Expenses Table
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  date TEXT NOT NULL
)
```

### Budgets Table
```sql
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  amount REAL NOT NULL
)
```

### Category Mappings Table
```sql
CREATE TABLE category_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  UNIQUE(name, category)
)
```

## Customization

### Adding New Categories

Categories are automatically created when you add expenses. You can use any category name you like.

### Changing Colors

To modify the app's color scheme, edit `main.dart`:

```dart
colorScheme: ColorScheme.fromSeed(
  seedColor: Colors.blue,  // Change this color
  brightness: Brightness.light,
),
```

### Modifying Chart Colors

Edit the respective chart widget files in `lib/widgets/` to change chart colors.

## Troubleshooting

### Database Issues

If you encounter database errors, you can reset the database by:
1. Uninstalling the app
2. Reinstalling it

Or programmatically by incrementing the database version in `database_helper.dart`.

### Build Issues

```bash
# Clean the build
flutter clean

# Get dependencies again
flutter pub get

# Rebuild
flutter run
```

### Android Build Fails

Ensure you have:
- Android SDK installed
- `ANDROID_HOME` environment variable set
- Accepted Android licenses: `flutter doctor --android-licenses`

### iOS Build Fails (macOS)

Ensure you have:
- Latest Xcode installed
- Command Line Tools: `xcode-select --install`
- CocoaPods installed: `sudo gem install cocoapods`

## Performance Tips

- The app stores all data locally, so performance depends on the amount of data
- For optimal performance, consider archiving old expenses after 1-2 years
- Charts calculate data on-the-fly, which is fast for typical usage patterns

## Future Enhancements

Potential features for future versions:
- Export data to CSV/Excel
- Import data from other sources
- Recurring expenses
- Multiple currencies
- Cloud backup and sync
- Receipt photo attachments
- Expense sharing between users
- Custom report generation

## License

This project is provided as-is for educational and personal use.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Flutter documentation: https://docs.flutter.dev
3. Check package documentation for specific features

## Credits

Built with:
- [Flutter](https://flutter.dev)
- [Provider](https://pub.dev/packages/provider)
- [sqflite](https://pub.dev/packages/sqflite)
- [fl_chart](https://pub.dev/packages/fl_chart)
- [intl](https://pub.dev/packages/intl)
