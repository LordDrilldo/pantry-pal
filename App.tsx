import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { FoodItem, Recipe, User, Notification } from './types';
import { AddItemForm } from './components/AddItemForm';
import { FoodInventory } from './components/FoodInventory';
import { RecipeSection } from './components/RecipeSection';
import { Navbar } from './components/Navbar';
import { AuthPage } from './components/AuthPage';
import { api } from './services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchPantry = useCallback(async () => {
    if (!user) return;
    try {
      const items = await api.getPantryItems();
      setFoodItems(items);
    } catch (error) {
      console.error("Failed to fetch pantry items", error);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
      if(!user) return;
      try {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
  }, [user]);


  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const currentUser = await api.getMe();
        setUser(currentUser);
      } catch (error) {
        console.log("No active session");
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkUserSession();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPantry();
      fetchNotifications();
    } else {
      setFoodItems([]);
      setRecipes([]);
      setNotifications([]);
    }
  }, [user, fetchPantry, fetchNotifications]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleAddItem = async (item: Omit<FoodItem, 'id'>) => {
    try {
      const newItem = await api.addPantryItem(item);
      setFoodItems(prevItems => [newItem, ...prevItems]);
      fetchNotifications(); // Refresh notifications after adding an item
    } catch(error) {
        console.error("Failed to add item", error);
    }
  };
  
  const handleUpdateItem = async (updatedItem: FoodItem) => {
    try {
        await api.updatePantryItem(updatedItem);
        setFoodItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
        setEditingItem(null);
        fetchNotifications(); // Refresh notifications after updating
    } catch(error) {
        console.error("Failed to update item", error);
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
        await api.deletePantryItem(id);
        setFoodItems(prevItems => prevItems.filter(item => item.id !== id));
        fetchNotifications(); // Refresh notifications after deleting
    } catch(error) {
        console.error("Failed to delete item", error);
    }
  };
  
  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleGenerateRecipes = useCallback(async () => {
    setIsLoadingRecipes(true);
    setRecipeError(null);
    try {
      const newRecipes = await api.generateRecipes();
      setRecipes(newRecipes);
    } catch (error: any) {
        setRecipeError(error.response?.data?.error || error.message || "An unknown error occurred.");
    } finally {
      setIsLoadingRecipes(false);
    }
  }, []);
  
  const handleClearNotifications = () => {
      setNotifications([]);
  };

  const sortedAndFilteredItems = useMemo(() => {
    return foodItems
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(item => 
        filterCategory ? item.category === filterCategory : true
      )
      .sort((a, b) => {
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;
        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      });
  }, [foodItems, searchTerm, filterCategory]);
  
  if (isAuthLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
      return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
       />
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <AddItemForm 
                onAddItem={handleAddItem}
                editingItem={editingItem}
                onUpdateItem={handleUpdateItem}
                onCancelEdit={() => setEditingItem(null)}
            />
            <FoodInventory 
                items={sortedAndFilteredItems} 
                onDeleteItem={handleDeleteItem} 
                onEditItem={handleEditItem}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
            />
          </div>
          <div className="lg:sticky top-28 self-start">
             <RecipeSection
              recipes={recipes}
              isLoading={isLoadingRecipes}
              error={recipeError}
              onGenerateRecipes={handleGenerateRecipes}
              hasItems={foodItems.length > 0}
            />
          </div>
        </div>
      </main>

       <footer className="text-center py-6 mt-12 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Pantry Pal. Cook something amazing!</p>
      </footer>
    </div>
  );
};

export default App;