// Theme types
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Storage key for theme preference
const THEME_STORAGE_KEY = 'flowpal-theme-preference';

/**
 * Check if the current color scheme preference is dark
 * @returns {boolean} True if preferred color scheme is dark
 */
export function isSystemDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Apply the appropriate theme class to the document
 * @param {string} theme - The theme to apply (light, dark, or system)
 */
function applyTheme(theme) {
  const isDark = theme === THEMES.DARK || (theme === THEMES.SYSTEM && isSystemDarkMode());
  
  // For Tailwind v4, we need to add/remove the dark class
  // from the html element to trigger the dark mode variant
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
}

/**
 * Set the theme and save the preference
 * @param {string} theme - The theme preference to set
 */
export function setTheme(theme) {
  if (!Object.values(THEMES).includes(theme)) {
    return;
  }
  
  // Save to localStorage
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  
  // Apply the theme
  applyTheme(theme);
}

/**
 * Get the current theme preference
 * @returns {string} The current theme (light, dark, or system)
 */
export function getTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || THEMES.SYSTEM;
}

/**
 * Initialize the theme system
 */
export function initializeTheme() {
  // Get the saved theme or use system by default
  const savedTheme = getTheme();
  
  // Apply the theme immediately
  applyTheme(savedTheme);
  
  // Set up listener for system preference changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleMediaChange = () => {
      if (getTheme() === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM);
      }
    };
    
    // This is for Safari/older browsers that don't support addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (mediaQuery.addListener) {
      // For older browsers
      mediaQuery.addListener(handleMediaChange);
    }
  }
} 