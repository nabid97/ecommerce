import React, { FC, ReactNode } from 'react';
import { 
  cardVariants, 
  cardSizes, 
  headerStyles, 
  footerStyles, 
  contentStyles 
} from './Card.styles';

// Define prop types for each component
export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: string;
  size?: string;
  onClick?: () => void;
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  variant?: string;
}

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
  variant?: string;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  variant?: string;
}

export interface CardDividerProps {
  className?: string;
}

export interface CardActionsProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const Card: FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default', 
  size = 'md',
  onClick,
  ...props 
}) => {
  const variantClass = cardVariants[variant] || cardVariants.default;
  const sizeClass = cardSizes[size] || cardSizes.md;

  return (
    <div 
      className={`${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: FC<CardHeaderProps> = ({ 
  children, 
  className = '', 
  variant = 'default' 
}) => {
  const variantClass = headerStyles[variant] || headerStyles.default;

  return (
    <div className={`${variantClass} ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: FC<CardTitleProps> = ({ 
  children, 
  className = '',
  as: Component = 'h3'
}) => {
  return (
    <Component className={`font-semibold text-lg ${className}`}>
      {children}
    </Component>
  );
};

export const CardDescription: FC<CardDescriptionProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>
      {children}
    </p>
  );
};

export const CardContent: FC<CardContentProps> = ({ 
  children, 
  className = '',
  variant = 'default'
}) => {
  const variantClass = contentStyles[variant] || contentStyles.default;

  return (
    <div className={`${variantClass} ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: FC<CardFooterProps> = ({ 
  children, 
  className = '',
  variant = 'default'
}) => {
  const variantClass = footerStyles[variant] || footerStyles.default;

  return (
    <div className={`${variantClass} ${className}`}>
      {children}
    </div>
  );
};

export const CardDivider: FC<CardDividerProps> = ({ 
  className = '' 
}) => {
  return (
    <hr className={`border-t border-gray-200 my-0 ${className}`} />
  );
};

export const CardActions: FC<CardActionsProps> = ({ 
  children, 
  className = '',
  align = 'left'
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  const alignClass = alignmentClasses[align] || alignmentClasses.left;

  return (
    <div className={`flex items-center ${alignClass} ${className}`}>
      {children}
    </div>
  );
};

export const CardImage: FC<CardImageProps> = ({ 
  src, 
  alt, 
  className = '' 
}) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`w-full h-auto object-cover ${className}`}
    />
  );
};