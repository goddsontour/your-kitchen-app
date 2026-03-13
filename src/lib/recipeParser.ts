import { ScrapedRecipe } from '../types';

interface RecipeSection {
  type: 'title' | 'prep' | 'cook' | 'serve' | 'ingredients' | 'method' | 'notes' | 'junk' | 'unknown';
  content: string[];
  startIndex: number;
  endIndex: number;
}

export const parseRecipeFromText = (text: string): Partial<ScrapedRecipe> => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // First pass: identify sections
  const sections = identifySections(lines);
  
  // Second pass: extract data from valid sections
  return extractRecipeData(sections);
};

function identifySections(lines: string[]): RecipeSection[] {
  const sections: RecipeSection[] = [];
  let currentSection: RecipeSection | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is a junk line that should be ignored
    if (isJunkLine(line)) {
      continue;
    }
    
    // Check if this line starts a new section
    const sectionType = detectSectionType(line);
    
    if (sectionType !== 'unknown') {
      // Close previous section
      if (currentSection) {
        currentSection.endIndex = i - 1;
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        type: sectionType,
        content: [],
        startIndex: i,
        endIndex: i
      };
      
      // Don't include the heading line in content for most sections
      if (sectionType !== 'title') {
        continue;
      }
    }
    
    // Add line to current section
    if (currentSection) {
      currentSection.content.push(line);
    } else if (sections.length === 0) {
      // This might be the title if we haven't found any sections yet
      currentSection = {
        type: 'title',
        content: [line],
        startIndex: i,
        endIndex: i
      };
    }
  }
  
  // Close final section
  if (currentSection) {
    currentSection.endIndex = lines.length - 1;
    sections.push(currentSection);
  }
  
  return sections;
}

