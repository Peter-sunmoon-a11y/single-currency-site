import React, { useState, useEffect, useCallback } from 'react';
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";

interface FavoriteButtonProps {
  /** 初始收藏状态 */
  initialLiked?: boolean;
  /** 状态变化回调 - 在这里处理 API 请求 */
  onToggle?: (isLiked: boolean) => void | Promise<void>;
  /** 按钮大小 */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** 未收藏时的轮廓颜色 */
  color?: string;
  /** 禁用状态 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 现代化扁平设计的收藏按钮，带有精致的交互动画效果
 * 
 * API 请求应该在 onToggle 回调中处理
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  initialLiked = false,
  onToggle,
  size = 'sm',
  color,
  disabled = false,
  className = '',
}) => {
  const { navigateCallback } = useNavigateGuard()

  const [liked, setLiked] = useState(initialLiked);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  
  // 6个粒子，对称分布
  const particleCount = 6;
  
  // 图标大小映射
  const iconSizeMap = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
  };
  
  const iconSize = iconSizeMap[size];

  // 同步外部状态变化
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    const newState = !liked;
    setLiked(newState);
    
    // 仅在点赞时触发动画
    if (newState) {
      setIsAnimating(true);
      setAnimationKey(prev => prev + 1);
    }

    // 调用外部回调处理 API 请求
    if (onToggle) {
      try {
        await onToggle(newState);
      } catch (error) {
        // API 失败时回滚状态
        setLiked(!newState);
        setIsAnimating(false);
      }
    }
  }, [liked, disabled, onToggle]);

  // 动画完成后重置状态
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, animationKey]);

  return (
    <button
      onClick={(e) => {
        navigateCallback(() => {
          void handleClick(e)
        }, true)
      }}
      disabled={disabled}
      className={`
        btn btn-square btn-ghost
        btn-${size}
        group relative
        ${className}
      `}
      aria-label={liked ? "favorite" : "unfavorite"}
      aria-pressed={liked}
    >
      {/* 粒子系统 - 仅在动画时渲染 */}
      {isAnimating && (
        <div 
          key={animationKey}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          aria-hidden="true"
        >
          {Array.from({ length: particleCount }).map((_, i) => (
            <Particle 
              key={i} 
              index={i} 
              total={particleCount}
              size={iconSize}
            />
          ))}
        </div>
      )}

      {/* 主图标 - 扁平设计 */}
      <div 
        className={`
          relative transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
          ${liked ? 'scale-100' : 'scale-100 group-hover:scale-105'}
          ${isAnimating ? 'animate-heart-pop' : ''}
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          className={`
            overflow-visible transition-all duration-300
            ${liked ? 'text-error opacity-100' : (color === 'white' ? 'text-white opacity-60 group-hover:opacity-100' : 'text-base-content/60 group-hover:text-base-content')}
          `}
        >
          <path 
            fill="currentColor" 
            d="M2 9.137C2 14 6.02 16.591 8.962 18.911C10 19.729 11 20.5 12 20.5s2-.77 3.038-1.59C17.981 16.592 22 14 22 9.138S16.5.825 12 5.501C7.5.825 2 4.274 2 9.137"
          />
        </svg>
      </div>

      {/* 内联动画样式 */}
      <style>{`
        @keyframes heart-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        .animate-heart-pop {
          animation: heart-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes particle-burst {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(var(--travel-dist)) scale(0); opacity: 0; }
        }
        .animate-particle-burst {
          animation: particle-burst 0.4s ease-out forwards;
        }
      `}</style>
    </button>
  );
};

// ----------------------------------------------------------------------
// 粒子组件
// ----------------------------------------------------------------------

interface ParticleProps {
  index: number;
  total: number;
  size: number;
}

const Particle: React.FC<ParticleProps> = ({ index, total, size }) => {
  const angle = (index / total) * 360;
  const partSize = Math.max(2, size / 10); 
  const colors = ['#ef4444', '#f87171']; // Tailwind Red-500, Red-400
  const color = colors[index % colors.length];
  const dist = size * 0.6;

  return (
    <div
      className="absolute top-1/2 left-1/2 w-0 h-0"
      style={{ transform: `rotate(${angle}deg)` }}
    >
      <div 
         className="rounded-full animate-particle-burst"
         style={{
           width: partSize,
           height: partSize,
           backgroundColor: color,
           marginTop: -partSize / 2,
           marginLeft: -partSize / 2,
           '--travel-dist': `${dist}px`,
         } as React.CSSProperties}
      />
    </div>
  );
};