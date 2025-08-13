import axios from 'axios';
import type { FoodItem, Recipe, LoginCredentials, RegisterCredentials, User, Notification } from '../types';

const apiClient = axios.create({
    baseURL: '/api', // Vite proxy will handle this
    withCredentials: true, // Send cookies with requests
});

// Auth
const register = async (credentials: RegisterCredentials): Promise<User> => {
    const { data } = await apiClient.post('/auth/register', credentials);
    return data;
};

const login = async (credentials: LoginCredentials): Promise<User> => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
};

const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
};

const getMe = async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
};

// Pantry
const getPantryItems = async (): Promise<FoodItem[]> => {
    const { data } = await apiClient.get('/pantry');
    return data;
};

const addPantryItem = async (item: Omit<FoodItem, 'id'>): Promise<FoodItem> => {
    const { data } = await apiClient.post('/pantry', item);
    return data;
};

const updatePantryItem = async (item: FoodItem): Promise<FoodItem> => {
    const { data } = await apiClient.put(`/pantry/${item.id}`, item);
    return data;
};

const deletePantryItem = async (id: string): Promise<void> => {
    await apiClient.delete(`/pantry/${id}`);
};

// Recipes
const generateRecipes = async (): Promise<Recipe[]> => {
    const { data } = await apiClient.post('/recipes/generate');
    return data;
}

// Notifications
const getNotifications = async (): Promise<Notification[]> => {
    const { data } = await apiClient.get('/notifications');
    return data;
}


export const api = {
    register,
    login,
    logout,
    getMe,
    getPantryItems,
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    generateRecipes,
    getNotifications
};