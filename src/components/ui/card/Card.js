import React from 'react';
import { cardVariants, cardSizes, headerStyles, footerStyles } from './Card.styles';

/**
 * Card component for displaying content in a contained, styled box
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Content to display inside the card
 * @param {string} props.className - Additional CSS classes
 * @param {'default'|'bordered'|'flat'|'elevated'} props.variant - Visual style variant
 * @param {'sm'|'md'|'lg'} props.size - Size of the card padding
 */
export const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md',
  ...props 
}) => {
  // Determine correct classes based on provided props
  const variantClasses = cardVariants[variant] || cardVariants.default;
  const sizeClasses = size === 'custom' ? '' : (cardSizes[size] || cardSizes.md);
  
  return (
    <div 
      className={`${variantClasses} ${sizeClasses} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardHeader component for the top section of a card
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Content to display in the header
 * @param {string} props.className - Additional CSS classes
 * @param {'default'|'transparent'|'colored'} props.variant - Header style variant
 */
export const CardHeader = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  // Get the correct header style based on variant
  const headerStyle = headerStyles[variant] || headerStyles.default;
  
  return (
    <div 
      className={`${headerStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardTitle component for the main heading within a card
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Title content
 * @param {string} props.className - Additional CSS classes
 * @param {'h1'|'h2'|'h3'|'h4'|'h5'|'h6'} props.as - HTML element to render as
 */
export const CardTitle = ({ 
  children, 
  className = '', 
  as: Component = 'h3',
  ...props 
}) => {
  return (
    <Component 
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * CardDescription component for supporting text below the title
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Description content
 * @param {string} props.className - Additional CSS classes
 */
export const CardDescription = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <p 
      className={`mt-1 text-sm text-gray-600 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

/**
 * CardContent component for the main content area of a card
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Main content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.padded - Whether to apply default padding
 */
export const CardContent = ({ 
  children, 
  className = '', 
  padded = true,
  ...props 
}) => {
  const paddingClass = padded ? 'px-6 py-4' : '';
  
  return (
    <div 
      className={`${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardFooter component for the bottom section of a card
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Footer content
 * @param {string} props.className - Additional CSS classes
 * @param {'default'|'transparent'|'colored'} props.variant - Footer style variant
 */
export const CardFooter = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  // Get the correct footer style based on variant
  const footerStyle = footerStyles[variant] || footerStyles.default;
  
  return (
    <div 
      className={`${footerStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardActions component for action buttons in the card
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Action buttons/links
 * @param {string} props.className - Additional CSS classes
 * @param {'start'|'center'|'end'|'between'|'around'|'evenly'} props.align - Horizontal alignment
 */
export const CardActions = ({
  children,
  className = '',
  align = 'end',
  ...props
}) => {
  const alignmentMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClass = alignmentMap[align] || alignmentMap.end;

  return (
    <div
      className={`flex items-center ${alignClass} mt-4 space-x-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardDivider component for visual separation within a card
 */
export const CardDivider = ({ className = '', ...props }) => {
  return <hr className={`my-4 border-t border-gray-200 ${className}`} {...props} />;
};

/**
 * CardImage component for displaying images in a card
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text
 * @param {'top'|'bottom'|null} props.position - Position in the card
 */
export const CardImage = ({
  src,
  alt = '',
  position = null,
  className = '',
  ...props
}) => {
  const positionClasses = {
    top: 'rounded-t-lg',
    bottom: 'rounded-b-lg',
  };

  const positionClass = position ? positionClasses[position] || '' : '';

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full ${positionClass} ${className}`}
      {...props}
    />
  );
};

//I want to enhance all of my pages. When you generate the codes to do so, compare the old code with the new code that will replace. This will allow me to copy and paste quickly and avoid confusion