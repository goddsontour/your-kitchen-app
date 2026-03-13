import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, ShoppingCart, ArrowLeft, ChefHat, Download, Heart, Share2, ExternalLink } from 'lucide-react';
import { AllergenWarning } from './AllergenWarning';
import { getMatchedIngredients } from '../lib/allergenDetector';

interface RecipeDetailPageProps {
  recipe: Recipe;
  onBack: () => void;
  onToggleFavourite: (id: string) => void;
  onShare: (recipe: Recipe) => void;
  onGeneratePDF: (recipe: Recipe) => void;
  onGenerateShoppingList: (recipe: Recipe) => void;
  userProfile: { allergens: string[]; intolerances: string[] };
}

export const RecipeDetailPage: React.FC<RecipeDetailPageProps> = ({
  recipe,
  onBack,
  onToggleFavourite,
  onShare,
  onGeneratePDF,
  onGenerateShoppingList,
  userProfile
}) => {
  // Check for allergen matches
  const allergenMatches = getMatchedIngredients(recipe.ingredients, userProfile.allergens);
  const intoleranceMatches = getMatchedIngredients(recipe.ingredients, userProfile.intolerances);
  const allMatches = [...allergenMatches, ...intoleranceMatches];
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
        Back to Recipes
      </button>

      {/* Recipe Header */}
      <div className="kitchen-elevated p-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="kitchen-icon-tile">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-slate-800 leading-tight">
                  {recipe.title}
                </h1>
                <button
                  onClick={() => onToggleFavourite(recipe.id)}
                  className={`w-12 h-12 rounded-2xl transition-all duration-300 flex items-center justify-center group/favourite backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 ${
                    recipe.isFavourite 
                      ? 'bg-accent-soft text-accent hover:bg-accent-soft' 
                      : 'theme-panel-bg theme-text-secondary hover:bg-accent-soft hover:text-accent border theme-border'
                  }`}
                >
                  <Heart className={`w-6 h-6 group-hover/favourite:scale-110 transition-transform duration-300 ${recipe.isFavourite ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              {recipe.description && (
                <p className="text-secondary text-lg leading-relaxed mb-6 surface rounded-2xl p-4">
                  {recipe.description}
                </p>
              )}
              
              {/* Source Information */}
              {(recipe.source_name || recipe.source_url) && (
                <div className="mb-6">
                  <div className="surface rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                      <span className="text-sm font-bold text-primary">Recipe Source</span>
                    </div>
                    {recipe.source_name && (
                      <p className="text-primary font-medium mb-1">{recipe.source_name}</p>
                    )}
                    {recipe.source_url && (
                      <a
                        href={recipe.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline transition-colors hover:opacity-80"
                        style={{ color: 'var(--brand-primary)' }}
                      >
                        {recipe.source_url}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recipe Info */}
          <div className="flex flex-wrap gap-4 mb-8">
            {recipe.prep_time && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-6 py-3 rounded-2xl font-bold shadow-sm border border-blue-200/50">
                <Clock className="w-5 h-5" />
                <span>Prep {recipe.prep_time} min</span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 px-6 py-3 rounded-2xl font-bold shadow-sm border border-orange-200/50">
                <Clock className="w-5 h-5" />
                <span>Cook {recipe.cook_time} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-6 py-3 rounded-2xl font-bold shadow-sm border border-purple-200/50">
                <Users className="w-5 h-5" />
                <span>{recipe.servings}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onShare(recipe)}
              className="flex-1 kitchen-btn-secondary py-4 px-6 flex items-center justify-center gap-3 group"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Share Recipe
            </button>
            <button
              onClick={() => onGeneratePDF(recipe)}
              className="flex-1 bg-accent text-white py-4 px-6 rounded-2xl hover:bg-accent transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] group"
            >
              <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Export PDF
            </button>
            <button
              onClick={() => onGenerateShoppingList(recipe)}
              className="flex-1 kitchen-btn-primary py-4 px-6 flex items-center justify-center gap-3 group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Create Shopping List
            </button>
          </div>
        </div>
      </div>

      {/* Allergen Warning */}
      {allMatches.length > 0 && (
        <AllergenWarning matches={allMatches} />
      )}

      {/* Recipe Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingredients */}
        <div className="kitchen-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold theme-text flex items-center gap-3">
              <div className="w-6 h-6 bg-primary rounded-full"></div>
              Ingredients
            </h2>
            <span className="text-sm font-bold theme-text-secondary theme-panel-bg px-4 py-2 rounded-full border theme-border">
              {recipe.ingredients.length} items
            </span>
          </div>
          
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className={`flex items-start gap-3 group/ingredient p-2 rounded-xl transition-all duration-300 ${
                allMatches.some(match => match.matchedIngredients.includes(ingredient))
                  ? 'bg-accent-soft border border-accent'
                  : ''
              }`}>
                <span className="w-2 h-2 rounded-full mt-3 flex-shrink-0 group-hover/ingredient:scale-125 transition-transform duration-300" style={{ backgroundColor: 'var(--brand-primary)' }}></span>
                <span className={`font-medium leading-relaxed ${
                  allMatches.some(match => match.matchedIngredients.includes(ingredient))
                    ? 'text-accent font-bold'
                    : 'text-primary'
                }`}>{ingredient}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="kitchen-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold theme-text flex items-center gap-3">
              <div className="w-6 h-6 bg-primary rounded-full"></div>
              Method
            </h2>
            <span className="text-sm font-bold theme-text-secondary theme-panel-bg px-4 py-2 rounded-full border theme-border">
              {recipe.instructions.length} steps
            </span>
          </div>
          
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-4 group/instruction">
                <div className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg group-hover/instruction:scale-110 transition-transform duration-300">
                  {index + 1}
                </div>
                <p className="theme-text font-medium leading-relaxed pt-1">{instruction}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      {recipe.notes && (
        <div className="surface p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--accent-color, #D46A3A)' }}></div>
            <h2 className="text-2xl font-bold text-primary">Notes</h2>
          </div>
          <div className="surface-secondary rounded-2xl p-6">
            <p className="text-primary font-medium leading-relaxed">{recipe.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};