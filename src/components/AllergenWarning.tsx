import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AllergenMatch } from '../types';

interface AllergenWarningProps {
  matches: AllergenMatch[];
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const AllergenWarning: React.FC<AllergenWarningProps> = ({
  matches,
  onDismiss,
  showDismiss = false
}) => {
  if (matches.length === 0) return null;
  
  const allergenTypes = matches.map(match => match.allergen);
  const hasAllergens = allergenTypes.some(allergen => 
    allergen.includes('Gluten') || 
    allergen.includes('Fish') || 
    allergen.includes('Crustacean') || 
    allergen.includes('Mollusc') || 
    allergen.includes('Egg') || 
    allergen.includes('Milk') || 
    allergen.includes('Peanut') || 
    allergen.includes('Tree Nuts') || 
    allergen.includes('Soy') || 
    allergen.includes('Sesame') || 
    allergen.includes('Lupin') || 
    allergen.includes('Sulphites')
  );
  
  return (
    <div className={`rounded-2xl border-2 p-6 mb-6 ${
      hasAllergens 
        ? 'bg-red-50 border-red-300' 
        : 'bg-orange-50 border-orange-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${
            hasAllergens 
              ? 'bg-gradient-to-br from-red-500 to-red-600' 
              : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}>
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className={`font-bold text-lg mb-2 ${
              hasAllergens ? 'text-red-800' : 'text-orange-800'
            }`}>
              {hasAllergens ? 'Allergen Warning' : 'Intolerance Notice'}
            </h3>
            
            <p className={`font-semibold mb-4 ${
              hasAllergens ? 'text-red-700' : 'text-orange-700'
            }`}>
              This recipe contains ingredients that match your {hasAllergens ? 'allergen' : 'intolerance'} profile.
            </p>
            
            <div className="space-y-3">
              {matches.map((match, index) => (
                <div key={index} className={`p-4 rounded-xl border ${
                  hasAllergens 
                    ? 'bg-red-100/50 border-red-200' 
                    : 'bg-orange-100/50 border-orange-200'
                }`}>
                  <div className={`font-bold text-sm mb-2 ${
                    hasAllergens ? 'text-red-800' : 'text-orange-800'
                  }`}>
                    {match.allergen}
                  </div>
                  <div className={`text-sm ${
                    hasAllergens ? 'text-red-700' : 'text-orange-700'
                  }`}>
                    <span className="font-semibold">Matched ingredients: </span>
                    {match.matchedIngredients.join(', ')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={`mt-4 p-3 rounded-xl text-xs font-medium ${
              hasAllergens 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-orange-100 text-orange-700 border border-orange-200'
            }`}>
              <strong>Important:</strong> This warning is based on detected ingredients and your profile. 
              Always verify ingredients manually for allergies or medical intolerances.
            </div>
          </div>
        </div>
        
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className={`w-8 h-8 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 ${
              hasAllergens 
                ? 'bg-white/80 hover:bg-red-100 text-red-500 hover:text-red-600' 
                : 'bg-white/80 hover:bg-orange-100 text-orange-500 hover:text-orange-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};