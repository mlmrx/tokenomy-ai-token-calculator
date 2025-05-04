import React, { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

/* -------------------------------------------------------------------------- */
/*  DATA MODEL + DATA (unchanged except logo now always shows)                */
/* -------------------------------------------------------------------------- */
export interface CompanyStatType {
  name: string;
  ceo: string;
  position: string;
  aiFocusArea: string;
  flagshipAIProduct: string;
  imageUrl: string;
  logoUrl: string;
  color: string;
  foundedYear: number;
  headquarters: string;
  estimatedTokens: string;
  stats: string;
}

const companyStats: CompanyStatType[] = [
  /* … same objects as before … */
];

/* -------------------------------------------------------------------------- */
/*  COMPONENT                                                                 */
/* -------------------------------------------------------------------------- */
const CompanyStatsCarousel: React.FC = () => {
  const [api, setApi] = useState<CarouselApi | null>(null);

  /* autoplay */
  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => api.scrollNext?.(), 5_000);
    return () => clearInterval(id);
  }, [api]);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      {/* header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800 dark:text-white">
          AI Industry Leaders
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Key players, their flagship AI, and monthly token scale
        </p>
      </div>

      {/* carousel */}
      <div className="relative px-12">
        <Carousel
          opts={{ align: 'start', loop: true }}
          className="w-full"
          setApi={setApi}
        >
          <CarouselContent className="-ml-4">
            {companyStats.map((c, i) => (
              <CarouselItem
                key={i}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                {/* card */}
                <Card className="group h-full border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:scale-[1.03] hover:-rotate-1">
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* gradient HEADER */}
                    <div
                      className={`bg-gradient-to-br ${c.color} text-white p-6 rounded-t-xl flex items-start justify-between gap-4`}
                    >
                      {/* title + badges */}
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{c.name}</h3>

                        <div className="flex flex-wrap gap-2">
                          <span
                            title={c.flagshipAIProduct}
                            className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
                          >
                            {c.flagshipAIProduct}
                          </span>
                          <span
                            title={c.estimatedTokens}
                            className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
                          >
                            {c.estimatedTokens}
                          </span>
                        </div>
                      </div>

                      {/* LOGO */}
                      <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-md overflow-hidden">
                        <img
                          src={c.logoUrl}
                          alt={`${c.name} logo`}
                          className="object-contain h-full w-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.parentElement as HTMLElement).textContent =
                              '🏷️';
                          }}
                        />
                      </div>
                    </div>

                    {/* BODY */}
                    <div className="p-6 flex flex-col flex-grow bg-white dark:bg-gray-800">
                      {/* CEO row */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex-shrink-0">
                          <img
                            src={c.imageUrl}
                            alt={c.ceo}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              (e.currentTarget.src =
                                `https://placehold.co/64x64/eee/ccc?text=${c.ceo[0]}`)
                            }
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-gray-900 dark:text-white">
                            {c.ceo}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {c.position}
                          </p>
                        </div>
                      </div>

                      {/* AI focus */}
                      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">
                          AI Focus
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {c.aiFocusArea}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                          Founded: {c.foundedYear} | HQ: {c.headquarters}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* arrows */}
          <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-md" />
          <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-md" />
        </Carousel>
      </div>
    </div>
  );
};

export default CompanyStatsCarousel;
