import React, { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

// -----------------------------------------------------------------------------
//  Data model
// -----------------------------------------------------------------------------
export interface CompanyStatType {
  name: string;
  ceo: string;
  position: string;
  aiFocusArea: string;
  flagshipAIProduct: string;
  imageUrl: string;
  logoUrl: string;
  color: string;          // Tailwind gradient classes
  foundedYear: number;
  headquarters: string;
  estimatedTokens: string; // NEW — ≈ tokens processed per month
  stats: string;           // FY-24 revenue & market-cap or valuation
}

// -----------------------------------------------------------------------------
//  Data
// -----------------------------------------------------------------------------
export const companyStats: CompanyStatType[] = [
  {
    name: 'Microsoft',
    ceo: 'Satya Nadella',
    position: 'Chairman & CEO',
    aiFocusArea: 'Large-scale cloud AI infrastructure and integrated AI assistants',
    flagshipAIProduct: 'Azure AI / Microsoft Copilot',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/250px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    color: 'from-[#0078D4] to-[#00A4EF]',
    foundedYear: 1975,
    headquarters: 'Redmond, Washington, USA',
    estimatedTokens: '≈ 80 T tokens / month',
    stats: 'FY-24 revenue $245 B | M-cap $3.24 T',
  },
  {
    name: 'Amazon',
    ceo: 'Jeff Bezos',
    position: 'Executive Chairman',
    aiFocusArea: 'Cloud AI services, e-commerce AI, and voice assistants',
    flagshipAIProduct: 'AWS Bedrock / Amazon Q',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg/250px-Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    color: 'from-[#FF9900] to-[#FFB84D]',
    foundedYear: 1994,
    headquarters: 'Seattle, Washington, USA',
    estimatedTokens: '≈ 25 T tokens / month',
    stats: 'FY-24 revenue $638 B | M-cap $2.02 T',
  },
  {
    name: 'OpenAI',
    ceo: 'Sam Altman',
    position: 'CEO',
    aiFocusArea: 'Pioneering large language models and generative AI research',
    flagshipAIProduct: 'ChatGPT / GPT-4o',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg/250px-Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/OpenAI_Logo.svg',
    color: 'from-[#10A37F] to-[#1DBE8E]',
    foundedYear: 2015,
    headquarters: 'San Francisco, California, USA',
    estimatedTokens: '≈ 28 T tokens / month',
    stats: 'ARR $3.4 B | Valuation $157 B',
  },
  {
    name: 'Google',
    ceo: 'Sundar Pichai',
    position: 'CEO',
    aiFocusArea: 'Leading AI research, cloud AI platform, and integrated AI features',
    flagshipAIProduct: 'Gemini / Vertex AI',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sundar_Pichai_-_2023_%28cropped%29.jpg/250px-Sundar_Pichai_-_2023_%28cropped%29.jpg',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    color: 'from-[#4285F4] to-[#34A853]',
    foundedYear: 1998,
    headquarters: 'Mountain View, California, USA',
    estimatedTokens: '≈ 100 T tokens / month',
    stats: 'FY-24 revenue $350 B | M-cap $2.01 T',
  },
  {
    name: 'Meta',
    ceo: 'Mark Zuckerberg',
    position: 'Chairman & CEO',
    aiFocusArea: 'Open-source AI models plus AI for social media & metaverse',
    flagshipAIProduct: 'Llama 3 / Meta AI',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/1280px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta_Platforms_Inc._logo.svg',
    color: 'from-[#0866FF] to-[#0090FF]',
    foundedYear: 2004,
    headquarters: 'Menlo Park, California, USA',
    estimatedTokens: '≈ 8 T tokens / month',
    stats: 'FY-24 revenue $164.5 B | M-cap $1.51 T',
  },
  {
    name: 'Anthropic',
    ceo: 'Dario Amodei',
    position: 'CEO',
    aiFocusArea: 'AI safety and constitutional-AI research',
    flagshipAIProduct: 'Claude 3 (Opus/Sonnet/Haiku)',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg/330px-Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Anthropic_logo.svg',
    color: 'from-[#00E79D] to-[#00996C]',
    foundedYear: 2021,
    headquarters: 'San Francisco, California, USA',
    estimatedTokens: '≈ 12 T tokens / month',
    stats: 'ARR $1.4 B | Valuation $61.5 B',
  },
];

// -----------------------------------------------------------------------------
//  Carousel Component
// -----------------------------------------------------------------------------
const TokenStatsCarousel: React.FC = () => {
  const [api, setApi] = useState<any>(null);

  // Auto-play
  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => api.scrollNext(), 3_000);
    return () => clearInterval(id);
  }, [api]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Industry Token Usage
        </h2>
        <p className="text-muted-foreground">
          Leading companies and their token-processing scale
        </p>
      </div>

      <div className="relative px-12">
        <Carousel
          opts={{ align: 'start', loop: true }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {companyStats.map((c, i) => (
              <CarouselItem
                key={i}
                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <Card className="h-full border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* Gradient header */}
                    <div
                      className={`bg-gradient-to-br ${c.color} text-white p-6 rounded-t-lg`}
                    >
                      <h3 className="text-2xl font-bold">{c.name}</h3>
                      <span className="inline-block bg-white/20 px-3 py-1 mt-2 rounded-full text-sm">
                        {c.estimatedTokens}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex flex-col gap-4 flex-grow">
                      {/* CEO row */}
                      <div className="flex items-center gap-3">
                        <img
                          src={c.imageUrl}
                          alt={c.ceo}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div>
                          <p className="font-semibold">{c.ceo}</p>
                          <p className="text-sm text-muted-foreground">
                            {c.position}
                          </p>
                        </div>
                      </div>

                      {/* AI product */}
                      <div className="text-sm">
                        <p className="font-medium">Flagship AI:</p>
                        <p>{c.flagshipAIProduct}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>
    </div>
  );
};

export default TokenStatsCarousel;
