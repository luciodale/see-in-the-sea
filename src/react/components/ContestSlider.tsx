import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Contest } from '@/data/past-contests';
import type { Language } from '@/i18n/translations';
import { useTranslations } from '@/i18n/utils';

type ContestAndLink = {
  link: string;
} & Contest;

type ContestSliderProps = {
  contests: ContestAndLink[];
  lang: Language;
};

export function ContestSlider({ contests, lang }: ContestSliderProps) {
  const t = useTranslations(lang);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

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
  }, [updateScrollButtons]);

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

  const cardClass =
    'group relative rounded-2xl overflow-hidden border border-border hover:border-border-strong transition-colors duration-300 ' +
    'w-full aspect-[4/5] sm:w-full sm:aspect-[16/10] ' +
    'md:flex-shrink-0 md:snap-center md:w-[55vw] lg:w-[42vw] xl:w-[32vw] md:aspect-[4/5]';

  const cards = contests.map(contest => (
    <a key={contest.id} href={contest.link} className={cardClass}>
      {contest.indexImage ? (
        <img
          src={contest.indexImage}
          alt={contest.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-surface flex items-center justify-center">
          <span className="text-8xl opacity-40">&#127942;</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
        <div className="space-y-3 transform transition-transform duration-300 group-hover:-translate-y-1">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-display tracking-display">
            {contest.name}
          </h2>

          <div className="flex items-center gap-2 text-foreground/70 group-hover:text-foreground transition-colors">
            <span className="text-editorial uppercase tracking-editorial">
              {t('contests.slider.view-gallery')}
            </span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </a>
  ));

  return (
    <div className="bg-background">
      {/* Mobile: vertical stack that scrolls with the page */}
      <div className="md:hidden flex flex-col gap-6 px-4 py-8 max-w-md mx-auto">
        {cards}
      </div>

      {/* Desktop: horizontal carousel, full-screen feature */}
      <div className="hidden md:flex min-h-screen flex-col">
        <div className="flex-1 flex items-center relative">
          <button
            type="button"
            onClick={() => scroll('left')}
            className={`absolute left-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-surface border border-border text-foreground/85 transition-all duration-300 ${
              canScrollLeft
                ? 'opacity-100 hover:bg-surface-hover hover:border-border-strong hover:text-foreground'
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Previous contest"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 px-12 w-full scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {cards}
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            className={`absolute right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-surface border border-border text-foreground/85 transition-all duration-300 ${
              canScrollRight
                ? 'opacity-100 hover:bg-surface-hover hover:border-border-strong hover:text-foreground'
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Next contest"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
