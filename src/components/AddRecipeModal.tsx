import React from 'react';
import { X, Globe, Camera, Clipboard, ChefHat } from 'lucide-react';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (optionType: 'url' | 'photo' | 'paste' | 'manual') => void;
}

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  if (!isOpen) return null;

  const handleOptionSelect = (optionType: 'url' | 'photo' | 'paste' | 'manual') => {
    onSelect(optionType);
    onClose();
  };

  const options = [
    {
      id: 'url' as const,
      icon: Globe,
      title: 'Import from Website',
      description: 'Paste a recipe link',
      iconBg: 'bg-primary'
    },
    {
      id: 'photo' as const,
      icon: Camera,
      title: 'Scan from Photo',
      description: 'Upload or take a picture',
      iconBg: 'bg-primary'
    },
    {
      id: 'paste' as const,
      icon: Clipboard,
      title: 'Paste Recipe Text',
      description: 'Copy and paste a recipe',
      iconBg: 'bg-primary'
    },
    {
      id: 'manual' as const,
      icon: ChefHat,
      title: 'Create Manually',
      description: 'Build step by step',
      iconBg: 'bg-primary'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark translucent backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md animate-modal-scale">
        <div className="surface-elevated overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 text-center">
            <h2 className="text-2xl font-bold text-primary mb-1">Add Recipe</h2>
            <p className="text-secondary text-sm font-medium">
              How would you like to add it?
            </p>
          </div>
          
          {/* Options */}
          <div className="px-6 pb-4 space-y-3">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className="w-full p-[18px] surface hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon with colored background */}
                    <div className="icon-tile w-12 h-12">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Text content */}
                    <div className="flex-1">
                      <h3 className="font-bold text-primary text-base mb-0.5">
                        {option.title}
                      </h3>
                      <p className="text-secondary text-sm">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Cancel button */}
          <div className="p-6 pt-2 text-center">
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary font-semibold text-sm transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};