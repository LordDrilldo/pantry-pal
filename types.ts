export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expirationDate: string | null;
}

export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export enum ExpirationStatus {
    Safe = 'SAFE',
    Soon = 'SOON',
    Expired = 'EXPIRED'
}

export interface User {
    id: string;
    email: string;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}
export interface RegisterCredentials extends LoginCredentials {}

export interface Notification {
    id: string;
    title: string;
    message: string;
    status: 'SOON' | 'EXPIRED';
}