import React, { useState, useEffect } from 'react';
import type { FoodItem } from '../types';
import { Icon } from './common/Icon';

interface AddItemFormProps {
  onAddItem: (item: Omit<FoodItem, 'id'>) => void;
  editingItem: FoodItem | null;
  onUpdateItem: (item: FoodItem) => void;
  onCancelEdit: () => void;
}

const categories = ["Produce", "Dairy", "Meat", "Pantry", "Frozen", "Bakery", "Other"];

export const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem, editingItem, onUpdateItem, onCancelEdit }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [expDate, setExpDate] = useState('');
  const [category, setCategory] = useState(categories[0]);


  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setQuantity(editingItem.quantity);
      setUnit(editingItem.unit);
      setCategory(editingItem.category);
      setExpDate(editingItem.expirationDate ? editingItem.expirationDate.split('T')[0] : '');
    } else {
      resetForm();
    }
  }, [editingItem]);

  const resetForm = () => {
    setName('');
    setQuantity(1);
    setUnit('');
    setExpDate('');
    setCategory(categories[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || quantity <= 0) {
      alert('Please fill in a valid name and quantity.');
      return;
    }
    
    const itemData = { 
        name, 
        quantity, 
        unit, 
        category,
        expirationDate: expDate || null 
    };

    if (editingItem) {
      onUpdateItem({ ...itemData, id: editingItem.id });
    } else {
      onAddItem(itemData);
    }
    resetForm();
    onCancelEdit();
  };
  
  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{editingItem ? 'Edit Item' : 'Add New Food Item'}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        
        <div className="sm:col-span-2">
          <label htmlFor="food-name" className="block text-sm font-medium text-gray-600 mb-1">Food Name</label>
          <input
            id="food-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Avocados"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            required
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="e.g., 2"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            required
          />
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-600 mb-1">Unit</label>
          <input
            id="unit"
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g., lbs, items"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>

        <div className="sm:col-span-2">
           <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Category</label>
            <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
            >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
        </div>
        
        <div className="relative sm:col-span-2">
          <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-600 mb-1">Expires On</label>
            <Icon name="calendar" className="absolute left-3 top-10 w-5 h-5 text-gray-400"/>
          <input
            id="expiration-date"
            type="date"
            value={expDate}
            onChange={(e) => setExpDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>

        <div className="md:col-span-4 flex justify-end gap-3 mt-4">
          {editingItem && (
             <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors duration-200 shadow-sm disabled:bg-emerald-300"
            disabled={!name.trim() || quantity <= 0}
          >
            <Icon name={editingItem ? 'check-circle' : 'plus'} className="w-5 h-5"/>
            {editingItem ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};