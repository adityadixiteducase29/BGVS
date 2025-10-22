import React from 'react';
import { Button as ReactstrapButton } from 'reactstrap';
import PropTypes from 'prop-types';
import './ButtonComponent.css';

const ButtonComponent = ({ 
  children, 
  backgroundColor, 
  textColor,
  size = 'default',
  variant = 'primary',
  className = '',
  ...props 
}) => {
  // Generate CSS classes based on props
  const getButtonClasses = () => {
    const baseClass = 'custom-button';
    const sizeClass = size !== 'default' ? `button-${size}` : '';
    const variantClass = variant ? `button-${variant}` : '';
    
    return `${baseClass} ${sizeClass} ${variantClass} ${className}`.trim();
  };

  // Custom styles for when backgroundColor and textColor are provided
  const getCustomStyles = () => {
    if (backgroundColor || textColor) {
      return {
        backgroundColor: backgroundColor || '#4F378B',
        color: textColor || '#FFFFFF',
        border: 'none',
        transition: 'all 0.2s ease',
      };
    }
    return {};
  };

  return (
    <ReactstrapButton
      className={getButtonClasses()}
      style={getCustomStyles()}
      {...props}
    >
      {children}
    </ReactstrapButton>
  );
};

ButtonComponent.propTypes = {
  children: PropTypes.node.isRequired,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'default', 'lg']),
  variant: PropTypes.oneOf([
    'primary', 'secondary', 'success', 'danger', 
    'warning', 'info', 'light', 'dark', 'outline'
  ]),
  className: PropTypes.string,
};

export default ButtonComponent;
