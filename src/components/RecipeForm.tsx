import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, ChefHat, Clock, Users, FileText, Sparkles, Copy, Edit3, ArrowRight, Wand2, ArrowLeft } from 'lucide-react';
import { ScrapedRecipe } from '../types';
import { parseRecipeFromText } from '../lib/recipeParser';

interface RecipeFormData {
  title: string;
  description: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  ingredients: string;
  instructions: string;
  notes: string;
  source_name: string;
  source_url: string;
}

interface RecipeFormProps {
  onSubmit: (recipe: ScrapedRecipe) => void;
  isLoading?: boolean;
  onBack?: () => void;
}

type WorkflowType = 'select' | 'paste' | 'manual';

export const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, isLoading, onBack }) => {
  const [workflow, setWorkflow] = useState<WorkflowType>('select');
  const [pastedText, setPastedText] = useState('');
  const [parsedRecipe, setParsedRecipe] = useState<Partial<ScrapedRecipe> | null>(null);
  const [isParsingMode, setIsParsingMode] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RecipeFormData>({
    defaultValues: {
      title: '',
      description: '',
      prep_time: '',
      cook_time: '',
      servings: '',
      ingredients: '',
      instructions: '',
      notes: '',
      source_name: '',
      source_url: ''
    }
  });

  const handlePasteWorkflow = () => {
    if (!pastedText.trim()) {
      alert('Please paste some recipe text first');
      return;
    }

    // Parse the pasted text
    const parsed = parseRecipeFromText(pastedText);
    setParsedRecipe(parsed);

    // Populate the form with parsed data
    setValue('title', parsed.title || '');
    setValue('description', parsed.description || '');
    setValue('prep_time', parsed.prep_time?.toString() || '');
    setValue('cook_time', parsed.cook_time?.toString() || '');
    setValue('servings', parsed.servings?.toString() || '');
    setValue('ingredients', parsed.ingredients?.join('\n') || '');
    setValue('instructions', parsed.instructions?.join('\n') || '');
    setValue('notes', parsed.notes || '');

    setIsParsingMode(true);
    setWorkflow('manual'); // Switch to manual form for editing
  };

  const onFormSubmit = (data: RecipeFormData) => {
    // Parse ingredients and instructions from text areas
    const ingredients = data.ingredients
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const instructions = data.instructions
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const recipe: ScrapedRecipe = {
      title: data.title,
      description: data.description || undefined,
      ingredients: ingredients.length > 0 ? ingredients : ['No ingredients specified'],
      instructions: instructions.length > 0 ? instructions : ['No instructions specified'],
      prep_time: data.prep_time?.trim() ? Number(data.prep_time.trim()) : undefined,
      cook_time: data.cook_time?.trim() ? Number(data.cook_time.trim()) : undefined,
      servings: data.servings?.trim() ? Number(data.servings.trim()) : undefined,
      notes: data.notes || undefined
    };

    onSubmit(recipe);
    reset();
    setWorkflow('select');
    setPastedText('');
    setParsedRecipe(null);
    setIsParsingMode(false);
  };

  const resetToSelection = () => {
    setWorkflow('select');
    setPastedText('');
    setParsedRecipe(null);
    setIsParsingMode(false);
    reset();
  };

  // Workflow Selection Screen
  if (workflow === 'select') {
    return (
      <div className="surface p-6">
        {/* Header */}
        <div className="text-center mb-6">
          {onBack && (
            <div className="flex items-center mb-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-secondary hover:text-primary font-semibold transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                Back
              </button>
            </div>
          )}
          <div className="icon-tile mx-auto mb-3">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary mb-2">Create Recipe Manually</h3>
          <p className="text-secondary text-sm">Build your recipe step by step</p>
        </div>

        {/* Workflow Options */}
        <div className="space-y-3">
          <button
            onClick={() => setWorkflow('paste')}
            className="w-full p-4 surface border-2 hover:shadow-sm transition-all duration-300 text-left group"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <Copy className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary mb-1">Paste Recipe Text</h4>
                <p className="text-secondary text-xs">Copy and paste a recipe from any website or document</p>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" style={{ color: 'var(--brand-primary)' }} />
            </div>
          </button>

          <button
            onClick={() => setWorkflow('manual')}
            className="w-full p-4 surface border-2 hover:shadow-sm transition-all duration-300 text-left group"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary mb-1">Manual Entry</h4>
                <p className="text-secondary text-xs">Enter recipe details manually using a structured form</p>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" style={{ color: 'var(--brand-primary)' }} />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Paste Recipe Text Screen
  if (workflow === 'paste') {
    return (
      <div className="surface p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="icon-tile mx-auto mb-3">
            <Copy className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">Paste Recipe Text</h3>
          <p className="text-secondary text-sm">Copy and paste your recipe content below</p>
        </div>

        {/* Paste Area */}
        <div className="mb-6">
          <label className="block font-bold text-primary mb-3 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
            Recipe Content
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={12}
            className="input-field w-full resize-none font-mono text-sm"
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
          <p className="text-xs text-secondary mt-2">
            Paste any recipe text - the app will extract the title, ingredients, instructions, and other details automatically
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePasteWorkflow}
            disabled={!pastedText.trim()}
            className="flex-1 btn-primary py-3 px-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="w-4 h-4" />
            Parse Recipe
          </button>
          <button
            onClick={resetToSelection}
            className="btn-secondary px-4 py-3 text-sm"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Manual Entry Form (also used after parsing)
  return (
    <div className="surface p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="icon-tile mx-auto mb-3">
          <ChefHat className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">
          {isParsingMode ? 'Review & Edit Recipe' : 'Create New Recipe'}
        </h3>
        <p className="text-secondary text-sm">
          {isParsingMode ? 'Review the parsed content and make any adjustments' : 'Fill in the details to add your recipe'}
        </p>
        {isParsingMode && (
          <div className="mt-3 p-3 rounded-2xl border" style={{ backgroundColor: 'rgba(47, 125, 92, 0.1)', borderColor: 'var(--brand-primary)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--brand-primary)' }}>
              ✨ Recipe content has been automatically extracted and populated below. Review and edit as needed.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-bold text-primary mb-2 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
            Recipe Title *
          </label>
          <input
            {...register('title', { required: 'Recipe title is required' })}
            className="input-field w-full"
            placeholder="Enter your recipe title"
          />
          {errors.title && <p className="text-xs mt-1 font-semibold" style={{ color: '#D46A3A' }}>{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block font-bold text-primary mb-2 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
            Description
          </label>
          <textarea
            {...register('description')}
            rows={2}
            className="input-field w-full resize-none"
            placeholder="Brief description of your recipe"
          />
        </div>

        {/* Recipe Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-primary mb-2 text-xs flex items-center gap-2">
              <Clock className="w-3 h-3" style={{ color: 'var(--brand-primary)' }} />
              Prep Time
            </label>
            <input
              type="text"
              {...register('prep_time')}
              className="input-field w-full text-sm"
              placeholder="e.g. 15 mins"
            />
          </div>
          <div>
            <label className="block font-bold text-primary mb-2 text-xs flex items-center gap-2">
              <Clock className="w-3 h-3" style={{ color: 'var(--brand-primary)' }} />
              Cook Time
            </label>
            <input
              type="text"
              {...register('cook_time')}
              className="input-field w-full text-sm"
              placeholder="e.g. 25 mins"
            />
          </div>
          <div>
            <label className="block font-bold text-primary mb-2 text-xs flex items-center gap-2">
              <Users className="w-3 h-3" style={{ color: 'var(--brand-primary)' }} />
              Servings
            </label>
            <input
              type="text"
              {...register('servings')}
              className="input-field w-full text-sm"
              placeholder="e.g. Serves 4"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block font-bold text-primary mb-2 text-sm flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }}></div>
            Ingredients *
          </label>
          <textarea
            {...register('ingredients', { required: 'Ingredients are required' })}
            rows={6}
            className="input-field w-full resize-none font-mono text-sm"
            placeholder="Enter each ingredient on a new line:

2 cups all-purpose flour
1 tsp baking soda
1 cup butter, softened
2 large eggs
1 tsp vanilla extract"
          />
          {errors.ingredients && <p className="text-xs mt-1 font-semibold" style={{ color: '#D46A3A' }}>{errors.ingredients.message}</p>}
          <p className="text-xs text-secondary mt-1">Enter each ingredient on a separate line</p>
        </div>

        {/* Instructions */}
        <div>
          <label className="block font-bold text-primary mb-2 text-sm flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }}></div>
            Method / Instructions *
          </label>
          <textarea
            {...register('instructions', { required: 'Instructions are required' })}
            rows={8}
            className="input-field w-full resize-none font-mono text-sm"
            placeholder="Enter each step on a new line:

Preheat oven to 375°F (190°C)
Mix flour and baking soda in a bowl
Cream butter until light and fluffy
Beat in eggs and vanilla
Gradually mix in flour mixture
Bake for 10-12 minutes until golden"
          />
          {errors.instructions && <p className="text-xs mt-1 font-semibold" style={{ color: '#D46A3A' }}>{errors.instructions.message}</p>}
          <p className="text-xs text-secondary mt-1">Enter each step on a separate line</p>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-bold text-primary mb-2 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
            Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="input-field w-full resize-none"
            placeholder="Any additional notes, tips, or variations for this recipe..."
          />
        </div>

        {/* Source Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-primary mb-2 text-sm flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }}></div>
              Source Name (Optional)
            </label>
            <input
              type="text"
              {...register('source_name')}
              className="input-field w-full"
              placeholder="e.g. BBC Good Food, Grandma's Recipe"
            />
          </div>
          <div>
            <label className="block font-bold text-primary mb-2 text-sm flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }}></div>
              Source URL (Optional)
            </label>
            <input
              type="url"
              {...register('source_url')}
              className="input-field w-full"
              placeholder="https://example.com/recipe"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 btn-primary py-3 px-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Recipe...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Recipe
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetToSelection}
            className="btn-secondary px-4 py-3 text-sm"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};