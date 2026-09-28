# Analytical Features & Custom Interval Implementation Plan

Based on the provided screenshots and your feature requests, here is the technical plan to upgrade the application to match the exact reference UI and implement advanced tracking capabilities.

## 1. Custom Date Interval Tracker
Currently, the UI allows swiping between calendar months. We will integrate a **Custom Interval Selector**:
- **UI Update:** Add a calendar/filter icon next to the month selector on the Transactions tab.
- **Functionality:** Clicking it opens a bottom-sheet modal allowing the user to set a specific Start Date (e.g., 20th of the current month) and End Date (e.g., 10th of the next month).
- **Data Hooking:** The `Dashboard.tsx` state will update `startDate` and `endDate`, triggering a re-fetch of Firestore data strictly bounded by the custom interval. The UI will then dynamically recalculate the Red/Green Total spent within that specific timeframe.

## 2. Home Tab Analytics & Dashboard (Reference: Screenshot 1)
We will build out the `Home` tab to exactly match the provided layout:
- **Dependency:** Install `recharts` for rendering high-performance, customizable line charts in React.
- **Top Section:** 
  - Create the rounded, outlined `Bank` card displaying the Net Total (Income - Expenses).
  - Create the `Account` and `Budget` quick-action cards.
- **Chart Section:** 
  - Implement a `LineChart` using `recharts`.
  - The chart will feature the custom dotted-grid background from the screenshot.
  - X-Axis will plot dates (e.g., Aug 28 to Sep 27).
  - Y-Axis will plot cumulative spending.
- **Action Button:** Add the "View All Transactions" button that redirects the tab state to the Transactions view.

## 3. Budgets System (Reference: Screenshots 2 & 3)
We will build out the `Budgets` tab and its associated creation flow:
- **Firestore Schema:** Add a new `budgets` collection.
  - Fields: `name`, `amount`, `period` (e.g., 1 month), `startDate`, `type` (Expense vs Savings), `color`.
- **UI Components:**
  - Build the "Add Budget" screen with the "Expense Budget" / "Savings Budget" toggle.
  - Implement the visual Color Picker circles.
  - Add the informational modal ("A budget sets a planned limit...") triggered by an info icon.
- **Analytics Integration:** On the Budgets tab, we will display progress bars comparing the `total spent` in a specific category vs the `budget limit` set by the user.

## Next Steps for Execution
1. Install Recharts (`npm install recharts`).
2. Build `HomeTab.tsx` with the Line Chart.
3. Update `Ledger.tsx` to include the Custom Interval picker.
4. Scaffold the `BudgetsTab.tsx`.
