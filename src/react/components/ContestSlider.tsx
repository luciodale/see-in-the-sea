import { ArrowRight } from 'lucide-react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// Type definition for Swiper Slide to include progress property
interface SwiperSlide extends HTMLElement {
  progress: number;
}

interface Contest {
  id: string;
  name: string;
  description: string | null;
  winningImage?: string;
  link: string;
}

interface ContestSliderProps {
  contests: Contest[];
}

export function ContestSlider({ contests }: ContestSliderProps) {
  if (!contests || contests.length === 0) return null;

  return (
    <div className="w-full h-screen py-12 relative overflow-hidden bg-gradient-to-b from-slate-900 to-gray-900">
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 0,
          modifier: 1,
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        navigation={false}
        modules={[EffectCoverflow, Pagination]}
        className="w-full h-full !overflow-visible contest-swiper"
        initialSlide={0}
        watchSlidesProgress={true}
        speed={800}
        breakpoints={{
          // Mobile: Vertical orientation
          0: {
            direction: 'vertical',
            coverflowEffect: {
              stretch: 0, // Overlap vertically
            },
          },
          // Tablet/Desktop: Horizontal orientation
          768: {
            direction: 'horizontal',
            coverflowEffect: {
              stretch: 0,
            },
          },
        }}
        onProgress={swiper => {
          const slides = swiper.slides;
          const isVertical = swiper.params.direction === 'vertical';

          for (let i = 0; i < slides.length; i++) {
            const slide = slides[i] as unknown as SwiperSlide;
            const slideProgress = slide.progress;
            const absProgress = Math.abs(slideProgress);

            // Scale Logic
            const activeScale = 1 - Math.max(0, 1 - absProgress) * 0.15;

            const inner = slide.querySelector('.contest-inner') as HTMLElement;
            if (inner) {
              inner.style.transform = `scale(${activeScale})`;
            }

            // Image Parallax
            const lensScale = 1 + absProgress * 0.6;
            const parallaxAmount = slideProgress * 50;

            const image = slide.querySelector('.contest-image') as HTMLElement;
            if (image) {
              const finalImageScale = 1.2 * lensScale * (1 + (1 - activeScale));
              // Handle parallax direction based on orientation
              const translate = isVertical
                ? `translate3d(0, ${parallaxAmount}%, 0)`
                : `translate3d(${parallaxAmount}%, 0, 0)`;

              image.style.transform = `${translate} scale(${finalImageScale})`;
            }

            // Content Parallax
            const content = slide.querySelector(
              '.contest-content'
            ) as HTMLElement;
            if (content) {
              const contentParallax = slideProgress * 20;
              const textScale = 1 / activeScale;

              const translate = isVertical
                ? `translate3d(0, ${contentParallax}px, 0)`
                : `translate3d(${contentParallax}px, 0, 0)`;

              content.style.transform = `${translate} scale(${textScale})`;
              content.style.opacity = `${Math.max(0, 1 - absProgress * 0.5)}`;
            }
          }
        }}
        onSetTransition={(swiper, duration) => {
          const slides = swiper.slides;
          for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            const image = slide.querySelector('.contest-image') as HTMLElement;
            const content = slide.querySelector(
              '.contest-content'
            ) as HTMLElement;
            const inner = slide.querySelector('.contest-inner') as HTMLElement;

            if (image) image.style.transitionDuration = `${duration}ms`;
            if (content) content.style.transitionDuration = `${duration}ms`;
            if (inner) inner.style.transitionDuration = `${duration}ms`;
          }
        }}
      >
        {contests.map(contest => (
          <SwiperSlide
            key={contest.id}
            // Adjusted width/height for vertical mode
            // Mobile: High height, full width
            // Desktop: Fixed width, fixed/auto height
            className="!w-full !h-[60vh] md:!w-[70vw] md:!h-[70vh] group"
          >
            <a
              href={contest.link}
              className="contest-inner block w-full h-full relative overflow-hidden rounded-3xl origin-center will-change-transform"
            >
              {/* Full Slide Image Container */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl bg-slate-900">
                {contest.winningImage ? (
                  <div className="w-full h-full relative overflow-hidden">
                    <img
                      src={contest.winningImage}
                      alt={contest.name}
                      className="contest-image w-full h-full object-cover absolute inset-0 will-change-transform origin-center"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-6xl">🏆</span>
                  </div>
                )}

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

                {/* Shine effect */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />
              </div>

              {/* Content Overlay */}
              <div className="contest-content absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-10 text-white will-change-transform origin-bottom-left">
                <div className="flex flex-col gap-4">
                  <h3 className="text-4xl md:text-5xl font-extralight tracking-wide uppercase drop-shadow-2xl text-shadow-lg">
                    {contest.name}
                  </h3>

                  <div className="flex items-center gap-3 text-base font-medium text-blue-200 group-hover:text-white transition-colors">
                    <span>View Gallery</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>

              {/* Glass Border Overlay */}
              <div className="absolute inset-0 border border-white/20 rounded-3xl pointer-events-none z-40 group-hover:border-white/40 transition-colors duration-300" />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
        }
        .swiper-pagination-bullet-active {
          background: #fff;
        }
        .text-shadow-lg {
          text-shadow: 0 4px 8px rgba(0,0,0,0.5);
        }
        /* Vertical adjustments */
        .swiper-vertical .swiper-wrapper {
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
