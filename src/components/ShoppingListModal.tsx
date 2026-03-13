import React, { useState } from 'react';
import { X, FileText, ShoppingCart, Check, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { ShoppingListItem } from '../types';
import { organizeShoppingListByCategory } from '../lib/ingredientCategories';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingListItem[];
  listName: string;
  onGeneratePDF: (items: ShoppingListItem[], name: string) => void;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  isOpen,
  onClose,
  items,
  listName,
  onGeneratePDF
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  if (!isOpen) return null;
  
  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };
  
  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };
  
  const organizedItems = organizeShoppingListByCategory(items);
  const totalChecked = checkedItems.size;
  const completionPercentage = items.length > 0 ? Math.round((totalChecked / items.length) * 100) : 0;
  
  // Category colors for visual distinction
  const categoryColors: Record<string, string> = {
    'Vegetables and Fruits': 'var(--brand-primary)',
    'Meat': 'var(--accent)',
    'Dairy': 'var(--brand-primary)',
    'Bakery': 'var(--accent)',
    'Frozen': 'var(--brand-primary)',
    'Pantry': 'var(--accent)'
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="surface-elevated max-w-4xl w-full max-h-[90vh] overflow-hidden animate-modal-scale">
        {/* Enhanced Header */}
        <div className="p-8 border-b" style={{ borderColor: 'var(--border-soft)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="kitchen-icon-tile">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">{listName}</h2>
                <p className="text-secondary font-medium">{items.length} items organized by store section</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl surface hover:surface-secondary text-secondary hover:text-red-500 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="surface rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-primary">Shopping Progress</span>
              <span className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>{totalChecked}/{items.length} ({completionPercentage}%)</span>
            </div>
            <div className="w-full rounded-full h-3 overflow-hidden surface-secondary">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ backgroundColor: 'var(--brand-primary)', width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Categorized Items List */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(organizedItems).map(([category, categoryItems]) => {
              const isCollapsed = collapsedCategories.has(category);
              const categoryChecked = categoryItems.filter(item => checkedItems.has(item.id)).length;
              const categoryTotal = categoryItems.length;
              const categoryProgress = Math.round((categoryChecked / categoryTotal) * 100);
              
              return (
                <div key={category} className="surface overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-4 flex items-center justify-between hover:surface-secondary transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: categoryColors[category] || 'var(--brand-primary)' }}>
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-primary text-lg">{category}</h3>
                        <p className="text-sm text-secondary font-medium">
                          {categoryChecked}/{categoryTotal} items ({categoryProgress}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 rounded-full h-2 overflow-hidden surface-secondary">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ backgroundColor: categoryColors[category] || 'var(--brand-primary)', width: `${categoryProgress}%` }}
                        ></div>
                      </div>
                      {isCollapsed ? (
                        <ChevronDown className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </button>
                  
                  {/* Category Items */}
                  {!isCollapsed && (
                    <div className="px-4 pb-4 space-y-2">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all duration-300 group cursor-pointer ${
                            checkedItems.has(item.id)
                              ? `bg-primary-soft border-primary shadow-md`
                              : 'theme-panel-bg theme-border hover:border-primary hover:shadow-sm'
                          }`}
                          onClick={() => toggleItem(item.id)}
                        >
                          <button
                            className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-300 shadow-sm ${
                              checkedItems.has(item.id)
                                ? 'bg-primary border-primary text-white scale-110'
                                : 'theme-border hover:border-primary group-hover:scale-110'
                            }`}
                          >
                            {checkedItems.has(item.id) && (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <div className="flex-1">
                            <p className={`font-semibold text-sm transition-all duration-300 ${
                              checkedItems.has(item.id) ? 'text-primary-brand line-through' : 'theme-text'
                            }`}>
                              {item.ingredient}
                            </p>
                            {item.quantity && (
                              <p className="text-xs theme-text-secondary font-medium mt-1">{item.quantity}</p>
                            )}
                          </div>
                          {checkedItems.has(item.id) && (
                            <div className="w-8 h-8 bg-primary-soft rounded-xl flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-brand" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Enhanced Footer */}
        <div className="p-8 border-t" style={{ borderColor: 'var(--border-soft)' }}>
          <div className="flex gap-4">
            <button
              onClick={() => onGeneratePDF(items, listName)}
              className="flex-1 text-white py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02]"
              style={{ backgroundColor: '#D46A3A' }}
            >
              <FileText className="w-5 h-5" />
              Generate PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 btn-secondary py-4 px-6"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};