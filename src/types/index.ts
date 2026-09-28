export interface Expense {
  id: string;
  userId: string;
  title: string;
  category: string;
  amount: number;
  date: string; // ISO string format
  type: 'expense' | 'income';
  createdAt: number;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  category: string;
  amount: number;
  color: string;
  type: 'expense' | 'savings';
  createdAt: number;
}
