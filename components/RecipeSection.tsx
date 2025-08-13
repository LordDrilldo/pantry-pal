import React from 'react';
import type { Recipe } from '../types';
import { Icon } from './common/Icon';

interface RecipeSectionProps {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  onGenerateRecipes: () => void;
  hasItems: boolean;
}

const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
    <div className="p-6">
      <h3 className="text-xl font-bold text-emerald-800">{recipe.recipeName}</h3>
      <p className="text-sm text-gray-600 mt-1 mb-4">{recipe.description}</p>
      
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Ingredients:</h4>
        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
          {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside text-gray-600 text-sm space-y-2">
          {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </div>
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    </div>
);


export const RecipeSection: React.FC<RecipeSectionProps> = ({ recipes, isLoading, error, onGenerateRecipes, hasItems }) => {
  return (
    <div className="bg-emerald-50 p-6 rounded-2xl shadow-inner">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="mb-4 sm:mb-0">
            <h2 className="text-3xl font-bold text-emerald-900">Recipe Ideas</h2>
            <p className="text-emerald-700 mt-1">AI-powered suggestions based on your pantry!</p>
        </div>
        <button
          onClick={onGenerateRecipes}
          disabled={isLoading || !hasItems}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-emerald-300 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? (
            <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Brewing Ideas...
            </>
          ) : (
            <>
              <Icon name="zap" className="w-5 h-5"/>
              Generate New Recipes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Oh no! Something went wrong.</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LoadingSkeleton />
            <LoadingSkeleton />
        </div>
      )}

      {!isLoading && !error && recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe, i) => <RecipeCard key={i} recipe={recipe} />)}
        </div>
      )}

      {!isLoading && !error && recipes.length === 0 && (
        <div className="text-center py-16 px-6 bg-emerald-100 rounded-2xl border-2 border-dashed border-emerald-300">
            <Icon name="chef-hat" className="mx-auto w-16 h-16 text-emerald-400" />
            <h3 className="mt-4 text-2xl font-bold text-emerald-800">Ready for some culinary inspiration?</h3>
            <p className="mt-2 text-md text-emerald-600">
                {hasItems ? 'Click the "Generate New Recipes" button to see what you can make!' : 'Add some items to your pantry first, then generate recipes.'}
            </p>
        </div>
      )}
    </div>
  );
};