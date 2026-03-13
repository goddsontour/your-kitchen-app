import React from 'react';
import { ChefHat, Home, Plus, BookOpen, Heart, User } from 'lucide-react';

interface NavigationProps {
  currentPage: 'home' | 'add-recipe' | 'recipes' | 'favourites' | 'profile';
  onNavigate: (page: 'home' | 'add-recipe' | 'recipes' | 'favourites' | 'profile') => void;
  userName?: string;
  user?: any;
  onShowLogin?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onNavigate, 
  userName, 
  user,
  onShowLogin 
}) => {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'recipes' as const, label: 'Recipes', icon: BookOpen },
    { id: 'favourites' as const, label: 'Favourites', icon: Heart },
    { id: 'add-recipe' as const, label: 'Add Recipe', icon: Plus },
    { id: 'profile' as const, label: 'Profile', icon: User }
  ];

  return (
    <>
      {/* Desktop Navigation - Fixed Top Bar */}
      <nav className="header hidden md:flex fixed top-0 left-0 right-0 z-50 shadow-sm transition-colors duration-300" style={{ 
        background: 'var(--nav-bg)', 
        borderBottom: '1px solid var(--nav-border)' 
      }}>
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="icon-tile w-8 h-8">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-black tracking-tight text-primary">
                {user ? `${user.email?.split('@')[0]}'s Kitchen` : userName ? `${userName}'s Kitchen` : 'Your Kitchen'}
              </h1>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center gap-4">
              {/* Login Button for Desktop - Guest Users Only */}
              {!user && onShowLogin && (
                <button
                  onClick={onShowLogin}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              )}
              
              <div className="flex items-center" style={{ gap: '28px' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="nav-item"
                    style={isActive ? {
                      background: 'var(--nav-active-bg)',
                      color: 'var(--nav-active-color)'
                    } : {
                      color: 'var(--nav-inactive)'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Fixed Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="header shadow-lg transition-colors duration-300" style={{ 
          height: 'auto',
          background: 'var(--nav-bg)', 
          borderTop: '1px solid var(--nav-border)',
          borderBottom: 'none'
        }}>
          <div className="flex items-center justify-around py-2 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 min-w-0 flex-1 nav-item"
                  style={isActive ? {
                    background: 'var(--nav-active-bg)',
                    color: 'var(--nav-active-color)'
                  } : {
                    color: 'var(--nav-inactive)'
                  }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                  <span className="text-xs font-semibold truncate">
                    {item.id === 'add-recipe' ? 'Add' : item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Header - Simple Logo */}
      <div className="header md:hidden sticky top-0 z-40 flex items-center justify-center gap-3 py-3 transition-colors duration-300" style={{ 
        height: '72px',
        background: 'var(--nav-bg)', 
        borderBottom: '1px solid var(--nav-border)'
      }}>
        <div className="icon-tile w-7 h-7">
          <ChefHat className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-black text-primary">
          {user ? `${user.email?.split('@')[0]}'s Kitchen` : userName ? `${userName}'s Kitchen` : 'Your Kitchen'}
        </h1>
        
        {/* Login Button for Mobile - Guest Users Only */}
        {!user && onShowLogin && (
          <button
            onClick={onShowLogin}
            className="ml-auto mr-4 btn-primary py-1 px-3 text-xs"
          >
            <User className="w-3 h-3" />
            Sign In
          </button>
        )}
      </div>
    </>
  );
};