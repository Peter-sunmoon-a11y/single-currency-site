import { cn } from '@/utils/cn'
import { useEffect, useMemo, useState } from 'react'

type CurrencyIconProps = {
  currency: string
  className?: string
  fallbackSrc?: string
}

const loadedIconSrcSet = new Set<string>()

export const CurrencyIcon = ({ currency, className, fallbackSrc }: CurrencyIconProps) => {
  const iconSrc = useMemo(() => {
    if (!currency) return fallbackSrc ?? ''
    return `/images/currency/${currency.toLowerCase()}.png`
  }, [currency, fallbackSrc])

  const [currentSrc, setCurrentSrc] = useState(iconSrc)
  const [imageLoaded, setImageLoaded] = useState(() => loadedIconSrcSet.has(iconSrc))

  useEffect(() => {
    setCurrentSrc(iconSrc)
    setImageLoaded(loadedIconSrcSet.has(iconSrc))
  }, [iconSrc])

  return (
    <div className="relative">
      {/* 加载中的skeleton */}
      {!imageLoaded && (
        <div className={cn("skeleton bg-base-300 w-4 h-4 rounded-full absolute inset-0", className)} />
      )}
      
      {/* 实际图片 */}
      <img
        src={currentSrc}
        alt={currency}
        loading="eager"
        decoding="async"
        className={cn('w-4 h-4', className, {
          'opacity-0': !imageLoaded,
          'opacity-100': imageLoaded,
          'transition-opacity duration-200': true
        })}
        onLoad={() => {
          loadedIconSrcSet.add(currentSrc)
          setImageLoaded(true)
        }}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc)
            setImageLoaded(loadedIconSrcSet.has(fallbackSrc))
          }
        }}
      />
    </div>
  )
}
