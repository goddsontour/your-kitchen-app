import React, { useState } from 'react';
import { Clipboard, ArrowLeft, Wand2, FileText } from 'lucide-react';
import { ScrapedRecipe } from '../types';
import { parseRecipeFromText } from '../lib/recipeParser';

interface PasteTextFlowProps {
  onSubmit: (recipe: ScrapedRecipe) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const PasteTextFlow: React.FC<PasteTextFlowProps> = ({ onSubmit, onBack, isLoading = false }) => {
  const [pastedText, setPastedText] = useState('');
  const [parsedRecipe, setParsedRecipe] = useState<ScrapedRecipe | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleParseText = async () => {
    if (!pastedText.trim()) return;

    setIsParsing(true);

    try {
      // Simulate parsing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const parsed = parseRecipeFromText(pastedText);

      setParsedRecipe({
        title: parsed.title || 'Pasted Recipe',
        description: parsed.description,
        ingredients: parsed.ingredients || ['No ingredients found'],
        instructions: parsed.instructions || ['No instructions found'],
        prep_time: parsed.prep_time,
        cook_time: parsed.cook_time,
        servings: parsed.servings,
        notes: parsed.notes
      });
    } catch (error) {
      console.error('Failed to parse recipe text:', error);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveRecipe = () => {
    if (parsedRecipe) {
      onSubmit(parsedRecipe);
    }
  };

  if (parsedRecipe) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setParsedRecipe(null)}
            className="flex items-center gap-2 theme-text-secondary hover:theme-text font-semibold transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Text
          </button>
        </div>

        <div className="kitchen-elevated p-8">
          <div className="surface-elevated p-8">
            <div className="text-center mb-6">
              <div className="kitchen-icon-tile mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold theme-text mb-2">Recipe Parsed Successfully</h3>
              <p className="theme-text-secondary">Review and edit the extracted details before saving</p>
            </div>

            {/* Recipe Preview */}
            <div className="space-y-6">
              <div>
                <label className="block font-bold theme-text mb-2 text-sm">Recipe Title</label>
                <input
                  type="text"
                  value={parsedRecipe.title}
                  onChange={(e) => setParsedRecipe(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="kitchen-input w-full"
                />
              </div>

              {parsedRecipe.description && (
                <div>
                  <label className="block font-bold theme-text mb-2 text-sm">Description</label>
                  <textarea
                    value={parsedRecipe.description}
                    onChange={(e) => setParsedRecipe(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="kitchen-input w-full resize-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {parsedRecipe.prep_time !== undefined && (
                  <div>
                    <label className="block font-bold theme-text mb-2 text-xs">Prep Time</label>
                    <input
                      type="text"
                      value={parsedRecipe.prep_time?.toString() || ''}
                      onChange={(e) => {
                        setParsedRecipe(prev =>
                          prev
                            ? { ...prev, prep_time: Number(e.target.value) || undefined }
                            : null
                        )
                      }}
                      className="kitchen-input w-full text-sm"
                    />
                  </div>
                )}
                {parsedRecipe.cook_time !== undefined && (
                  <div>
                    <label className="block font-bold theme-text mb-2 text-xs">Cook Time</label>
                    <input
                      type="text"
                      value={parsedRecipe.cook_time?.toString() || ''}
                      onChange={(e) => {
                        setParsedRecipe(prev =>
                          prev
                            ? { ...prev, cook_time: Number(e.target.value) || undefined }
                            : null
                        )
                      }}
                      className="kitchen-input w-full text-sm"
                    />
                  </div>
                )}
                {parsedRecipe.servings !== undefined && (
                  <div>
                    <label className="block font-bold theme-text mb-2 text-xs">Servings</label>
                    <input
                      type="text"
                      value={parsedRecipe.servings?.toString() || ''}
                      onChange={(e) => {
                        setParsedRecipe(prev =>
                          prev
                            ? { ...prev, servings: Number(e.target.value) || undefined }
                            : null
                        )
                      }}
                      className="kitchen-input w-full text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold theme-text mb-2 text-sm">Ingredients</label>
                <textarea
                  value={parsedRecipe.ingredients.join('\n')}
                  onChange={(e) => setParsedRecipe(prev => prev ? { ...prev, ingredients: e.target.value.split('\n').filter(Boolean) } : null)}
                  rows={8}
                  className="kitchen-input w-full resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold theme-text mb-2 text-sm">Instructions</label>
                <textarea
                  value={parsedRecipe.instructions.join('\n')}
                  onChange={(e) => setParsedRecipe(prev => prev ? { ...prev, instructions: e.target.value.split('\n').filter(Boolean) } : null)}
                  rows={10}
                  className="kitchen-input w-full resize-none font-mono text-sm"
                />
              </div>

              {parsedRecipe.notes && (
                <div>
                  <label className="block font-bold theme-text mb-2 text-sm">Notes</label>
                  <textarea
                    value={parsedRecipe.notes}
                    onChange={(e) => setParsedRecipe(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    rows={3}
                    className="kitchen-input w-full resize-none"
                  />
                </div>
              )}
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
                    <FileText className="w-5 h-5" />
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

      <div className="kitchen-elevated p-8">
        <div className="surface-elevated p-8">
          <div className="text-center mb-6">
            <div className="kitchen-icon-tile mx-auto mb-3">
              <Clipboard className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold theme-text mb-2">Paste Recipe Text</h3>
            <p className="theme-text-secondary">Copy and paste a full recipe from any website or document</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block font-bold theme-text mb-3 text-sm">Recipe Content</label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={15}
                className="kitchen-input w-full resize-none font-mono text-sm"
                placeholder="Paste your recipe here...

Example:
Chocolate Chip Cookies

A classic recipe for soft and chewy cookies

Prep time: 15 minutes
Cook time: 12 minutes
Serves: 24 cookies

Ingredients:
2 cups all-purpose flour
1 tsp baking soda
1 cup butter, softened
3/4 cup brown sugar
2 large eggs
2 cups chocolate chips

Instructions:
1. Preheat oven to 375°F
2. Mix flour and baking soda
3. Cream butter and sugar
4. Add eggs and mix well
5. Combine with flour mixture
6. Stir in chocolate chips
7. Bake for 10-12 minutes

Notes: Store in airtight container"
              />
              <p className="text-xs theme-text-secondary mt-2">
                Paste any recipe text - the app will automatically extract the title, ingredients, instructions, and other details
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleParseText}
                disabled={!pastedText.trim() || isParsing}
                className="flex-1 kitchen-btn-primary py-4 px-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isParsing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Parsing Recipe...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Parse Recipe
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
    </div>
  );
};