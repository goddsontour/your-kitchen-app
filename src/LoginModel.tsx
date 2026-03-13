import React, { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

type AuthMode = 'login' | 'signup';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setSuccess('Account created successfully! Please check your email to verify your account.');
          // Don't close modal yet, let user see success message
          setTimeout(() => {
            setMode('login');
            setSuccess(null);
          }, 3000);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setSuccess('Login successful!');
          onLoginSuccess(data.user);
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1000);
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError(null);
    setSuccess(null);
    setMode('login');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark translucent backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md animate-modal-scale">
        <div className="surface-elevated overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 border-b" style={{ borderColor: 'var(--border-soft)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="icon-tile w-10 h-10">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-secondary text-sm">
                    {mode === 'login' 
                      ? 'Sign in to sync your recipes across devices' 
                      : 'Join to save and sync your recipes'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl surface hover:surface-secondary text-secondary hover:text-red-500 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Form */}
          <div className="p-6">
            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 rounded-xl border" style={{ 
                backgroundColor: 'rgba(47, 125, 92, 0.1)', 
                borderColor: 'var(--brand-primary)',
                color: 'var(--brand-primary)'
              }}>
                <p className="text-sm font-semibold">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl border border-red-300 bg-red-50">
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block font-bold text-primary mb-2 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field w-full"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block font-bold text-primary mb-2 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input-field w-full pr-12"
                    placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-secondary mt-1">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl transition-colors duration-200 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--brand-primary)' }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--brand-primary-hover)')}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--brand-primary)')}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            {/* Mode Toggle */}
            <div className="mt-6 text-center">
              <p className="text-sm text-secondary">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                {' '}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="font-semibold transition-colors hover:opacity-80"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Guest Mode Note */}
            <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-badge)' }}>
              <p className="text-xs text-secondary text-center">
                You can continue using the app without an account, but your recipes will only be saved locally on this device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};