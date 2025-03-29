import React from 'react';

interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
  variant?: 'default' | 'fullscreen' | 'inline';
  size?: 'small' | 'medium' | 'large';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  isLoading,
  message = 'Loading...',
  variant = 'default',
  size = 'medium'
}) => {
  if (!isLoading) return null;

  const getClasses = () => {
    const classes = ['loading-indicator'];
    classes.push(`variant-${variant}`);
    classes.push(`size-${size}`);
    return classes.join(' ');
  };

  return (
    <div className={getClasses()}>
      <div className="loading-spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};
