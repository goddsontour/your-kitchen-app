import React, { useState, useEffect } from 'react';
import { X, User, AlertTriangle, Heart, Settings, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';
import { getAllergenList, DIETARY_PREFERENCES } from '../lib/allergenDetector';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  
  useEffect(() => {
    setFormData(profile);
  }, [profile]);
  
  if (!isOpen) return null;
  
  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };
  
  const handleIntoleranceToggle = (intolerance: string) => {
    setFormData(prev => ({
      ...prev,
      intolerances: prev.intolerances.includes(intolerance)
        ? prev.intolerances.filter(i => i !== intolerance)
        : [...prev.intolerances, intolerance]
    }));
  };
  
  const handleDietaryToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference]
    }));
  };
  
  const handleSave = () => {
    onSave(formData);
    onClose();
  };
  
  const allergenList = getAllergenList();
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="surface-elevated max-w-4xl w-full max-h-[90vh] sm:max-h-[95vh] overflow-hidden animate-modal-scale">
        {/* Header */}
        <div className="p-8 border-b" style={{ borderColor: 'var(--border-soft)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="kitchen-icon-tile">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">Dietary & Allergy Profile</h2>
                <p className="text-secondary font-medium">Manage your allergens, intolerances, and dietary preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl surface hover:surface-secondary text-secondary hover:text-red-500 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="space-y-8">
            {/* Theme Section */}
            <div>
              <div className="flex items-center justify-between py-4 px-4 sm:px-6 surface rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--brand-primary)' }}>
                    {formData.theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-white" />
                    ) : (
                      <Sun className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">Theme</h3>
                    <p className="text-sm text-secondary">Choose your preferred appearance</p>
                  </div>
                </div>
                
                {/* Sleek Toggle Switch */}
                <div className="relative">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      formData.theme === 'dark' ? '' : 'bg-gray-300'
                    }`}
                    style={formData.theme === 'dark' ? { backgroundColor: 'var(--brand-primary)' } : {}}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        formData.theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    >
                      <span className="flex items-center justify-center h-full w-full">
                        {formData.theme === 'dark' ? (
                          <Moon className="w-3 h-3" style={{ color: 'var(--brand-primary)' }} />
                        ) : (
                          <Sun className="w-3 h-3" style={{ color: '#D46A3A' }} />
                        )}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Name Section */}
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold theme-text">Personal Information</h3>
                  <p className="text-sm theme-text-secondary">Customize your kitchen name</p>
                </div>
              </div>
              
              <div>
                <label className="block font-bold theme-text mb-2 text-xs sm:text-sm">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Enter your name to personalize your kitchen"
                />
                <p className="text-xs theme-text-secondary mt-1 sm:mt-2">
                  This will change "Your Kitchen" to "{formData.name ? `${formData.name}'s` : 'Your'} Kitchen" in the app
                </p>
              </div>
            </div>
            
            {/* Allergens Section */}
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#D46A3A' }}>
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">Allergens</h3>
                  <p className="text-sm text-secondary">Select allergens that cause severe reactions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {allergenList.map((allergen) => (
                  <button
                    key={allergen}
                    onClick={() => handleAllergenToggle(allergen)}
                    className={`p-3 sm:p-4 surface border-2 transition-all duration-300 text-left ${
                      formData.allergens.includes(allergen)
                        ? 'bg-accent-soft border-accent text-accent'
                        : 'hover:border-accent hover:bg-accent-soft/50 text-primary'
                    }`}
                    style={!formData.allergens.includes(allergen) ? {
                      borderColor: 'var(--border-soft)'
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        formData.allergens.includes(allergen)
                          ? 'bg-accent border-accent'
                          : 'border-gray-300'
                      }`}>
                        {formData.allergens.includes(allergen) && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-semibold text-xs sm:text-sm">{allergen}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Intolerances Section */}
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
               <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                 <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold theme-text">Intolerances</h3>
                  <p className="text-sm theme-text-secondary">Select ingredients that cause discomfort or digestive issues</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {allergenList.map((intolerance) => (
                  <button
                    key={intolerance}
                    onClick={() => handleIntoleranceToggle(intolerance)}
                    className={`p-3 sm:p-4 surface border-2 transition-all duration-300 text-left ${
                      formData.intolerances.includes(intolerance)
                        ? 'bg-accent-soft border-accent text-accent'
                        : 'hover:border-accent hover:bg-accent-soft/50 text-primary'
                    }`}
                    style={!formData.intolerances.includes(intolerance) ? {
                      borderColor: 'var(--border-soft)'
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        formData.intolerances.includes(intolerance)
                          ? 'bg-accent border-accent'
                          : 'border-gray-300'
                      }`}>
                        {formData.intolerances.includes(intolerance) && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-semibold text-xs sm:text-sm">{intolerance}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Dietary Preferences Section */}
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold theme-text">Dietary Preferences</h3>
                  <p className="text-sm theme-text-secondary">Select your dietary lifestyle choices</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {DIETARY_PREFERENCES.map((preference) => (
                  <button
                    key={preference}
                    onClick={() => handleDietaryToggle(preference)}
                    className={`p-3 sm:p-4 surface border-2 transition-all duration-300 text-left ${
                      formData.dietaryPreferences.includes(preference)
                        ? 'border-primary text-primary'
                        : 'hover:border-primary hover:bg-primary-soft/50 text-primary'
                    }`}
                    style={formData.dietaryPreferences.includes(preference) ? {
                      backgroundColor: 'rgba(47, 125, 92, 0.1)',
                      borderColor: 'var(--brand-primary)',
                      color: 'var(--brand-primary)'
                    } : {
                      borderColor: 'var(--border-soft)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        formData.dietaryPreferences.includes(preference)
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      }`}
                      style={formData.dietaryPreferences.includes(preference) ? {
                        backgroundColor: 'var(--brand-primary)',
                        borderColor: 'var(--brand-primary)'
                      } : {}}
                      >
                        {formData.dietaryPreferences.includes(preference) && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-semibold text-xs sm:text-sm">{preference}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex-shrink-0 sticky bottom-0" style={{ borderColor: 'var(--border-soft)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex flex-row gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl transition-colors duration-200 text-white"
              style={{ backgroundColor: 'var(--brand-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-primary)'}
            >
              <Settings className="w-4 h-4" />
              Save Profile
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-colors duration-200 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};