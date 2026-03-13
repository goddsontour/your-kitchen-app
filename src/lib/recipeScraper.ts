import DOMPurify from 'dompurify';
import { ScrapedRecipe } from '../types';

interface RecipeSchema {
  '@type'?: string;
  name?: string;
  description?: string;
  recipeIngredient?: string[];
  recipeInstructions?: Array<{
    '@type'?: string;
    text?: string;
  } | string>;
  prepTime?: string;
  cookTime?: string;
  recipeYield?: string | number;
  totalTime?: string;
}

export class RecipeScraper {
  private static parseTimeToMinutes(timeString: string): number | undefined {
    if (!timeString) return undefined;
    
    // Handle ISO 8601 duration format (PT15M, PT1H30M, etc.)
    const isoMatch = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (isoMatch) {
      const hours = parseInt(isoMatch[1] || '0');
      const minutes = parseInt(isoMatch[2] || '0');
      return hours * 60 + minutes;
    }
    
    // Handle common text formats
    const textMatch = timeString.toLowerCase().match(/(\d+)\s*(hour|hr|h|minute|min|m)/g);
    if (textMatch) {
      let totalMinutes = 0;
      textMatch.forEach(match => {
        const [, num, unit] = match.match(/(\d+)\s*(hour|hr|h|minute|min|m)/) || [];
        const value = parseInt(num);
        if (unit.startsWith('h')) {
          totalMinutes += value * 60;
        } else {
          totalMinutes += value;
        }
      });
      return totalMinutes;
    }
    
    // Try to extract just numbers (assume minutes)
    const numberMatch = timeString.match(/(\d+)/);
    if (numberMatch) {
      return parseInt(numberMatch[1]);
    }
    
    return undefined;
  }

  private static parseServings(servingsString: string | number): number | undefined {
    if (typeof servingsString === 'number') return servingsString;
    if (!servingsString) return undefined;
    
    const match = servingsString.toString().match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  private static extractJsonLdRecipes(html: string): RecipeSchema[] {
    const recipes: RecipeSchema[] = [];
    
    // Find all JSON-LD script tags
    const scriptMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis);
    
    if (scriptMatches) {
      scriptMatches.forEach(scriptMatch => {
        try {
          const jsonContent = scriptMatch.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
          const data = JSON.parse(jsonContent);
          
          // Handle single recipe or array of items
          const items = Array.isArray(data) ? data : [data];
          
          items.forEach(item => {
            if (item['@type'] === 'Recipe') {
              recipes.push(item);
            } else if (item['@graph']) {
              // Handle @graph structure
              item['@graph'].forEach((graphItem: any) => {
                if (graphItem['@type'] === 'Recipe') {
                  recipes.push(graphItem);
                }
              });
            }
          });
        } catch (error) {
          console.warn('Failed to parse JSON-LD:', error);
        }
      });
    }
    
    return recipes;
  }

  private static extractMicrodataRecipe(doc: Document): Partial<ScrapedRecipe> | null {
    const recipeElement = doc.querySelector('[itemtype*="Recipe"]');
    if (!recipeElement) return null;

    const title = recipeElement.querySelector('[itemprop="name"]')?.textContent?.trim();
    const description = recipeElement.querySelector('[itemprop="description"]')?.textContent?.trim();
    
    const ingredientElements = recipeElement.querySelectorAll('[itemprop="recipeIngredient"]');
    const ingredients = Array.from(ingredientElements).map(el => el.textContent?.trim()).filter(Boolean) as string[];
    
    const instructionElements = recipeElement.querySelectorAll('[itemprop="recipeInstructions"]');
    const instructions = Array.from(instructionElements).map(el => {
      // Try to get text from nested elements or direct text
      const text = el.querySelector('[itemprop="text"]')?.textContent || el.textContent;
      return text?.trim();
    }).filter(Boolean) as string[];

    const prepTimeEl = recipeElement.querySelector('[itemprop="prepTime"]');
    const cookTimeEl = recipeElement.querySelector('[itemprop="cookTime"]');
    const yieldEl = recipeElement.querySelector('[itemprop="recipeYield"]');

    return {
      title: title || undefined,
      description: description || undefined,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      instructions: instructions.length > 0 ? instructions : undefined,
      prep_time: prepTimeEl ? this.parseTimeToMinutes(prepTimeEl.getAttribute('datetime') || prepTimeEl.textContent || '') : undefined,
      cook_time: cookTimeEl ? this.parseTimeToMinutes(cookTimeEl.getAttribute('datetime') || cookTimeEl.textContent || '') : undefined,
      servings: yieldEl ? this.parseServings(yieldEl.textContent || '') : undefined
    };
  }

