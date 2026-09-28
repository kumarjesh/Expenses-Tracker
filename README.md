# 💰 Expense Tracker

A modern, responsive, and fully-featured expense tracking application built with **Next.js**, **React**, and **Firebase**. Keep track of your daily expenses, monitor your incomes, and analyze your spending habits across custom budgets.

## ✨ Features

- **Authentication:** Secure Google Sign-in powered by Firebase Auth.
- **Transaction Management:** Add, edit, and seamlessly delete your daily income and expense transactions.
- **Categorization:** Automatically organize your spending with beautiful category icons (Dining, Groceries, Travel, etc.).
- **Smart Analytics & Budgets:** Monitor your cash flow and set category-based spending targets.
- **Custom Date Intervals:** Filter your ledger using a built-in calendar to view transactions over specific days or months.
- **Data Export:** Instantly export your transaction data into a `.csv` file.
- **Light & Dark Mode:** Toggle between themes effortlessly for comfortable viewing at any time of day.
- **Responsive Design:** Mobile-first layout featuring a bottom navigation bar for phones and a clean sidebar for desktop screens.

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore & Firebase Authentication)
- **Styling:** Custom CSS (with CSS variables for dynamic theming)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Date Utilities:** `date-fns` & `react-datepicker`

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js installed on your machine. You will also need a Firebase project set up.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kumarjesh/Expenses-Tracker.git
   cd Expenses-Tracker/expense-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚢 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/). 
Simply import the repository into your Vercel dashboard, add the Firebase environment variables in the project settings, and click **Deploy**.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).
