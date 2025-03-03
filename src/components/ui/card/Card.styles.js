/**
 * Primary card styling variants
 */
export const cardVariants = {
  default: 'bg-white rounded-lg shadow-md',
  bordered: 'bg-white rounded-lg border border-gray-200',
  flat: 'bg-white rounded-lg',
  elevated: 'bg-white rounded-lg shadow-lg',
  primary: 'bg-blue-50 border border-blue-200 rounded-lg',
  secondary: 'bg-gray-50 border border-gray-200 rounded-lg',
  success: 'bg-green-50 border border-green-200 rounded-lg',
  warning: 'bg-yellow-50 border border-yellow-200 rounded-lg',
  danger: 'bg-red-50 border border-red-200 rounded-lg',
  info: 'bg-cyan-50 border border-cyan-200 rounded-lg',
};

/**
 * Card sizing options
 */
export const cardSizes = {
  xs: 'p-2',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

/**
 * Header style variants
 */
export const headerStyles = {
  default: 'px-6 py-4 border-b border-gray-200',
  transparent: 'px-6 py-4',
  colored: 'px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg',
  primary: 'px-6 py-4 bg-blue-500 text-white rounded-t-lg',
  secondary: 'px-6 py-4 bg-gray-500 text-white rounded-t-lg',
  success: 'px-6 py-4 bg-green-500 text-white rounded-t-lg',
  warning: 'px-6 py-4 bg-yellow-500 text-white rounded-t-lg',
  danger: 'px-6 py-4 bg-red-500 text-white rounded-t-lg',
  gradient: 'px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg',
};

/**
 * Footer style variants
 */
export const footerStyles = {
  default: 'px-6 py-4 border-t border-gray-200',
  transparent: 'px-6 py-4',
  colored: 'px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg',
  sticky: 'px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white',
  flex: 'px-6 py-4 border-t border-gray-200 flex justify-between items-center',
};

/**
 * Card content area styles
 */
export const contentStyles = {
  default: 'px-6 py-4',
  compact: 'px-4 py-3',
  spacious: 'px-8 py-6',
  flush: 'p-0',
};

/**
 * Card interaction states
 */
export const cardInteractions = {
  hoverable: 'transition-shadow duration-200 hover:shadow-lg',
  clickable: 'cursor-pointer transition-all duration-200 hover:shadow-md active:shadow-inner active:translate-y-px',
  selectable: 'cursor-pointer transition-all hover:bg-gray-50',
};