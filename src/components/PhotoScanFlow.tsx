import React, { useState } from 'react';
import { Camera, ArrowLeft, Upload, FileImage, AlertCircle } from 'lucide-react';
import { ScrapedRecipe } from '../types';

interface PhotoScanFlowProps {
  onSubmit: (recipe: ScrapedRecipe) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const PhotoScanFlow: React.FC<PhotoScanFlowProps> = ({ onSubmit, onBack, isLoading = false }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select an image file (JPG, PNG, etc.)');
      }
    }
  };
  
  const handleProcessPhoto = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // TODO: Implement OCR processing
      // For now, create a placeholder recipe
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      const placeholderRecipe: ScrapedRecipe = {
        title: 'Recipe from Photo',
        description: 'Recipe extracted from uploaded photo',
        ingredients: [
          'Ingredient 1 (extracted from photo)',
          'Ingredient 2 (extracted from photo)',
          'Ingredient 3 (extracted from photo)'
        ],
        instructions: [
          'Step 1 (extracted from photo)',
          'Step 2 (extracted from photo)',
          'Step 3 (extracted from photo)'
        ],
        notes: 'This recipe was extracted from a photo. Please review and edit the details as needed.'
      };
      
      onSubmit(placeholderRecipe);
    } catch (error) {
      setError('Failed to process the photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
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

      <div className="theme-card backdrop-blur-xl rounded-3xl shadow-xl border theme-border-subtle p-8">
      <div className="surface-elevated p-8">
        <div className="text-center mb-6">
          <div className="kitchen-icon-tile mx-auto mb-3">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold theme-text mb-2">Scan Recipe from Photo</h3>
          <p className="theme-text-secondary">Upload a photo of a recipe to extract the text automatically</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-soft border border-accent rounded-2xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
              <p className="text-accent font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed theme-border rounded-2xl p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="space-y-4">
                <div className="kitchen-icon-tile-neutral w-16 h-16 mx-auto">
                  <FileImage className="w-8 h-8 text-primary-brand" />
                </div>
                <div>
                  <p className="font-bold theme-text mb-2">Click to upload a photo</p>
                  <p className="text-sm theme-text-secondary">
                    Choose a clear photo of a recipe from a book, magazine, or printed page
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
           <div className="bg-primary-soft border border-primary rounded-2xl p-4">
              <div className="flex items-center gap-3">
               <FileImage className="w-5 h-5 text-primary-brand" />
                <div className="flex-1">
                 <p className="font-semibold text-primary-brand">{selectedFile.name}</p>
                 <p className="text-sm text-primary-brand">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Process Button */}
          <div className="flex gap-3">
            <button
              onClick={handleProcessPhoto}
              disabled={!selectedFile || isProcessing}
              className="flex-1 kitchen-btn-primary py-4 px-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing Photo...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Process Photo
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

          {/* Info Note */}
         <div className="bg-primary-soft border border-primary rounded-2xl p-4">
           <p className="text-sm text-primary-brand font-medium">
              <strong>Note:</strong> Photo scanning uses OCR technology to extract text from images. 
              Results may vary depending on image quality and text clarity. You'll be able to review 
              and edit the extracted recipe before saving.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};