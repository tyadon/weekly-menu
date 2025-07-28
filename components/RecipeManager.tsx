'use client';

import { useState, useEffect } from 'react';
import type { SavedRecipe } from '@/types/menu';

const defaultCategories = {
  lunch: ['salad', 'wrap', 'bowl', 'comfort', 'pasta', 'asian', 'soup'],
  dinner: ['seafood', 'asian', 'mexican', 'pasta', 'grill', 'comfort', 'vegetarian'],
  both: ['salad', 'wrap', 'bowl', 'comfort', 'pasta', 'asian', 'soup', 'seafood', 'mexican', 'grill', 'vegetarian']
};

const categoryColors = {
  salad: 'bg-green-100 text-green-700 border-green-200',
  wrap: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  bowl: 'bg-purple-100 text-purple-700 border-purple-200',
  pasta: 'bg-red-100 text-red-700 border-red-200',
  asian: 'bg-orange-100 text-orange-700 border-orange-200',
  mexican: 'bg-pink-100 text-pink-700 border-pink-200',
  seafood: 'bg-blue-100 text-blue-700 border-blue-200',
  grill: 'bg-amber-100 text-amber-700 border-amber-200',
  comfort: 'bg-gray-100 text-gray-700 border-gray-200',
  soup: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  vegetarian: 'bg-lime-100 text-lime-700 border-lime-200'
};

