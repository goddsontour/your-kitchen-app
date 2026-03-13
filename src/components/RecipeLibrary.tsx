import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';
import { Clock, Users, ChefHat, Trash2, Eye, FileText, ShoppingCart, Heart, Search, Filter, Plus, ExternalLink } from 'lucide-react';

interface RecipeLibraryProps {
  recipes: Recipe[];
  onViewRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onToggleFavourite: (id: string) => void;
  onGeneratePDF?: (recipe: Recipe) => void;
  onGenerateShoppingList?: (recipe: Recipe) => void;
  onAddRecipe?: () => void;
  theme?: 'light' | 'dark';
}

type SortOption = 'newest' | 'oldest' | 'a-z' | 'favourites-first';

export const RecipeLibrary: React.FC<RecipeLibraryProps> = ({
  recipes,
  onViewRecipe,
  onDeleteRecipe,
  onToggleFavourite,
  onGeneratePDF,
  onGenerateShoppingList,
  onAddRecipe,
  theme = 'light'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Filter and sort recipes
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query)) ||
        recipe.source_name?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
        case 'oldest':
          return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'favourites-first':
          if (a.isFavourite && !b.isFavourite) return -1;
          if (!a.isFavourite && b.isFavourite) return 1;
          return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [recipes, searchQuery, sortBy]);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'a-z', label: 'A–Z' },
    { value: 'favourites-first', label: 'Favourites first' }
  ];

  // Empty state when no recipes exist
  if (recipes.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="kitchen-icon-tile-neutral w-24 h-24 mx-auto mb-6">
          <ChefHat className="w-12 h-12 text-primary-brand" />
        </div>
        <h3 className="text-2xl font-bold mb-3 theme-text">No recipes saved yet</h3>
        <p className="mb-6 max-w-md mx-auto leading-relaxed theme-text-secondary">
          Start building your culinary collection by adding your first recipe
        </p>
        {onAddRecipe && (
          <button
            onClick={onAddRecipe}
            className="kitchen-btn-primary py-3 px-6 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add Your First Recipe
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-4xl font-bold mb-2 theme-text">Recipes</h2>
          <p className="text-lg theme-text-secondary">
            Browse and manage your saved recipes
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 theme-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients, or sources..."
              className="kitchen-input w-full pl-12 pr-4 py-2.5 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* No Results State */}
      {filteredAndSortedRecipes.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <div className="kitchen-icon-tile-neutral w-20 h-20 mx-auto mb-4">
            <Search className="w-10 h-10 text-primary-brand" />
          </div>
          <h3 className="text-xl font-bold mb-2 theme-text">No recipes found</h3>
          <p className="mb-4 theme-text-secondary">
            Try adjusting your search terms or browse all recipes
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="kitchen-btn-primary py-2 px-4"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Recipe Grid */}
      {filteredAndSortedRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="group surface p-4 cursor-pointer relative overflow-hidden hover:surface-secondary transition-all duration-300"
              onClick={() => onViewRecipe(recipe)}
            >
              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavourite(recipe.id);
                  }}
                  className={`w-7 h-7 rounded-lg transition-all duration-300 flex items-center justify-center group/favourite backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 ${recipe.isFavourite
                      ? 'bg-accent-soft text-accent'
                      : 'surface text-secondary hover:bg-accent-soft hover:text-accent'
                    }`}
                >
                  <Heart className={`w-3.5 h-3.5 group-hover/favourite:scale-110 transition-transform duration-300 ${recipe.isFavourite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRecipe(recipe.id);
                  }}
                  className="w-7 h-7 rounded-lg theme-panel-bg hover:bg-red-50 theme-text-secondary hover:text-red-500 transition-all duration-300 flex items-center justify-center group/delete border theme-border hover:shadow-sm hover:scale-110"
                >
                  <Trash2 className="w-3.5 h-3.5 group-hover/delete:scale-110 transition-transform duration-300" />
                </button>
              </div>

              <div className="relative z-10">
                {/* Recipe Title */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold theme-text leading-tight group-hover:text-primary-brand transition-colors line-clamp-2 mb-1.5">
                    {recipe.title}
                  </h3>
                  {recipe.description && (
                    <p className="theme-text-secondary text-sm line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                  )}
                </div>

                {/* Recipe Info */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {recipe.prep_time && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border border-blue-200/50">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Prep {recipe.prep_time}</span>
                    </div>
                  )}
                  {recipe.cook_time && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border border-orange-200/50">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Cook {recipe.cook_time}</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border border-purple-200/50">
                      <Users className="w-2.5 h-2.5" />
                      <span>{recipe.servings}</span>
                    </div>
                  )}
                </div>

                {/* Source */}
                {recipe.source_name && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-xs theme-text-secondary">
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span className="font-medium truncate">{recipe.source_name}</span>
                    </div>
                  </div>
                )}

                {/* Recipe Stats */}
                <div className="mb-3">
                  <div className="surface-secondary rounded-lg p-2">
                    <p className="text-xs font-medium text-muted">
                      {recipe.ingredients.length} ingredients • {recipe.instructions.length} steps
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewRecipe(recipe);
                    }}
                    className="flex-1 bg-primary text-white py-1.5 px-2.5 rounded-lg hover:bg-primary-hover transition-all duration-300 flex items-center justify-center gap-1 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs group/view"
                  >
                    <Eye className="w-2.5 h-2.5 group-hover/view:scale-110 transition-transform duration-300" />
                    View
                  </button>

                  {(onGeneratePDF || onGenerateShoppingList) && (
                    <>
                      {onGeneratePDF && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onGeneratePDF(recipe);
                          }}
                          className="bg-accent text-white py-1.5 px-2.5 rounded-lg hover:bg-accent transition-all duration-300 flex items-center justify-center font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs group/pdf"
                        >
                          <FileText className="w-2.5 h-2.5 group-hover/pdf:scale-110 transition-transform duration-300" />
                        </button>
                      )}
                      {onGenerateShoppingList && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateShoppingList(recipe);
                          }}
                          className="bg-primary text-white py-1.5 px-2.5 rounded-lg hover:bg-primary-hover transition-all duration-300 flex items-center justify-center font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs group/shop"
                        >
                          <ShoppingCart className="w-2.5 h-2.5 group-hover/shop:scale-110 transition-transform duration-300" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};