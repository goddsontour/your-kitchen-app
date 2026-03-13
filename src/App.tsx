import { useState, useEffect } from 'react';
import { Recipe, ShoppingListItem, ScrapedRecipe, UserProfile } from './types';
import { detectAllergens } from './lib/allergenDetector';
import { RecipeForm } from './components/RecipeForm';
import { AddRecipeModal } from './components/AddRecipeModal';
import { ShoppingListModal } from './components/ShoppingListModal';
import { Navigation } from './components/Navigation';
import { RecipeLibrary } from './components/RecipeLibrary';
import { RecipeDetailPage } from './components/RecipeDetailPage';
import { FavouritesPage } from './components/FavouritesPage';
import { UserProfileModal } from './components/UserProfileModal';
import { URLImportFlow } from './components/URLImportFlow';
import { PhotoScanFlow } from './components/PhotoScanFlow';
import { PasteTextFlow } from './components/PasteTextFlow';
import { generateRecipePDF, generateShoppingListPDF } from './lib/pdfGenerator';
import { ChefHat, Plus, BookOpen, Clock, Users } from 'lucide-react';

type Page = 'home' | 'add-recipe' | 'recipes' | 'favourites' | 'profile';
type AddRecipeMode = 'url' | 'photo' | 'paste' | 'manual' | null;

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [addRecipeMode, setAddRecipeMode] = useState<AddRecipeMode>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingListItems, setShoppingListItems] = useState<ShoppingListItem[]>([]);
  const [shoppingListName, setShoppingListName] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    allergens: [],
    intolerances: [],
    dietaryPreferences: [],
    theme: 'light'
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load recipes from localStorage on mount
  useEffect(() => {
    const savedRecipes = localStorage.getItem('nourishing-kitchen-recipes');
    if (savedRecipes) {
      try {
        setRecipes(JSON.parse(savedRecipes));
      } catch (error) {
        console.error('Failed to load recipes from localStorage:', error);
      }
    }
    
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem('nourishing-kitchen-profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Failed to load user profile from localStorage:', error);
      }
    }
  }, []);
  
  // Save recipes to localStorage whenever recipes change
  useEffect(() => {
    localStorage.setItem('nourishing-kitchen-recipes', JSON.stringify(recipes));
  }, [recipes]);
  
  // Save user profile to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem('nourishing-kitchen-profile', JSON.stringify(userProfile));
  }, [userProfile]);
  
  const addRecipe = async (recipeData: ScrapedRecipe) => {
    setIsLoading(true);
    try {
      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prep_time: recipeData.prep_time,
        cook_time: recipeData.cook_time,
        servings: recipeData.servings,
        source_url: recipeData.source_url,
        notes: recipeData.notes,
        isFavourite: false,
        detectedAllergens: detectAllergens(recipeData.ingredients),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setRecipes(prev => [newRecipe, ...prev]);
      setCurrentPage('recipes'); // Navigate to recipes page after adding
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteRecipe = async (id: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    // If we're viewing the deleted recipe, go back to recipes list
    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe(null);
    }
  };
  
  const toggleFavourite = (id: string) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === id 
        ? { ...recipe, isFavourite: !recipe.isFavourite }
        : recipe
    ));
    
    // Update selectedRecipe if it's the one being toggled
    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe(prev => prev ? { ...prev, isFavourite: !prev.isFavourite } : null);
    }
  };
  
  const shareRecipe = async (recipe: Recipe) => {
    const recipeText = `${recipe.title}\n\n${recipe.description ? recipe.description + '\n\n' : ''}Ingredients:\n${recipe.ingredients.join('\n')}\n\nInstructions:\n${recipe.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n')}${recipe.source_url ? `\n\nSource: ${recipe.source_url}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipeText,
          url: recipe.source_url || window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(recipeText);
        alert('Recipe copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy recipe:', error);
        alert('Failed to copy recipe to clipboard');
      }
    }
  };
  
  const generateIndividualShoppingList = (recipe: Recipe) => {
    const items: ShoppingListItem[] = recipe.ingredients.map((ingredient, index) => ({
      id: `${recipe.id}-${index}`,
      ingredient,
      quantity: '',
      recipe_ids: [recipe.id],
      checked: false
    }));
    
    setShoppingListItems(items);
    setShoppingListName(`${recipe.title} - Shopping List`);
    setShowShoppingList(true);
  };
  
  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentPage('recipes'); // Ensure we're on the recipes page when viewing a recipe
  };
  
  const handleBackToRecipes = () => {
    setSelectedRecipe(null);
    setCurrentPage('recipes'); // Stay on recipes page when going back
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    
    // Handle profile page
    if (page === 'profile') {
      setShowProfileModal(true);
      return;
    }
    
    // Handle add recipe page
    if (page === 'add-recipe') {
      setShowAddModal(true);
      return;
    }
    
    // Clear selected recipe when navigating away from recipes page
    if (page !== 'recipes' && page !== 'favourites') {
      setSelectedRecipe(null);
    }
  };
  
  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = userProfile.theme === 'light' ? 'dark' : 'light';
    setUserProfile(prev => ({ ...prev, theme: newTheme }));
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };
  
  // Apply theme on mount and when userProfile.theme changes
  useEffect(() => {
    if (userProfile.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [userProfile.theme]);
  
  const handleAddFlow = (type: 'url' | 'photo' | 'paste' | 'manual') => {
    setAddRecipeMode(type);
    setCurrentPage('add-recipe');
    setShowAddModal(false);
  };
  
  // Render different add recipe flows based on mode
  const renderAddRecipeFlow = () => {
    const handleBack = () => {
      setAddRecipeMode(null);
      setCurrentPage('home');
    };

    switch (addRecipeMode) {
      case 'url':
        return <URLImportFlow onSubmit={addRecipe} onBack={handleBack} isLoading={isLoading} />;
      
      case 'photo':
        return <PhotoScanFlow onSubmit={addRecipe} onBack={handleBack} isLoading={isLoading} />;
      
      case 'paste':
        return <PasteTextFlow onSubmit={addRecipe} onBack={handleBack} isLoading={isLoading} />;
      
      case 'manual':
        return (
          <div className="max-w-2xl mx-auto">
            <RecipeForm onSubmit={addRecipe} isLoading={isLoading} onBack={handleBack} />
          </div>
        );
      
      default:
        return <HomePage />;
    }
  };

  // Home Page
  const HomePage = () => (
    <div className="hero-container max-w-3xl mx-auto">
      {/* Hero Section */}
      <div>
        <h1 className="hero-heading">
          Welcome to your Recipe Collection
        </h1>
        <p className="hero-subtitle max-w-xl mx-auto">
          Organize your recipes, create shopping lists, and export PDFs
        </p>
      </div>

      {/* Call to Action */}
      <div className="action-card">
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleNavigate('add-recipe')}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Add Recipe
          </button>
          <button
            onClick={() => handleNavigate('recipes')}
            className="btn-secondary"
          >
            <BookOpen className="w-5 h-5" />
            View Recipes
          </button>
        </div>
        
        {/* Recipe Count */}
        <div className="text-center">
          <div className="recipe-badge">
            <ChefHat className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
            <span className="font-bold">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved
            </span>
          </div>
        </div>
      </div>

      {/* Recent Recipes Preview */}
      {recipes.length > 0 && (
        <div className="surface p-6">
          <h3 className="text-lg font-bold theme-text mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-brand" />
            Recent Recipes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.slice(0, 3).map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => {
                  setSelectedRecipe(recipe);
                  setCurrentPage('recipes');
                }}
                className="surface p-4 cursor-pointer group"
              >
                <h4 className="font-bold theme-text mb-2 line-clamp-1 group-hover:text-primary-brand transition-colors">
                  {recipe.title}
                </h4>
                <div className="flex items-center gap-3 text-sm theme-text-secondary">
                  {recipe.prep_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.prep_time}
                    </span>
                  )}
                  {recipe.servings && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {recipe.servings}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Determine which main content to render
  const renderMainContent = () => {
    // Recipe Detail Page (highest priority when selectedRecipe exists)
    if (selectedRecipe && (currentPage === 'recipes' || currentPage === 'favourites')) {
      return (
        <RecipeDetailPage
          recipe={selectedRecipe}
          onBack={handleBackToRecipes}
          onToggleFavourite={toggleFavourite}
          onShare={shareRecipe}
          onGeneratePDF={generateRecipePDF}
          onGenerateShoppingList={generateIndividualShoppingList}
          userProfile={userProfile}
        />
      );
    }

    // Other pages based on currentPage
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      
      case 'add-recipe':
        return (
          <div className="max-w-2xl mx-auto">
            <RecipeForm onSubmit={addRecipe} isLoading={isLoading} />
          </div>
        );
      
      case 'recipes':
        return (
          <RecipeLibrary
            recipes={recipes}
            onViewRecipe={handleViewRecipe}
            onDeleteRecipe={deleteRecipe}
            onToggleFavourite={toggleFavourite}
            onGeneratePDF={generateRecipePDF}
            onGenerateShoppingList={generateIndividualShoppingList}
            onAddRecipe={() => handleNavigate('add-recipe')}
            theme={userProfile.theme}
          />
        );
      
      case 'favourites':
        return (
          <FavouritesPage
            recipes={recipes}
            onViewRecipe={handleViewRecipe}
            onDeleteRecipe={deleteRecipe}
            onToggleFavourite={toggleFavourite}
            onGeneratePDF={generateRecipePDF}
            onGenerateShoppingList={generateIndividualShoppingList}
          />
        );
      
      default:
        return <HomePage />;
    }
  };
  return (
    <div className="app-root" data-theme={userProfile.theme}>
      {/* Modern geometric background */}
      <div className="absolute inset-0 overflow-hidden transition-opacity duration-300">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl bg-gradient-to-br from-emerald-200/20 to-teal-200/20 dark:from-emerald-900/5 dark:to-teal-900/5 transition-colors duration-300"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl bg-gradient-to-br from-blue-200/20 to-indigo-200/20 dark:from-blue-900/5 dark:to-indigo-900/5 transition-colors duration-300"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br from-purple-200/15 to-pink-200/15 dark:from-purple-900/3 dark:to-pink-900/3 transition-colors duration-300"></div>
      </div>
      
      <div className="relative z-10">
        {/* Navigation */}
        <Navigation 
          currentPage={currentPage}
          onNavigate={handleNavigate}
          userName={userProfile.name}
        />
        
        {/* Page Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-24 pb-20 md:pb-8 max-w-7xl">
          {renderMainContent()}
        </div>
      </div>
      
      {/* Shopping List Modal */}
      <ShoppingListModal
        isOpen={showShoppingList}
        onClose={() => setShowShoppingList(false)}
        items={shoppingListItems}
        listName={shoppingListName}
        onGeneratePDF={generateShoppingListPDF}
      />
      
      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={userProfile}
        onSave={setUserProfile}
      />
      
      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelect={(type) => handleAddFlow(type)}
      />
    </div>
  );
}

export default App;