interface RecipeManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeManager({ isOpen, onClose }: RecipeManagerProps) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [activeTab, setActiveTab] = useState<'lunch' | 'dinner' | 'both'>('lunch');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    cookingTime: '30 min',
    servings: 4,
    category: 'comfort',
    type: 'lunch' as 'lunch' | 'dinner' | 'both'
  });

  // Load recipes from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('savedRecipes');
      if (stored) {
        setRecipes(JSON.parse(stored));
      }
    }
  }, [isOpen]);

  const saveRecipes = (newRecipes: SavedRecipe[]) => {
    setRecipes(newRecipes);
    localStorage.setItem('savedRecipes', JSON.stringify(newRecipes));
  };

  const addRecipe = () => {
    if (!newRecipe.title.trim() || !newRecipe.ingredients.trim() || !newRecipe.instructions.trim()) return;

    const recipe: SavedRecipe = {
      id: Date.now().toString(),
      title: newRecipe.title.trim(),
      ingredients: newRecipe.ingredients.trim(),
      instructions: newRecipe.instructions.trim(),
      cookingTime: newRecipe.cookingTime,
      servings: newRecipe.servings,
      category: newRecipe.category,
      type: newRecipe.type,
      createdAt: new Date().toISOString(),
      prepTime: newRecipe.cookingTime // For backwards compatibility
    };

    const updated = [...recipes, recipe];
    saveRecipes(updated);
    
    setNewRecipe({
      title: '',
      ingredients: '',
      instructions: '',
      cookingTime: '30 min',
      servings: 4,
      category: 'comfort',
      type: activeTab === 'both' ? 'both' : activeTab
    });
  };

  const updateRecipe = (id: string, updates: Partial<SavedRecipe>) => {
    const updated = recipes.map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    saveRecipes(updated);
    setEditingId(null);
  };

  const deleteRecipe = (id: string) => {
    const updated = recipes.filter(r => r.id !== id);
    saveRecipes(updated);
    setViewingId(null);
  };

  const filteredRecipes = recipes.filter(r => 
    activeTab === 'both' ? true : r.type === activeTab || r.type === 'both'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-6xl mx-4 rounded-3xl shadow-2xl max-h-[95vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recipe Manager</h2>
              <p className="text-sm text-gray-600 mt-1">Save, organize, and reuse your favorite recipes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(['lunch', 'dinner', 'both'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab === 'both' ? 'All Recipes' : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Recipes`}
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {tab === 'both' 
                  ? recipes.length 
                  : recipes.filter(r => r.type === tab || r.type === 'both').length
                }
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add New Recipe */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Recipe</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Title *</label>
                  <input
                    type="text"
                    value={newRecipe.title}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter recipe name..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Time</label>
                    <select
                      value={newRecipe.cookingTime}
                      onChange={(e) => setNewRecipe(prev => ({ ...prev, cookingTime: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all"
                    >
                      <option value="15 min">15 min</option>
                      <option value="20 min">20 min</option>
                      <option value="30 min">30 min</option>
                      <option value="45 min">45 min</option>
                      <option value="1 hour">1 hour</option>
                      <option value="1.5 hours">1.5 hours</option>
                      <option value="2+ hours">2+ hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Servings</label>
                    <input
                      type="number"
                      value={newRecipe.servings}
                      onChange={(e) => setNewRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 4 }))}
                      min="1"
                      max="20"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newRecipe.category}
                      onChange={(e) => setNewRecipe(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all"
                    >
                      {defaultCategories.both.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['lunch', 'dinner', 'both'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewRecipe(prev => ({ ...prev, type }))}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          newRecipe.type === type
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {type === 'both' ? 'Both' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients *</label>
                  <textarea
                    value={newRecipe.ingredients}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, ingredients: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all resize-none"
                    rows={5}
                    placeholder="• 2 cups flour&#10;• 1 cup milk&#10;• 2 eggs&#10;• Salt to taste"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions *</label>
                  <textarea
                    value={newRecipe.instructions}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all resize-none"
                    rows={10}
                    placeholder="1. Preheat oven to 350°F&#10;2. Mix dry ingredients...&#10;3. Add wet ingredients...&#10;4. Bake for 25 minutes"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recipe Tips
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Save recipes you use often for quick reuse</li>
                    <li>• Mark as "Both" if suitable for lunch or dinner</li>
                    <li>• Use bullet points for easy-to-read ingredients</li>
                    <li>• Number your instruction steps</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={addRecipe}
                disabled={!newRecipe.title.trim() || !newRecipe.ingredients.trim() || !newRecipe.instructions.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Save Recipe</span>
              </button>
            </div>
          </div>

          {/* Existing Recipes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Saved Recipes ({filteredRecipes.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onEdit={() => setEditingId(recipe.id)}
                  onView={() => setViewingId(recipe.id)}
                  onDelete={() => deleteRecipe(recipe.id)}
                  isEditing={editingId === recipe.id}
                  onSave={(updates) => updateRecipe(recipe.id, updates)}
                  onCancelEdit={() => setEditingId(null)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {recipes.length} total recipes saved
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Recipe View Modal */}
      {viewingId && (
        <RecipeViewModal
          recipe={recipes.find(r => r.id === viewingId)!}
          onClose={() => setViewingId(null)}
          onEdit={() => {
            setViewingId(null);
            setEditingId(viewingId);
          }}
          onDelete={() => deleteRecipe(viewingId)}
        />
      )}
    </div>
  );
}

interface RecipeCardProps {
  recipe: SavedRecipe;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  isEditing: boolean;
  onSave: (updates: Partial<SavedRecipe>) => void;
  onCancelEdit: () => void;
}

function RecipeCard({ recipe, onEdit, onView, onDelete, isEditing, onSave, onCancelEdit }: RecipeCardProps) {
  const [editData, setEditData] = useState({
    title: recipe.title,
    cookingTime: recipe.cookingTime || '30 min',
    servings: recipe.servings || 4,
    category: recipe.category,
    type: recipe.type
  });

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="card p-6 space-y-4">
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
          className="input-field text-sm font-semibold"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={editData.cookingTime}
            onChange={(e) => setEditData(prev => ({ ...prev, cookingTime: e.target.value }))}
            className="input-field text-xs"
          >
            <option value="15 min">15 min</option>
            <option value="20 min">20 min</option>
            <option value="30 min">30 min</option>
            <option value="45 min">45 min</option>
            <option value="1 hour">1 hour</option>
          </select>
          <input
            type="number"
            value={editData.servings}
            onChange={(e) => setEditData(prev => ({ ...prev, servings: parseInt(e.target.value) || 4 }))}
            className="input-field text-xs"
            min="1" max="20"
          />
        </div>
        <select
          value={editData.category}
          onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
          className="input-field text-xs"
        >
          {defaultCategories.both.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="flex-1 btn-primary text-sm py-2 px-3"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="flex-1 btn-secondary text-sm py-2 px-3"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover p-6 cursor-pointer group">
      <div onClick={onView}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold ${
            categoryColors[recipe.category as keyof typeof categoryColors] || categoryColors.comfort
          }`}>
            {recipe.title.charAt(0)}
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <h4 className="font-semibold text-gray-900 mb-3 text-base">{recipe.title}</h4>
        <div className="text-sm text-gray-500 space-y-2">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {recipe.cookingTime} • {recipe.servings} servings
          </div>
          <div className="flex items-center justify-between">
            <span className="capitalize">{recipe.category}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              recipe.type === 'lunch' ? 'bg-yellow-100 text-yellow-800' :
              recipe.type === 'dinner' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {recipe.type === 'both' ? 'Both' : recipe.type}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecipeViewModalProps {
  recipe: SavedRecipe;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function RecipeViewModal({ recipe, onClose, onEdit, onDelete }: RecipeViewModalProps) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl mx-4 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{recipe.title}</h3>
            <div className="text-gray-500 mt-2 flex items-center space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.cookingTime}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {recipe.servings} servings
              </span>
              <span className="capitalize bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {recipe.category}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onEdit}
              className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Ingredients
              </h4>
              <div className="card p-6 bg-gray-50 border-gray-100">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{recipe.ingredients}</pre>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Instructions
              </h4>
              <div className="card p-6 bg-gray-50 border-gray-100">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{recipe.instructions}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={onDelete}
              className="px-6 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
            >
              Delete Recipe
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 