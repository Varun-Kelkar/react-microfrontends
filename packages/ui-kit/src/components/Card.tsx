import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  image?: string;
  imageAlt?: string;
  footer?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  image,
  imageAlt = '',
  footer,
  className = '',
}) => {
  return (
    <div
      className={`bg-white dark:bg-secondary-800 rounded shadow-md overflow-hidden border border-secondary-200 dark:border-secondary-700 ${className}`}
    >
      {image && (
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        {title && (
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            {title}
          </h3>
        )}
        <div className="text-secondary-600 dark:text-secondary-300">{children}</div>
      </div>
      {footer && (
        <div className="px-4 py-3 bg-secondary-50 dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
