'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
  showBorder?: boolean;
  rounded?: 'full' | 'lg' | 'md' | 'none';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
};

const roundedClasses = {
  full: 'rounded-full',
  lg: 'rounded-2xl',
  md: 'rounded-xl',
  none: 'rounded-none',
};

export function Avatar({
  src,
  alt,
  size = 'md',
  className = '',
  fallback,
  showBorder = false,
  rounded = 'full',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const hasValidSrc = src && src.trim() !== '' && !imageError;
  const defaultFallback = fallback || '🧑';

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Avatar] Failed to load image: ${src}`);
    }
  };

  const sizeClass = sizeClasses[size];
  const roundedClass = roundedClasses[rounded];
  const borderClass = showBorder ? 'border-2 border-primary/10' : '';

  return (
    <div className={`relative ${sizeClass} ${roundedClass} ${borderClass} ${className} overflow-hidden bg-primary/5`}>
      {isLoading && hasValidSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-transparent" />
        </div>
      )}

      {hasValidSrc ? (
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          sizes="(max-width: 768px) 32px, (max-width: 1024px) 48px, 64px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl md:text-3xl">
          {defaultFallback}
        </div>
      )}
    </div>
  );
}