function detectSectionType(line: string): RecipeSection['type'] {
  const lowerLine = line.toLowerCase().trim();
  
  // Junk patterns
  if (isJunkLine(line)) {
    return 'junk';
  }
  
  // Prep time patterns
  if (lowerLine.match(/^(prep|prepare|preparation)(\s+time)?:?$/i) ||
      lowerLine.match(/^prep\s*$/i)) {
    return 'prep';
  }
  
  // Cook time patterns
  if (lowerLine.match(/^(cook|cooking)(\s+time)?:?$/i) ||
      lowerLine.match(/^cook\s*$/i)) {
    return 'cook';
  }
  
  // Servings patterns
  if (lowerLine.match(/^(serves?|servings?|yield|makes?|portions?)(\s+time)?:?$/i)) {
    return 'serve';
  }
  
  // Ingredients patterns
  if (lowerLine.match(/^ingredients?:?$/i)) {
    return 'ingredients';
  }
  
  // Method patterns
  if (lowerLine.match(/^(method|instructions?|directions?|steps?|preparation|how\s+to\s+make):?$/i)) {
    return 'method';
  }
  
  // Notes patterns
  if (lowerLine.match(/^(notes?|tips?|recipe\s+tips?|chef'?s?\s+tips?):?$/i)) {
    return 'notes';
  }
  
  return 'unknown';
}

function isJunkLine(line: string): boolean {
  const lowerLine = line.toLowerCase().trim();
  
  const junkPatterns = [
    // Website/app specific
    /save\s+to\s+my\s+food/i,
    /my\s+food/i,
    /shopping\s+list/i,
    /add\s+to\s+shopping/i,
    /share/i,
    /print/i,
    /email/i,
    /facebook/i,
    /twitter/i,
    /pinterest/i,
    /instagram/i,
    
    // Nutrition info
    /\b(kcal|calories?|protein|fat|carbs?|fiber|sugar|sodium|cholesterol)\b.*:/i,
    /nutrition/i,
    /per\s+serving/i,
    /energy/i,
    /\d+\s*(kcal|cal|kj)/i,
    
    // Dietary labels
    /dietary\s+(info|label)/i,
    /gluten.?free/i,
    /dairy.?free/i,
    /vegetarian/i,
    /vegan/i,
    /keto/i,
    /paleo/i,
    /low.?carb/i,
    /low.?fat/i,
    
    // Ratings and reviews
    /\d+\s*(star|rating)/i,
    /rate\s+this/i,
    /\d+\/5/i,
    /★+/i,
    /review/i,
    
    // Video and media
    /video/i,
    /watch/i,
    /how.?to\s+video/i,
    /recipe\s+video/i,
    
    // Author info
    /^by\s+/i,
    /author/i,
    /chef/i,
    /recipe\s+by/i,
    
    // Website navigation
    /^(home|about|contact|privacy|terms)$/i,
    /subscribe/i,
    /newsletter/i,
    /follow\s+us/i,
    /more\s+recipes/i,
    /related\s+recipes/i,
    /you\s+might\s+like/i,
    
    // Generic junk
    /advertisement/i,
    /sponsored/i,
    /affiliate/i,
    /disclosure/i,
    /copyright/i,
    /all\s+rights\s+reserved/i,
    /^\d{4}\s*$/i, // Just a year
    /^©/i,
    /website/i,
    /blog/i,
    
    // Very short or empty content
    /^[-=_*]{3,}$/i, // Separator lines
    /^\.+$/i, // Just dots
    /^\s*$/i, // Empty or whitespace only
  ];
  
  return junkPatterns.some(pattern => pattern.test(lowerLine)) || 
         lowerLine.length < 2 ||
         /^[^\w\s]*$/.test(lowerLine); // Just punctuation
}

function extractRecipeData(sections: RecipeSection[]): Partial<ScrapedRecipe> {
  let title = '';
  let description = '';
  const ingredients: string[] = [];
  const instructions: string[] = [];
  let prep_time: number | undefined;
  let cook_time: number | undefined;
  let servings: number | undefined;
  let notes = '';
  
  for (const section of sections) {
    switch (section.type) {
      case 'title':
        if (!title && section.content.length > 0) {
          title = section.content[0].trim();
          // Only use additional lines as description if they're clean introductory sentences
          if (section.content.length > 1) {
            const potentialDescription = section.content.slice(1).join(' ').trim();
            if (isValidDescription(potentialDescription)) {
              description = potentialDescription;
            }
          }
        }
        break;
        
      case 'prep':
        prep_time = extractTimeFromSection(section.content);
        break;
        
      case 'cook':
        cook_time = extractTimeFromSection(section.content);
        break;
        
      case 'serve':
        servings = extractServingsFromSection(section.content);
        break;
        
      case 'ingredients':
        ingredients.push(...extractIngredientsFromSection(section.content));
        break;
        
      case 'method':
        instructions.push(...extractMethodFromSection(section.content));
        break;
        
      case 'notes':
        const sectionNotes = section.content.join(' ').trim();
        if (sectionNotes) {
          notes += (notes ? ' ' : '') + sectionNotes;
        }
        break;
    }
  }
  
  // Fallback: if no structured sections found, try to parse as free text
  if (!title && ingredients.length === 0 && instructions.length === 0) {
    return fallbackParsing(sections);
  }
  
  return {
    title: title || 'Untitled Recipe',
    description: description && isValidDescription(description) ? description : undefined,
    ingredients: ingredients.length > 0 ? ingredients : ['No ingredients found'],
    instructions: instructions.length > 0 ? instructions : ['No instructions found'],
    prep_time,
    cook_time,
    servings,
    notes: notes || undefined
  };
}

function isValidDescription(text: string): boolean {
  if (!text || text.length < 10 || text.length > 300) {
    return false;
  }
  
  const lowerText = text.toLowerCase().trim();
  
  // Reject if it contains junk patterns
  const junkPatterns = [
    // Ratings and reviews
    /\d+\s*(star|rating|review)/i,
    /\d+\/5/i,
    /★+/i,
    /rate\s+this/i,
    
    // Video and media
    /video/i,
    /watch/i,
    /duration/i,
    /\d+\s*min.*video/i,
    
    // UI elements and metadata
    /save\s+to/i,
    /add\s+to/i,
    /share/i,
    /print/i,
    /email/i,
    /facebook/i,
    /twitter/i,
    /pinterest/i,
    /instagram/i,
    /subscribe/i,
    /follow/i,
    
    // Nutrition and dietary
    /\b(kcal|calories?|protein|fat|carbs?|fiber|sugar|sodium)\b/i,
    /nutrition/i,
    /per\s+serving/i,
    /gluten.?free/i,
    /dairy.?free/i,
    /vegetarian/i,
    /vegan/i,
    /keto/i,
    /paleo/i,
    
    // Time and serving info (should be in dedicated fields)
    /prep\s*:?\s*\d+/i,
    /cook\s*:?\s*\d+/i,
    /serves?\s*:?\s*\d+/i,
    /makes?\s*:?\s*\d+/i,
    /ready\s+in\s+\d+/i,
    
    // Author and source info
    /^by\s+/i,
    /author/i,
    /recipe\s+by/i,
    /created\s+by/i,
    
    // Website elements
    /more\s+recipes/i,
    /related\s+recipes/i,
    /you\s+might\s+like/i,
    /similar\s+recipes/i,
    /advertisement/i,
    /sponsored/i,
    
    // Just numbers or measurements
    /^\d+[\s\w]*$/i,
    /^[\d\s\-\/]+$/i,
  ];
  
  // Check for junk patterns
  if (junkPatterns.some(pattern => pattern.test(lowerText))) {
    return false;
  }
  
  // Reject if it's mostly numbers, punctuation, or very short words
  const words = text.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 3) {
    return false;
  }
  
  // Reject if more than 30% of characters are numbers
  const numberChars = (text.match(/\d/g) || []).length;
  if (numberChars / text.length > 0.3) {
    return false;
  }
  
  // Reject if it looks like a heading (all caps, very short, etc.)
  if (text === text.toUpperCase() && text.length < 50) {
    return false;
  }
  
  // Reject if it's just a list of ingredients or cooking terms without context
  const cookingTermsOnly = /^[\w\s,]+(?:flour|sugar|butter|oil|salt|pepper|onion|garlic|chicken|beef|pork)[\w\s,]*$/i;
  if (cookingTermsOnly.test(text) && !text.includes('recipe') && !text.includes('dish')) {
    return false;
  }
  
  // Accept if it looks like a proper sentence with descriptive content
  const hasProperSentence = /[.!?]$/.test(text.trim()) || 
                           text.includes('recipe') || 
                           text.includes('dish') ||
                           text.includes('delicious') ||
                           text.includes('perfect') ||
                           text.includes('classic') ||
                           text.includes('traditional') ||
                           text.includes('easy') ||
                           text.includes('quick') ||
                           text.includes('simple');
  
  return hasProperSentence && words.length >= 3 && words.length <= 50;
}

function extractTimeFromSection(content: string[]): number | undefined {
  for (const line of content) {
    const time = extractTimeFromLine(line);
    if (time) return time;
  }
  return undefined;
}

function extractTimeFromLine(line: string): number | undefined {
  const lowerLine = line.toLowerCase();
  
  // Pattern 1: "10 mins", "25 minutes", "1 hour", "1 hr 15 mins"
  const timeMatch = lowerLine.match(/(\d+(?:\s+to\s+\d+)?)\s*(min|minute|hour|hr)s?(?:\s+(\d+)\s*(min|minute)s?)?/i);
  if (timeMatch) {
    const mainTime = timeMatch[1];
    const mainUnit = timeMatch[2];
    const extraTime = timeMatch[3];
    const extraUnit = timeMatch[4];
    
    // Convert to minutes and return as number
    let totalMinutes = parseInt(mainTime);
    if (mainUnit.startsWith('h')) {
      totalMinutes *= 60;
    }
    if (extraTime && extraUnit) {
      totalMinutes += parseInt(extraTime);
    }
    return totalMinutes;
  }
  
  // Pattern 2: "Less than 30 mins"
  const lessMatch = lowerLine.match(/less\s+than\s+(\d+)\s*(min|minute|hour|hr)s?/i);
  if (lessMatch) {
    let minutes = parseInt(lessMatch[1]);
    if (lessMatch[2].startsWith('h')) {
      minutes *= 60;
    }
    return minutes;
  }
  
  // Pattern 3: "Ready in 40 mins"
  const readyMatch = lowerLine.match(/ready\s+in\s+(\d+(?:\s+to\s+\d+)?)\s*(min|minute|hour|hr)s?/i);
  if (readyMatch) {
    let minutes = parseInt(readyMatch[1]);
    if (readyMatch[2].startsWith('h')) {
      minutes *= 60;
    }
    return minutes;
  }
  
  return undefined;
}

function extractServingsFromSection(content: string[]): number | undefined {
  for (const line of content) {
    const servings = extractServingsFromLine(line);
    if (servings) return servings;
  }
  return undefined;
}

function extractServingsFromLine(line: string): number | undefined {
  const lowerLine = line.toLowerCase();
  
  // Pattern 1: "Serves 4", "Serves 4-6"
  const servesMatch = lowerLine.match(/serves?\s+(\d+(?:\s*[-–]\s*\d+)?)/i);
  if (servesMatch) {
    return parseInt(servesMatch[1].split(/[-–]/)[0].trim());
  }
  
  // Pattern 2: "Makes 8", "Makes 12 cookies"
  const makesMatch = lowerLine.match(/makes?\s+(\d+(?:\s*[-–]\s*\d+)?)/i);
  if (makesMatch) {
    return parseInt(makesMatch[1].split(/[-–]/)[0].trim());
  }
  
  // Pattern 3: "4 servings", "6-8 portions"
  const countMatch = lowerLine.match(/(\d+(?:\s*[-–]\s*\d+)?)\s+(servings?|portions?|people)/i);
  if (countMatch) {
    return parseInt(countMatch[1].split(/[-–]/)[0].trim());
  }
  
  return undefined;
}

function extractIngredientsFromSection(content: string[]): string[] {
  return content
    .filter(line => line.trim().length > 2)
    .filter(line => !isJunkLine(line))
    .map(line => line.trim())
    .filter(Boolean);
}

function extractMethodFromSection(content: string[]): string[] {
  const steps: string[] = [];
  let currentStep = '';
  
  for (const line of content) {
    const trimmedLine = line.trim();
    
    // Skip junk lines
    if (isJunkLine(trimmedLine) || trimmedLine.length < 5) {
      continue;
    }
    
    // Check if this line starts a new numbered step
    const numberedStepMatch = trimmedLine.match(/^(\d+\.?\s*)/);
    if (numberedStepMatch) {
      // Save previous step if exists
      if (currentStep.trim()) {
        steps.push(currentStep.trim());
      }
      // Start new step (remove the number)
      currentStep = trimmedLine.replace(/^\d+\.?\s*/, '').trim();
    } else {
      // Continue current step or start new one if none exists
      if (currentStep) {
        currentStep += ' ' + trimmedLine;
      } else {
        currentStep = trimmedLine;
      }
      
      // If this looks like a complete instruction and we're not in a numbered list,
      // treat it as a separate step
      if (!numberedStepMatch && (
        trimmedLine.endsWith('.') || 
        trimmedLine.endsWith('!') ||
        trimmedLine.length > 50 ||
        /\b(then|next|after|finally|meanwhile|while)\b/i.test(trimmedLine)
      )) {
        steps.push(currentStep.trim());
        currentStep = '';
      }
    }
  }
  
  // Add final step
  if (currentStep.trim()) {
    steps.push(currentStep.trim());
  }
  
  return steps.filter(step => step.length > 5);
}

function fallbackParsing(sections: RecipeSection[]): Partial<ScrapedRecipe> {
  // If structured parsing failed, try to extract from all content
  const allContent = sections
    .filter(section => section.type !== 'junk')
    .flatMap(section => section.content);
  
  let title = '';
  const ingredients: string[] = [];
  const instructions: string[] = [];
  let prep_time: number | undefined;
  let cook_time: number | undefined;
  let servings: number | undefined;
  
  // Try to find title (first substantial line)
  for (const line of allContent) {
    if (line.length > 3 && line.length < 100 && !isJunkLine(line)) {
      title = line;
      break;
    }
  }
  
  // Try to extract times and servings from any line
  for (const line of allContent) {
    if (!prep_time && line.toLowerCase().includes('prep')) {
      prep_time = extractTimeFromLine(line);
    }
    if (!cook_time && line.toLowerCase().includes('cook')) {
      cook_time = extractTimeFromLine(line);
    }
    if (!servings && (line.toLowerCase().includes('serve') || line.toLowerCase().includes('make'))) {
      servings = extractServingsFromLine(line);
    }
  }
  
  // Split remaining content between ingredients and instructions
  const remainingLines = allContent.filter(line => 
    line !== title && 
    !isJunkLine(line) && 
    line.length > 3
  );
  
  const midPoint = Math.ceil(remainingLines.length / 2);
  ingredients.push(...remainingLines.slice(0, midPoint));
  instructions.push(...remainingLines.slice(midPoint));
  
  return {
    title: title || 'Untitled Recipe',
    ingredients: ingredients.length > 0 ? ingredients : ['No ingredients found'],
    instructions: instructions.length > 0 ? instructions : ['No instructions found'],
    prep_time,
    cook_time,
    servings
  };
}