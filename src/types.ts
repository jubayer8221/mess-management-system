export type Role = 'admin' | 'manager' | 'user';

export interface Profile {
  id: string;
  role: Role;
}

export interface Member {
  id: string;
  name: string;
  created_by: string;
}

export interface MealEntry {
  id: string;
  member_id: string;
  date: string;
  count: number;
  created_by: string;
  updated_by: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  cost: number;
  date: string;
  created_by: string;
  updated_by: string;
}

export interface RentCost {
  id: string;
  month: string;
  amount: number;
  created_by: string;
  updated_by: string;
}

export interface MealCost {
  month: string;
  totalCost: number;
  perMealCost: number;
  rentCost: number;
  perPersonRent: number;
  memberCosts: {
    memberId: string;
    name: string;
    mealCount: number;
    mealCost: number;
    rentShare: number;
    totalCost: number;
  }[];
}