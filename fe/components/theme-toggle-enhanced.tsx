'use client';
import { Moon, Sun } from 'lucide-react';
import { useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AnimationVariant = 'circle' | 'circle-blur' | 'polygon' | 'none';
type StartPosition =
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface ThemeToggleEnhancedProps {
  showLabel?: boolean;
  variant?: AnimationVariant;
  start?: StartPosition;
  className?: string;
}

export const ThemeToggleEnhanced = ({
  showLabel = false,
  variant = 'circle',
  start = 'center',
  className,
}: ThemeToggleEnhancedProps) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = useCallback(() => {
    // Only inject animation CSS if variant is not 'none'
    if (variant !== 'none') {
      const styleId = `theme-transition-${Date.now()}`;
      const style = document.createElement('style');
      style.id = styleId;

      // Generate animation CSS based on variant
      let css = '';
      const positions = {
        center: 'center',
        'top-left': 'top left',
        'top-right': 'top right',
        'bottom-left': 'bottom left',
        'bottom-right': 'bottom right',
      };

      if (variant === 'circle') {
        const cx = start === 'center' ? '50' : start.includes('left') ? '0' : '100';
        const cy =
          start === 'center' ? '50' : start.includes('top') ? '0' : '100';
        css = `
          @supports (view-transition-name: root) {
            ::view-transition-old(root) { 
              animation: none;
            }
            ::view-transition-new(root) {
              animation: circle-expand 0.8s ease-out;
              transform-origin: ${positions[start]};
            }
            @keyframes circle-expand {
              from {
                clip-path: circle(0% at ${cx}% ${cy}%);
              }
              to {
                clip-path: circle(150% at ${cx}% ${cy}%);
              }
            }
          }
        `;
      } else if (variant === 'circle-blur') {
        const cx = start === 'center' ? '50' : start.includes('left') ? '0' : '100';
        const cy =
          start === 'center' ? '50' : start.includes('top') ? '0' : '100';
        css = `
          @supports (view-transition-name: root) {
            ::view-transition-old(root) { 
              animation: none;
            }
            ::view-transition-new(root) {
              animation: circle-blur-expand 0.8s ease-out;
              transform-origin: ${positions[start]};
              filter: blur(0);
            }
            @keyframes circle-blur-expand {
              from {
                clip-path: circle(0% at ${cx}% ${cy}%);
                filter: blur(4px);
              }
              to {
                clip-path: circle(150% at ${cx}% ${cy}%);
                filter: blur(0);
              }
            }
          }
        `;
      } else if (variant === 'polygon') {
        css = `
          @supports (view-transition-name: root) {
            ::view-transition-old(root) {
              animation: none;
            }
            ::view-transition-new(root) {
              animation: ${isDark ? 'wipe-in-dark' : 'wipe-in-light'} 0.8s ease-out;
            }
            @keyframes wipe-in-dark {
              from {
                clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
              }
              to {
                clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
              }
            }
            @keyframes wipe-in-light {
              from {
                clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
              }
              to {
                clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
              }
            }
          }
        `;
      }

      if (css) {
        style.textContent = css;
        document.head.appendChild(style);

        // Clean up animation styles after transition
        setTimeout(() => {
          const styleEl = document.getElementById(styleId);
          if (styleEl) {
            styleEl.remove();
          }
        }, 3000);
      }
    }

    // Toggle the theme
    const newTheme = isDark ? 'light' : 'dark';

    // Use View Transitions API if available
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setTheme(newTheme);
      });
    } else {
      setTheme(newTheme);
    }
  }, [isDark, setTheme, variant, start]);

  return (
    <Button
      variant="outline"
      size={showLabel ? 'default' : 'icon'}
      onClick={handleClick}
      className={cn('relative overflow-hidden', showLabel && 'gap-2', className)}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`absolute w-5 h-5 text-primary transition-all duration-700 ${
            isDark
              ? 'opacity-0 scale-0 rotate-180'
              : 'opacity-100 scale-100 rotate-0'
          }`}
        />

        {/* Moon Icon */}
        <Moon
          className={`absolute w-5 h-5 text-primary transition-all duration-700 ${
            isDark
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-0 -rotate-180'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-sm">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </Button>
  );
};

// Export a helper hook for using with View Transitions API
export const useThemeTransition = () => {
  const startTransition = useCallback((updateFn: () => void) => {
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(updateFn);
    } else {
      updateFn();
    }
  }, []);
  return { startTransition };
};
