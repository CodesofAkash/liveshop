// src/components/ui/optimized-image.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  aspectRatio?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  onError?: () => void
  fallbackSrc?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  aspectRatio,
  fill = false,
  priority = false,
  sizes,
  onError,
  fallbackSrc = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop'
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const imageStyle: React.CSSProperties = {
    ...(width && height && !fill && {
      width: '100%',
      height: 'auto',
      aspectRatio: `${width}/${height}`
    }),
    ...(aspectRatio && {
      aspectRatio
    })
  }

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn('object-cover transition-opacity duration-300', {
            'opacity-0': isLoading,
            'opacity-100': !isLoading
          })}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={imageStyle}
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        style={imageStyle}
        className={cn('object-cover transition-opacity duration-300', {
          'opacity-0': isLoading,
          'opacity-100': !isLoading
        })}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}
