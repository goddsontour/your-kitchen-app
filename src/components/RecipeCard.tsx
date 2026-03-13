import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, FileText, ShoppingCart, Trash2, ExternalLink, Star, Heart } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavourite?: (id: string) => void;
  onGeneratePDF: (recipe: Recipe) => void;
  onGenerateShoppingList: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onToggleFavourite,
  onGeneratePDF,
  onGenerateShoppingList,
  onDelete
}) => {
  return (
    <div className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
      
      {/* Floating elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-100/40 to-teal-100/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <h3 className="text-2xl font-bold text-slate-800 leading-tight group-hover:text-slate-900 transition-colors">
                {recipe.title}
              </h3>
            </div>
            {(recipe.source_url || recipe.source_name) && (
              <a
                href={recipe.source_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group/link ${!recipe.source_url ? 'pointer-events-none' : ''}`}
              >
                <ExternalLink className="w-4 h-4 group-hover/link:scale-110 transition-transform duration-300" />
                {recipe.source_name || 'View Original Recipe'}
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleFavourite?.(recipe.id)}
              className={`w-10 h-10 rounded-2xl transition-all duration-300 flex items-center justify-center group/favourite backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 ${
                recipe.isFavourite 
                  ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                  : 'bg-slate-100/80 text-slate-400 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 group-hover/favourite:scale-110 transition-transform duration-300 ${recipe.isFavourite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onDelete(recipe.id)}
              className="w-10 h-10 rounded-2xl bg-slate-100/80 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all duration-300 flex items-center justify-center group/delete backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110"
            >
              <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform duration-300" />
            </button>
          </div>
        </div>
        
        {/* Description */}
        {recipe.description && (
          <div className="mb-6">
            <p className="text-slate-600 leading-relaxed line-clamp-2 text-sm bg-slate-50/50 rounded-2xl p-4 border border-slate-200/50">
              {recipe.description}
            </p>
          </div>
        )}
        
        {/* Recipe Info */}
        <div className="flex flex-wrap gap-3 mb-6">
          {recipe.prep_time && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm border border-blue-200/50">
              <Clock className="w-4 h-4" />
              <span>Prep {recipe.prep_time} min</span>
            </div>
          )}
          {recipe.cook_time && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm border border-orange-200/50">
              <Clock className="w-4 h-4" />
              <span>Cook {recipe.cook_time} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm border border-purple-200/50">
              <Users className="w-4 h-4" />
              <span>{recipe.servings}</span>
            </div>
          )}
        </div>
        
        {/* Ingredients Preview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-emerald-500" />
              Ingredients
            </h4>
            <span className="text-sm font-bold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/50">
              {recipe.ingredients.length} items
            </span>
          </div>
          <div className="bg-gradient-to-br from-slate-50/80 to-white/80 rounded-2xl p-5 border border-slate-200/50 backdrop-blur-sm">
            <div className="space-y-2">
              {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                <div key={index} className="flex items-start gap-3 group/ingredient">
                  <span className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-2 flex-shrink-0 group-hover/ingredient:scale-125 transition-transform duration-300"></span>
                  <span className="line-clamp-1 text-slate-700 font-medium">{ingredient}</span>
                </div>
              ))}
              {recipe.ingredients.length > 3 && (
                <div className="text-sm text-slate-500 font-semibold pt-2 pl-5 flex items-center gap-2">
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <span>+{recipe.ingredients.length - 3} more ingredients</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Notes Section */}
        {recipe.notes && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Notes
              </h4>
            </div>
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl p-5 border border-amber-200/50 backdrop-blur-sm">
              <p className="text-slate-700 font-medium leading-relaxed">{recipe.notes}</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => onGeneratePDF(recipe)}
            className="flex-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-4 px-4 rounded-2xl hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] text-sm border border-orange-400/20 group/pdf"
          >
            <FileText className="w-4 h-4 group-hover/pdf:scale-110 transition-transform duration-300" />
            Export PDF
          </button>
          <button
            onClick={() => onGenerateShoppingList(recipe)}
            className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-4 px-4 rounded-2xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] text-sm border border-emerald-400/20 group/shop"
          >
            <ShoppingCart className="w-4 h-4 group-hover/shop:scale-110 transition-transform duration-300" />
            Shop List
          </button>
        </div>
      </div>
    </div>
  );
};