  private static fallbackTextParsing(doc: Document): Partial<ScrapedRecipe> {
    // Try to find title
    let title = doc.querySelector('h1')?.textContent?.trim() ||
                doc.querySelector('.recipe-title, .entry-title, [class*="title"]')?.textContent?.trim() ||
                doc.title;

    // Clean up title
    if (title) {
      title = title.replace(/\s*\|\s*.*$/, '').trim(); // Remove site name after |
    }

    // Try to find ingredients
    const ingredients: string[] = [];
    const ingredientSelectors = [
      '.recipe-ingredient',
      '.ingredient',
      '[class*="ingredient"]',
      'li[class*="ingredient"]',
      '.recipe-ingredients li',
      '.ingredients li'
    ];

    for (const selector of ingredientSelectors) {
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        Array.from(elements).forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 2) {
            ingredients.push(text);
          }
        });
        if (ingredients.length > 0) break;
      }
    }

    // Try to find instructions
    const instructions: string[] = [];
    const instructionSelectors = [
      '.recipe-instruction',
      '.instruction',
      '.instructions li',
      '.directions li',
      '.recipe-directions li',
      '[class*="instruction"]',
      '.recipe-method li'
    ];

    for (const selector of instructionSelectors) {
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        Array.from(elements).forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 10) {
            instructions.push(text);
          }
        });
        if (instructions.length > 0) break;
      }
    }

    // Try to find description
    const description = doc.querySelector('.recipe-description, .entry-summary, [class*="description"]')?.textContent?.trim();

    return {
      title: title || 'Imported Recipe',
      description: description || undefined,
      ingredients: ingredients.length > 0 ? ingredients : ['No ingredients found'],
      instructions: instructions.length > 0 ? instructions : ['No instructions found']
    };
  }

  static async scrapeRecipe(url: string): Promise<ScrapedRecipe> {
    try {
      // Use a CORS proxy for development
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const html = data.contents;
      
      // Sanitize HTML
      const cleanHtml = DOMPurify.sanitize(html);
      
      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanHtml, 'text/html');
      
      // Try JSON-LD first
      const jsonLdRecipes = this.extractJsonLdRecipes(cleanHtml);
      if (jsonLdRecipes.length > 0) {
        const recipe = jsonLdRecipes[0];
        
        // Process instructions
        let instructions: string[] = [];
        if (recipe.recipeInstructions) {
          instructions = recipe.recipeInstructions.map(instruction => {
            if (typeof instruction === 'string') {
              return instruction;
            } else if (instruction.text) {
              return instruction.text;
            }
            return '';
          }).filter(Boolean);
        }
        
        return {
          title: recipe.name || 'Imported Recipe',
          description: recipe.description,
          ingredients: recipe.recipeIngredient || ['No ingredients found'],
          instructions: instructions.length > 0 ? instructions : ['No instructions found'],
          prep_time: recipe.prepTime ? this.parseTimeToMinutes(recipe.prepTime) : undefined,
          cook_time: recipe.cookTime ? this.parseTimeToMinutes(recipe.cookTime) : undefined,
          servings: recipe.recipeYield ? this.parseServings(recipe.recipeYield) : undefined,
        };
      }
      
      // Try microdata
      const microdataRecipe = this.extractMicrodataRecipe(doc);
      if (microdataRecipe && microdataRecipe.title) {
        return {
          title: microdataRecipe.title,
          description: microdataRecipe.description,
          ingredients: microdataRecipe.ingredients || ['No ingredients found'],
          instructions: microdataRecipe.instructions || ['No instructions found'],
          prep_time: microdataRecipe.prep_time,
          cook_time: microdataRecipe.cook_time,
          servings: microdataRecipe.servings,
        };
      }
      
      // Fallback to text parsing
      const fallbackRecipe = this.fallbackTextParsing(doc);
      return {
        title: fallbackRecipe.title || 'Imported Recipe',
        description: fallbackRecipe.description,
        ingredients: fallbackRecipe.ingredients || ['No ingredients found'],
        instructions: fallbackRecipe.instructions || ['No instructions found'],
        prep_time: fallbackRecipe.prep_time,
        cook_time: fallbackRecipe.cook_time,
        servings: fallbackRecipe.servings,
      };
      
    } catch (error) {
      console.error('Recipe scraping failed:', error);
      throw new Error('Failed to import recipe from URL. Please try adding it manually.');
    }
  }
}