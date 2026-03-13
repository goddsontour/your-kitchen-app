import jsPDF from 'jspdf';
import { Recipe } from '../types';
import { organizeShoppingListByCategory } from './ingredientCategories';
import { getMatchedIngredients } from './allergenDetector';

export const generateRecipePDF = (recipe: Recipe, userProfile?: { allergens: string[]; intolerances: string[] }): void => {
  const pdf = new jsPDF();
  let yPosition = 20;
  
  // Check for allergen matches if user profile is provided
  let allergenMatches: any[] = [];
  let intoleranceMatches: any[] = [];
  if (userProfile) {
    allergenMatches = getMatchedIngredients(recipe.ingredients, userProfile.allergens);
    intoleranceMatches = getMatchedIngredients(recipe.ingredients, userProfile.intolerances);
  }
  const allMatches = [...allergenMatches, ...intoleranceMatches];
  
  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(recipe.title, 20, yPosition);
  yPosition += 15;
  
  // Description
  if (recipe.description) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const splitDescription = pdf.splitTextToSize(recipe.description, 170);
    pdf.text(splitDescription, 20, yPosition);
    yPosition += splitDescription.length * 5 + 10;
  }
  
  // Recipe info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  let infoText = '';
  if (recipe.prep_time) infoText += `Prep: ${recipe.prep_time} min  `;
  if (recipe.cook_time) infoText += `Cook: ${recipe.cook_time} min  `;
  if (recipe.servings) infoText += `Serves: ${recipe.servings}`;
  if (infoText) {
    pdf.text(infoText, 20, yPosition);
    yPosition += 15;
  }
  
  // Source information
  if (recipe.source_name || recipe.source_url) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let sourceText = 'Source: ';
    if (recipe.source_name) sourceText += recipe.source_name;
    if (recipe.source_url) sourceText += ` (${recipe.source_url})`;
    pdf.text(sourceText, 20, yPosition);
    yPosition += 15;
  }
  
  // Allergen warning
  if (allMatches.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(200, 0, 0);
    pdf.text('⚠ ALLERGEN WARNING', 20, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(150, 0, 0);
    
    allMatches.forEach((match) => {
      const warningText = `${match.allergen}: ${match.matchedIngredients.join(', ')}`;
      const splitWarning = pdf.splitTextToSize(warningText, 170);
      pdf.text(splitWarning, 20, yPosition);
      yPosition += splitWarning.length * 4 + 2;
    });
    
    // Disclaimer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    const disclaimer = 'This warning is based on detected ingredients and user profile. Always verify ingredients manually for allergies or medical intolerances.';
    const splitDisclaimer = pdf.splitTextToSize(disclaimer, 170);
    pdf.text(splitDisclaimer, 20, yPosition);
    yPosition += splitDisclaimer.length * 3 + 10;
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
  }
  
  // Ingredients
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Ingredients:', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  recipe.ingredients?.forEach((ingredient) => {
    // Check if this ingredient matches any allergens
    const isAllergenMatch = allMatches.some(match => match.matchedIngredients.includes(ingredient));
    
    if (isAllergenMatch) {
      pdf.setTextColor(200, 0, 0);
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
    }
    
    const prefix = isAllergenMatch ? '⚠ • ' : '• ';
    const splitIngredient = pdf.splitTextToSize(`${prefix}${ingredient}`, 170);
    pdf.text(splitIngredient, 20, yPosition);
    yPosition += splitIngredient.length * 5 + 2;
  });
  
  // Reset text formatting
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  yPosition += 10;
  
  // Instructions
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Instructions:', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  recipe.instructions?.forEach((instruction, index) => {
    const splitInstruction = pdf.splitTextToSize(`${index + 1}. ${instruction}`, 170);
    if (yPosition + splitInstruction.length * 5 > 280) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(splitInstruction, 20, yPosition);
    yPosition += splitInstruction.length * 5 + 8;
  });
  
  // Notes
  if (recipe.notes) {
    yPosition += 10;
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notes:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const splitNotes = pdf.splitTextToSize(recipe.notes, 170);
    if (yPosition + splitNotes.length * 5 > 280) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(splitNotes, 20, yPosition);
  }
  
  pdf.save(`${recipe.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

export const generateShoppingListPDF = (items: any[], listName: string): void => {
  const pdf = new jsPDF();
  let yPosition = 20;
  
  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(listName, 20, yPosition);
  yPosition += 15;
  
  // Subtitle
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Organized by store section - ${items.length} items total`, 20, yPosition);
  yPosition += 20;
  
  // Organize items by category
  const organizedItems = organizeShoppingListByCategory(items);
  
  // Generate categorized shopping list
  Object.entries(organizedItems).forEach(([category, categoryItems]) => {
    // Check if we need a new page
    if (yPosition + (categoryItems.length * 6) + 20 > 280) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Category header
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${category} (${categoryItems.length} items)`, 20, yPosition);
    yPosition += 8;
    
    // Draw a line under category
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    
    // Category items
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    categoryItems.forEach((item) => {
      const text = `☐ ${item.ingredient}${item.quantity ? ` - ${item.quantity}` : ''}`;
      const splitText = pdf.splitTextToSize(text, 170);
      
      if (yPosition + splitText.length * 6 > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(splitText, 25, yPosition);
      yPosition += splitText.length * 6 + 2;
    });
    
    yPosition += 8; // Extra space between categories
  });
  
  pdf.save(`${listName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};