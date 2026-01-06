import { type Contest } from '@/data/past-contests';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ContestAndLink = {
  link: string;
} & Contest;

interface ContestSliderProps {
  contests: ContestAndLink[];
}

export function ContestSlider({ contests }: ContestSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector('a')?.offsetWidth || 400;
    const gap = 24;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -(cardWidth + gap) : cardWidth + gap,
      behavior: 'smooth',
    });
  };

  if (!contests || contests.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <div className="pt-24 pb-8 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extralight text-white tracking-wider uppercase">
          Past Contests
        </h1>
        <p className="mt-4 text-slate-400 text-lg font-light">
          Explore winning photographs from previous editions
        </p>
      </div>

      {/* Slider Container */}
      <div className="flex-1 flex items-center relative">
        {/* Left Arrow - Desktop only */}
        <button
          onClick={() => scroll('left')}
          className={`hidden md:flex absolute left-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 ${
            canScrollLeft
              ? 'opacity-100 hover:bg-white/20 hover:scale-110'
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Previous contest"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Edge gradients - hint there's more content */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none md:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none md:hidden" />

        {/* Scrollable Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 px-6 md:px-12 w-full scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {contests.map(contest => (
            <a
              key={contest.id}
              href={contest.link}
              className="group flex-shrink-0 snap-center w-[75vw] md:w-[60vw] lg:w-[45vw] xl:w-[35vw] aspect-[4/5] md:aspect-[3/4] relative rounded-2xl overflow-hidden"
            >
              {/* Background Image */}
              {contest.indexImage ? (
                <img
                  src={contest.indexImage}
                  alt={contest.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-8xl opacity-50">🏆</span>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <h2 className="text-3xl md:text-4xl font-light text-white tracking-wide uppercase mb-3">
                    {contest.name}
                  </h2>

                  <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium tracking-wide">
                      View Gallery
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>

              {/* Subtle border */}
              <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/25 transition-colors duration-300 pointer-events-none" />
            </a>
          ))}
        </div>

        {/* Right Arrow - Desktop only */}
        <button
          onClick={() => scroll('right')}
          className={`hidden md:flex absolute right-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 ${
            canScrollRight
              ? 'opacity-100 hover:bg-white/20 hover:scale-110'
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Next contest"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
