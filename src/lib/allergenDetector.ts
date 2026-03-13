import type { AllergenMatch } from '../types';

const AUSTRALIAN_ALLERGENS = {
  'Gluten (Wheat)': ['wheat', 'flour', 'bread', 'pasta', 'noodles', 'couscous', 'bulgur', 'semolina', 'durum', 'spelt', 'kamut', 'farro', 'wheat flour', 'plain flour', 'self-raising flour', 'wholemeal flour', 'bread flour', 'cake flour', 'pastry flour', 'breadcrumbs', 'panko', 'croutons', 'wheat bran', 'wheat germ'],
  'Gluten (Barley)': ['barley', 'malt', 'malt extract', 'malt syrup', 'malted', 'beer', 'ale', 'lager', 'stout', 'barley flour', 'pearl barley', 'hulled barley'],
  'Gluten (Oats)': ['oats', 'oat flour', 'oat bran', 'oatmeal', 'rolled oats', 'steel cut oats', 'quick oats', 'instant oats', 'porridge oats'],
  'Gluten (Rye)': ['rye', 'rye flour', 'rye bread', 'pumpernickel', 'rye berries'],
  'Fish': ['fish', 'salmon', 'tuna', 'cod', 'haddock', 'mackerel', 'sardines', 'anchovies', 'trout', 'bass', 'snapper', 'barramundi', 'flathead', 'whiting', 'fish sauce', 'fish stock', 'worcestershire sauce', 'caesar dressing'],
  'Crustacean': ['prawns', 'shrimp', 'crab', 'lobster', 'crayfish', 'yabby', 'scampi', 'langoustine', 'krill', 'barnacle'],
  'Mollusc': ['oysters', 'mussels', 'clams', 'scallops', 'squid', 'calamari', 'octopus', 'cuttlefish', 'abalone', 'periwinkle', 'whelk', 'cockle'],
  'Egg': ['egg', 'eggs', 'egg white', 'egg yolk', 'whole egg', 'egg powder', 'dried egg', 'mayonnaise', 'aioli', 'hollandaise', 'custard', 'meringue', 'pasta', 'noodles', 'cake', 'muffin', 'cookie', 'biscuit', 'quiche', 'frittata', 'omelette'],
  'Milk': ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'yoghurt', 'sour cream', 'crème fraîche', 'buttermilk', 'whey', 'casein', 'lactose', 'dairy', 'ice cream', 'gelato', 'custard', 'condensed milk', 'evaporated milk', 'powdered milk', 'milk powder', 'ghee', 'clarified butter'],
  'Lupin': ['lupin', 'lupine', 'lupin flour', 'lupin protein', 'lupin beans'],
  'Peanut': ['peanut', 'peanuts', 'groundnut', 'peanut butter', 'peanut oil', 'peanut flour', 'monkey nuts', 'beer nuts'],
  'Soy': ['soy', 'soya', 'soybean', 'soybeans', 'soy sauce', 'tamari', 'miso', 'tempeh', 'tofu', 'edamame', 'soy milk', 'soy flour', 'soy protein', 'soy lecithin', 'textured vegetable protein', 'tvp'],
  'Sesame': ['sesame', 'sesame seeds', 'sesame oil', 'tahini', 'halva', 'hummus', 'baba ganoush'],
  'Tree Nuts (Almond)': ['almond', 'almonds', 'almond flour', 'almond meal', 'almond milk', 'almond butter', 'marzipan', 'amaretto'],
  'Tree Nuts (Brazil Nut)': ['brazil nut', 'brazil nuts'],
  'Tree Nuts (Cashew)': ['cashew', 'cashews', 'cashew butter', 'cashew cream', 'cashew milk'],
  'Tree Nuts (Hazelnut)': ['hazelnut', 'hazelnuts', 'hazelnut oil', 'nutella', 'frangelico'],
  'Tree Nuts (Macadamia)': ['macadamia', 'macadamias', 'macadamia oil'],
  'Tree Nuts (Pecan)': ['pecan', 'pecans'],
  'Tree Nuts (Pistachio)': ['pistachio', 'pistachios'],
  'Tree Nuts (Pine Nut)': ['pine nut', 'pine nuts', 'pignoli', 'pinoli'],
  'Tree Nuts (Walnut)': ['walnut', 'walnuts', 'walnut oil'],
  'Sulphites': ['sulphites', 'sulfites', 'sodium sulphite', 'sodium sulfite', 'potassium sulphite', 'potassium sulfite', 'wine', 'dried fruit', 'dried apricots', 'raisins', 'sultanas', 'vinegar', 'balsamic vinegar', 'wine vinegar']
} as const;

type AllergenKey = keyof typeof AUSTRALIAN_ALLERGENS;

export const DIETARY_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Low Carb',
  'Paleo',
  'Gluten Free',
  'Dairy Free',
  'Sugar Free',
  'Low Sodium',
  'High Protein',
  'Mediterranean',
  'Whole30',
  'Raw Food'
];

export const detectAllergens = (ingredients: string[]): string[] => {
  const detectedAllergens = new Set<string>();
  
  ingredients.forEach(ingredient => {
    const lowerIngredient = ingredient.toLowerCase().trim();
    
    Object.entries(AUSTRALIAN_ALLERGENS).forEach(([allergen, keywords]) => {
      const hasMatch = keywords.some((keyword) => {
        // Check for whole word matches to avoid false positives
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(lowerIngredient);
      });
      
      if (hasMatch) {
        detectedAllergens.add(allergen);
      }
    });
  });
  
  return Array.from(detectedAllergens);
};

export const getMatchedIngredients = (ingredients: string[], userAllergens: string[]): AllergenMatch[] => {
  const matches: AllergenMatch[] = [];
  
  userAllergens.forEach(userAllergen => {
    const matchedIngredients: string[] = [];
    
    if (userAllergen in AUSTRALIAN_ALLERGENS) {
      const keywords = AUSTRALIAN_ALLERGENS[userAllergen as AllergenKey];
      
      ingredients.forEach(ingredient => {
        const lowerIngredient = ingredient.toLowerCase().trim();
        
        const hasMatch = keywords.some((keyword) => {
          const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return regex.test(lowerIngredient);
        });
        
        if (hasMatch) {
          matchedIngredients.push(ingredient);
        }
      });
    }
    
    if (matchedIngredients.length > 0) {
      matches.push({
        allergen: userAllergen,
        matchedIngredients
      });
    }
  });
  
  return matches;
};

export const getAllergenList = (): string[] => {
  return Object.keys(AUSTRALIAN_ALLERGENS);
};