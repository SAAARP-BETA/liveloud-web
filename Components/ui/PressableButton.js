// PressableButton.js - A reusable button component with press animations
'use client'
import React, { useRef, useState } from 'react';

const PressableButton = ({
  onPress,
  title,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'filled', // 'filled', 'outlined', 'ghost'
  size = 'medium', // 'small', 'medium', 'large'
  rounded = 'medium', // 'none', 'small', 'medium', 'full'
  leftIcon,
  rightIcon,
  color = '#0EA5E9', // Primary color
  testID,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    if (disabled || loading) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (disabled || loading) return;
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  // Get variant-specific styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: disabled ? '#D1D5DB' : color,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          border: 'none',
        };
      case 'filled':
      default:
        return {
          backgroundColor: disabled ? '#E5E7EB' : color,
          border: 'none',
        };
    }
  };

  // Get size-specific styles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingTop: '8px',
          paddingBottom: '8px',
          paddingLeft: '12px',
          paddingRight: '12px',
          minHeight: '36px',
        };
      case 'large':
        return {
          paddingTop: '16px',
          paddingBottom: '16px',
          paddingLeft: '24px',
          paddingRight: '24px',
          minHeight: '56px',
        };
      case 'medium':
      default:
        return {
          paddingTop: '12px',
          paddingBottom: '12px',
          paddingLeft: '16px',
          paddingRight: '16px',
          minHeight: '44px',
        };
    }
  };

  // Get rounded styles
  const getRoundedStyle = () => {
    switch (rounded) {
      case 'none':
        return { borderRadius: '0' };
      case 'small':
        return { borderRadius: '4px' };
      case 'full':
        return { borderRadius: '9999px' };
      case 'medium':
      default:
        return { borderRadius: '8px' };
    }
  };

  // Get text styles based on variant and state
  const getTextStyle = () => {
    let textColor = '#FFFFFF'; // Default for filled

    if (variant === 'outlined' || variant === 'ghost') {
      textColor = disabled ? '#9CA3AF' : color;
    } else {
      textColor = disabled ? '#9CA3AF' : '#FFFFFF';
    }

    return {
      color: textColor,
      fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
      fontWeight: '600',
    };
  };

  const buttonStyles = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    outline: 'none',
    transition: 'all 0.15s ease',
    transform: isPressed && !disabled && !loading ? 'scale(0.98)' : 'scale(1)',
    opacity: isPressed && !disabled && !loading ? 0.9 : 1,
    ...getVariantStyle(),
    ...getSizeStyle(),
    ...getRoundedStyle(),
    ...style,
  };

  const textStyles = {
    textAlign: 'center',
    ...getTextStyle(),
    ...textStyle,
  };

  return (
    <button
      data-testid={testID}
      onClick={disabled || loading ? null : onPress}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      style={buttonStyles}
    >
      {loading ? (
        <div
          style={{
            width: '20px',
            height: '20px',
            border: `2px solid ${variant === 'filled' ? '#FFFFFF' : color}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {leftIcon && (
            <div style={{ marginRight: '8px' }}>
              {leftIcon}
            </div>
          )}
          <span style={textStyles}>
            {title}
          </span>
          {rightIcon && (
            <div style={{ marginLeft: '8px' }}>
              {rightIcon}
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default PressableButton;