"use client";

import React, { useState, useEffect } from "react";

export const DUMMY_IMAGE = "/images/dummy-image.svg";
export const DUMMY_USER_IMAGE = "/images/dummy-user.svg";

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = DUMMY_IMAGE
) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallback;
};

interface ImageWithFallbackProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = DUMMY_IMAGE,
  className,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(!src);
  }, [src, fallbackSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
    onError?.(e);
  };

  return (
    <img
      src={hasError ? fallbackSrc : (imgSrc || fallbackSrc)}
      alt={hasError ? "" : alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
