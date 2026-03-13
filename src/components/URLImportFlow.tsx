import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Globe, ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { ScrapedRecipe } from '../types';
import { RecipeScraper } from '../lib/recipeScraper';

interface URLImportFlowProps {
  onSubmit: (recipe: ScrapedRecipe) => void;
  onBack: () => void;
  isLoading?: boolean;
}

interface URLFormData {
  url: string;
}

export const URLImportFlow: React.FC<URLImportFlowProps> = ({ onSubmit, onBack, isLoading = false }) => {
  const [importedRecipe, setImportedRecipe] = useState<ScrapedRecipe | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<URLFormData>();
  
  const handleURLImport = async (data: URLFormData) => {
    setIsImporting(true);
    setImportError(null);
    
    try {
      const recipe = await RecipeScraper.scrapeRecipe(data.url);
      
      setImportedRecipe({
        ...recipe,
        source_url: data.url,
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import recipe');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleSaveRecipe = () => {
    if (importedRecipe) {
      onSubmit(importedRecipe);
    }
  };
  
  if (importedRecipe) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setImportedRecipe(null)}
            className="flex items-center gap-2 theme-text-secondary hover:theme-text font-semibold transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to URL
          </button>
        </div>

        <div className="theme-card backdrop-blur-xl rounded-3xl shadow-xl border theme-border-subtle p-8">
        <div className="surface-elevated p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold theme-text mb-2">Recipe Imported Successfully</h3>
            <p className="theme-text-secondary">Review and edit the details before saving</p>
          </div>

          {/* Recipe Preview */}
          <div className="space-y-6">
            <div>
              <label className="block font-bold theme-text mb-2 text-sm">Recipe Title</label>
              <input
                type="text"
                value={importedRecipe.title}
                onChange={(e) => setImportedRecipe(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="kitchen-input w-full"
              />
            </div>

            {importedRecipe.description && (
              <div>
                <label className="block font-bold theme-text mb-2 text-sm">Description</label>
                <textarea
                  value={importedRecipe.description}
                  onChange={(e) => setImportedRecipe(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="kitchen-input w-full resize-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {importedRecipe.prep_time && (
                <div>
                  <label className="block font-bold theme-text mb-2 text-xs">Prep Time</label>
                  <input
                    type="text"
                    value={importedRecipe.prep_time}
                    onChange={(e) => setImportedRecipe(prev => prev ? { ...prev, prep_time: Number(e.target.value) || undefined } : null)}
                    className="kitchen-input w-full text-sm"
                  />
                </div>
              )}
              {importedRecipe.cook_time && (
                <div>
                  <label className="block font-bold theme-text mb-2 text-xs">Cook Time</label>
                  <input
                    type="text"
                    value={importedRecipe.cook_time}
                    onChange={(e) => setImportedRecipe(prev => prev ? { ...prev, cook_time: Number(e.target.value) || undefined } : null)}
                    className="kitchen-input w-full text-sm"
                  />
                </div>
              )}
              {importedRecipe.servings && (
                <div>
                  <label className="block font-bold theme-text mb-2 text-xs">Servings</label>
                  <input
                    type="text"
                    value={importedRecipe.servings}
                    onChange={(e) => setImportedRecipe(prev => prev ? { ...prev,  } : null)}
                    className="kitchen-input w-full text-sm"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold theme-text mb-2 text-sm">Ingredients</label>
              <textarea
                value={importedRecipe.ingredients.join('\n')}
                onChange={(e) => setImportedRecipe(prev => prev ? { ...prev, ingredients: e.target.value.split('\n').filter(Boolean) } : null)}
                rows={8}
                className="w-full px-4 py-3 border-2 theme-border rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 theme-text resize-none theme-panel-bg backdrop-blur-sm shadow-sm font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-2 text-sm">Instructions</label>
              <textarea
                value={importedRecipe.instructions.join('\n')}
                onChange={(e) => setImportedRecipe(prev => prev ? { ...prev, instructions: e.target.value.split('\n').filter(Boolean) } : null)}
                rows={10}
                className="w-full px-4 py-3 border-2 theme-border rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 theme-text resize-none theme-panel-bg backdrop-blur-sm shadow-sm font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSaveRecipe}
              disabled={isLoading}
              className="flex-1 kitchen-btn-primary py-4 px-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving Recipe...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Save Recipe
                </>
              )}
            </button>
            <button
              onClick={onBack}
              className="kitchen-btn-secondary px-6 py-4"
            >
              Cancel
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 theme-text-secondary hover:theme-text font-semibold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          Back
        </button>
      </div>

      <div className="theme-card backdrop-blur-xl rounded-3xl shadow-xl border theme-border-subtle p-8">
        <div className="surface-elevated p-8">
          <div className="text-center mb-6">
            <div className="kitchen-icon-tile mx-auto mb-3">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold theme-text mb-2">Import Recipe from Website</h3>
            <p className="theme-text-secondary">Paste a recipe URL to automatically import ingredients and instructions</p>
          </div>

          {importError && (
            <div className="mb-6 p-4 bg-accent-soft border border-accent rounded-2xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <p className="text-accent font-medium">{importError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(handleURLImport)} className="space-y-6">
            <div>
              <label className="block font-bold theme-text mb-3 text-sm">Recipe URL</label>
              <input
                {...register('url', { 
                  required: 'Please enter a recipe URL',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL starting with http:// or https://'
                  }
                })}
                type="url"
                className="kitchen-input w-full py-4"
              />
              {errors.url && <p className="text-accent text-sm mt-2 font-semibold">{errors.url.message}</p>}
              <p className="text-xs theme-text-secondary mt-2">
                Paste a URL from popular recipe websites like BBC Good Food, AllRecipes, Food Network, etc.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isImporting}
                className="flex-1 kitchen-btn-primary py-4 px-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Importing Recipe...
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5" />
                    Import Recipe
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="kitchen-btn-secondary px-6 py-4"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};