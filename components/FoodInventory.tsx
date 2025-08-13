import React from 'react';
import { FoodItem, ExpirationStatus } from '../types';
import { Icon } from './common/Icon';

interface FoodInventoryProps {
  items: FoodItem[];
  onDeleteItem: (id: string) => void;
  onEditItem: (item: FoodItem) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
}

const getExpirationStatus = (expDate: string | null): ExpirationStatus => {
    if (!expDate) return ExpirationStatus.Safe;
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiration = new Date(expDate);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return ExpirationStatus.Expired;
    if (diffDays <= 3) return ExpirationStatus.Soon;
    return ExpirationStatus.Safe;
};

const statusStyles: Record<ExpirationStatus, { bg: string, text: string, border: string, iconColor: string, label: string }> = {
    [ExpirationStatus.Expired]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', iconColor: 'text-red-500', label: 'Expired' },
    [ExpirationStatus.Soon]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', iconColor: 'text-yellow-500', label: 'Expires Soon' },
    [ExpirationStatus.Safe]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', iconColor: 'text-green-500', label: 'Fresh' },
};

const categories = ["All", "Produce", "Dairy", "Meat", "Pantry", "Frozen", "Bakery", "Other"];

export const FoodInventory: React.FC<FoodInventoryProps> = ({ items, onDeleteItem, onEditItem, searchTerm, setSearchTerm, filterCategory, setFilterCategory }) => {
  if (items.length === 0 && !searchTerm && !filterCategory) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg">
        <Icon name="chef-hat" className="mx-auto w-16 h-16 text-gray-300" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">Your Pantry is Empty</h3>
        <p className="mt-2 text-md text-gray-500">Add some food items above to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className='flex-grow'>
              <label htmlFor="search" className="sr-only">Search</label>
              <input
                  id="search"
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
          </div>
          <div>
              <label htmlFor="filter" className="sr-only">Filter by category</label>
              <select
                  id="filter"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value === 'All' ? '' : e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
              >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
          </div>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">My Pantry <span className="text-lg font-normal text-gray-500">({items.length} items)</span></h2>
      <div className="space-y-3">
        {items.length > 0 ? items.map(item => {
           const status = getExpirationStatus(item.expirationDate);
           const styles = statusStyles[status];
           return (
             <div key={item.id} className={`flex items-center justify-between p-4 rounded-lg border ${styles.bg} ${styles.border}`}>
                <div className="flex-1">
                    <div className='flex items-center gap-3'>
                      <p className={`font-bold text-lg ${styles.text}`}>{item.name}</p>
                      <span className='text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full'>{item.category}</span>
                    </div>
                    <p className={`text-sm ${styles.text} opacity-80`}>{item.quantity} {item.unit}</p>
                    {item.expirationDate && (
                      <p className={`mt-1 text-xs font-medium inline-flex items-center px-2 py-1 rounded-full ${styles.bg} ${styles.text}`}>
                        {status === ExpirationStatus.Expired ? 'Expired on' : 'Expires'}: {new Date(item.expirationDate).toLocaleDateString(undefined, { timeZone: 'UTC' })} ({styles.label})
                      </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onEditItem(item)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors">
                        <Icon name="edit" className="w-5 h-5"/>
                    </button>
                    <button onClick={() => onDeleteItem(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                        <Icon name="trash" className="w-5 h-5"/>
                    </button>
                </div>
            </div>
           )
        }) : (
            <div className="text-center py-10 text-gray-500">
                <p>No items match your search.</p>
            </div>
        )}
      </div>
    </div>
  );
};