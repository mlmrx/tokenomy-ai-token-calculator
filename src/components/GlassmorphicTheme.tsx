
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicThemeProps {
  children: React.ReactNode;
  variant?: 'default' | 'card' | 'nav' | 'button' | 'input' | 'hero' | 'feature';
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
  animated?: boolean;
}

const GlassmorphicTheme: React.FC<GlassmorphicThemeProps> = ({
  children,
  variant = 'default',
  className,
  intensity = 'medium',
  animated = false
}) => {
  const getVariantClasses = () => {
    const baseClasses = {
      light: 'backdrop-blur-sm bg-white/10 border border-white/10',
      medium: 'backdrop-blur-md bg-white/20 border border-white/20',
      strong: 'backdrop-blur-lg bg-white/30 border border-white/30'
    };

    const variants = {
      default: cn('glass', baseClasses[intensity]),
      card: cn('glass-card', baseClasses[intensity]),
      nav: cn('glass-nav', baseClasses[intensity]),
      button: cn('glass-button', baseClasses[intensity]),
      input: cn('glass-input', baseClasses[intensity]),
      hero: cn('glass-hero', baseClasses[intensity]),
      feature: cn('glass-feature', baseClasses[intensity])
    };

    return variants[variant];
  };

  const animationClass = animated ? 'transition-all duration-300 hover:backdrop-blur-xl hover:bg-white/40' : '';

  return (
    <div className={cn(getVariantClasses(), animationClass, className)}>
      {children}
    </div>
  );
};

export default GlassmorphicTheme;
