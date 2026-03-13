import React from 'react';
import { Recipe } from '../types';
import { Heart, ChefHat } from 'lucide-react';
import { RecipeLibrary } from './RecipeLibrary';

interface FavouritesPageProps {
  recipes: Recipe[];
  onViewRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onToggleFavourite: (id: string) => void;
  onGeneratePDF?: (recipe: Recipe) => void;
  onGenerateShoppingList?: (recipe: Recipe) => void;
}

export const FavouritesPage: React.FC<FavouritesPageProps> = ({
  recipes,
  onViewRecipe,
  onDeleteRecipe,
  onToggleFavourite,
  onGeneratePDF,
  onGenerateShoppingList
}) => {
  const favouriteRecipes = recipes.filter(recipe => recipe.isFavourite);

  if (favouriteRecipes.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="kitchen-icon-tile-neutral w-24 h-24 mx-auto mb-6">
          <Heart className="w-12 h-12 text-accent" />
        </div>
        <h3 className="text-2xl font-bold theme-text mb-3">No favourite recipes yet</h3>
        <p className="theme-text-secondary mb-6 max-w-md mx-auto leading-relaxed">
          Start adding recipes to your favourites by clicking the heart icon on any recipe
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="kitchen-icon-tile">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <h2 className="text-4xl font-bold theme-text">Favourite Recipes</h2>
        </div>
        <p className="theme-text-secondary text-lg">
          {favouriteRecipes.length} favourite recipe{favouriteRecipes.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Favourite Recipes Grid */}
      <RecipeLibrary
        recipes={favouriteRecipes}
        onViewRecipe={onViewRecipe}
        onDeleteRecipe={onDeleteRecipe}
        onToggleFavourite={onToggleFavourite}
        onGeneratePDF={onGeneratePDF}
        onGenerateShoppingList={onGenerateShoppingList}
      />
    </div>
  );
};