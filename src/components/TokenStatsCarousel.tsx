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
/*  DATA MODEL                                                                */
/* -------------------------------------------------------------------------- */
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
  estimatedTokens: string; // NEW   (≈ tokens/month)
  stats: string;           // FY-24 revenue | valuation (not shown but retained)
}

/* -------------------------------------------------------------------------- */
/*  DATA                                                                      */
/* -------------------------------------------------------------------------- */
const companyStats: CompanyStatType[] = [
  {
    name: 'Microsoft',
    ceo: 'Satya Nadella',
    position: 'Chairman & CEO',
    aiFocusArea:
      'Large-scale cloud AI infrastructure and integrated AI assistants',
    flagshipAIProduct: 'Azure AI / Microsoft Copilot',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/250px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
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
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
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
    aiFocusArea: 'Pioneering large-language models & generative-AI research',
    flagshipAIProduct: 'ChatGPT / GPT-4o',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg/250px-Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/4c/OpenAI_Logo.svg',
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
    aiFocusArea:
      'Leading AI research, cloud-AI platform, and integrated AI features',
    flagshipAIProduct: 'Gemini / Vertex AI',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sundar_Pichai_-_2023_%28cropped%29.jpg/250px-Sundar_Pichai_-_2023_%28cropped%29.jpg',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
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
    aiFocusArea: 'Open-source AI models plus AI for social & metaverse',
    flagshipAIProduct: 'Llama 3 / Meta AI',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/1280px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta_Platforms_Inc._logo.svg',
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
    aiFocusArea: 'AI safety & constitutional-AI research',
    flagshipAIProduct: 'Claude 3 (Opus/Sonnet/Haiku)',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg/330px-Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/55/Anthropic_logo.svg',
    color: 'from-[#00E79D] to-[#00996C]',
    foundedYear: 2021,
    headquarters: 'San Francisco, California, USA',
    estimatedTokens: '≈ 12 T tokens / month',
    stats: 'ARR $1.4 B | Valuation $61.5 B',
  },
];

/* -------------------------------------------------------------------------- */
/*  COMPONENT                                                                 */
/* -------------------------------------------------------------------------- */
const CompanyStatsCarousel: React.FC = () => {
  const [api, setApi] = useState<CarouselApi | null>(null);

  /* autoplay --------------------------------------------------------------- */
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
                <div className="p-1 h-full">
                  <Card className="h-full border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 shadow-lg rounded-xl overflow-hidden">
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* gradient header */}
                      <div
                        className={`bg-gradient-to-br ${c.color} text-white p-6 rounded-t-xl relative`}
                      >
                        {/* logo */}
                        <img
                          src={c.logoUrl}
                          alt={`${c.name} logo`}
                          className="absolute top-4 right-4 h-8 w-auto opacity-80"
                          onError={(e) =>
                            (e.currentTarget.style.display = 'none')
                          }
                        />
                        {/* name */}
                        <h3 className="text-2xl font-bold mb-2">{c.name}</h3>

                        {/* badges */}
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                            {c.flagshipAIProduct}
                          </span>
                          <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                            {c.estimatedTokens}
                          </span>
                        </div>
                      </div>

                      {/* body */}
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
                </div>
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
