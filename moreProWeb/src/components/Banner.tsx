import { useState, useEffect } from 'react';
import { Banner as BannerType } from '../api';

interface BannerProps {
  banners: BannerType[];
  onBannerClick: (link: string) => void;
}

export function Banner({ banners, onBannerClick }: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex-shrink-0 w-full"
            onClick={() => onBannerClick(banner.link_url || '')}
          >
            <img
              src={banner.image_url}
              alt=""
              className="w-full h-32 md:h-48 object-cover"
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-4 bg-orange-500' : 'bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}