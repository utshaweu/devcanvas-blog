import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './button';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, effectiveTheme, toggleTheme } = useTheme();

  // show icon representing the user's choice: light, dark, or system
  const icon = theme === 'light' ? <Sun className="h-4 w-4" /> : theme === 'dark' ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Toggle theme (current: ${theme}, applied: ${effectiveTheme})`} title={`Theme: ${theme} (applied: ${effectiveTheme})`}>
      {icon}
    </Button>
  );
};

export default ThemeToggle;
