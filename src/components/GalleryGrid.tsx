"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface GalleryGridProps {
  images: string[];
  gridClass: string;
  cardClass: string;
  imageClass: string;
  useFill?: boolean;
}

export default function GalleryGrid({ images, gridClass, cardClass, imageClass, useFill = false }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight" && selectedIndex !== null) {
        setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev));
      }
      if (e.key === "ArrowLeft" && selectedIndex !== null) {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, images.length]);

  return (
    <>
      {/* The Grid */}
      <div className={gridClass}>
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className={`${cardClass} cursor-pointer`}
            onClick={() => setSelectedIndex(idx)}
          >
            {useFill ? (
              <Image 
                src={img} 
                alt={`Gallery image ${idx + 1}`} 
                fill 
                className={imageClass}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={idx < 6}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={img} 
                alt={`Gallery image ${idx + 1}`} 
                className={imageClass}
              />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200">
          <button 
            className="absolute top-6 right-6 text-white hover:text-[#d4af37] transition-colors z-50 p-2"
            onClick={() => setSelectedIndex(null)}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          <button 
            className="absolute left-4 md:left-10 text-white hover:text-[#d4af37] transition-colors z-50 p-4 disabled:opacity-30 disabled:hover:text-white"
            onClick={() => setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
            disabled={selectedIndex === 0}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>

          <div className="relative w-full max-w-5xl aspect-square md:aspect-video rounded-lg overflow-hidden shadow-2xl">
            <Image 
              src={images[selectedIndex]} 
              alt="Lightbox" 
              fill 
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <button 
            className="absolute right-4 md:right-10 text-white hover:text-[#d4af37] transition-colors z-50 p-4 disabled:opacity-30 disabled:hover:text-white"
            onClick={() => setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev))}
            disabled={selectedIndex === images.length - 1}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-sm tracking-widest">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
