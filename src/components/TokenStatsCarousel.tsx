// CompanyStatsCarousel.tsx
import React, { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'; // Adjust path if needed
import { Card, CardContent } from '@/components/ui/card'; // Adjust path if needed

import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  YAxis,
  XAxis,
} from 'recharts'; // Make sure recharts is installed

/* -------------------------------------------------------------------------- */
/* TYPES                                                                     */
/* -------------------------------------------------------------------------- */
interface TokenDataPoint {
  month: string;   // e.g., 'Jan 24'
  tokens: number;  // trillions
}
interface CompanyStatType {
  name: string;
  ceo: string;
  position: string;
  aiFocusArea: string;
  flagshipAIProduct: string;
  estimatedTokens: string; // Display string for latest value
  tokenHistory: TokenDataPoint[]; // Historical data
  imageUrl: string;
  logoUrl: string;
  color: string;       // Tailwind gradient classes
  gradientId: string; // unique ID for Recharts <defs>
  foundedYear: number;
  headquarters: string;
}

/* -------------------------------------------------------------------------- */
/* DATA (Jan-24 → Dec-24, trillions) - Source: User Provided                 */
/* Note: Treat this as estimated/illustrative data unless source verified.   */
/* Updated Jan 24 values based on user image (v2).                           */
/* -------------------------------------------------------------------------- */
const companyStats: CompanyStatType[] = [
  {
    name: 'Microsoft',
    ceo: 'Satya Nadella',
    position: 'Chairman & CEO',
    aiFocusArea:
      'Large-scale cloud AI infrastructure and integrated AI assistants',
    flagshipAIProduct: 'Azure AI / Microsoft Copilot',
    estimatedTokens: '≈ 80 Trillion tokens / month', // Dec-24
    tokenHistory: [
      { month: 'Jan 24', tokens: 10 }, // Updated value from image
      { month: 'Feb 24', tokens: 30 }, { month: 'Mar 24', tokens: 42 }, // Note: Subsequent months might need adjustment for a realistic trend
      { month: 'Apr 24', tokens: 64 }, { month: 'May 24', tokens: 66 },
      { month: 'Jun 24', tokens: 68 }, { month: 'Jul 24', tokens: 70 },
      { month: 'Aug 24', tokens: 72 }, { month: 'Sep 24', tokens: 74 },
      { month: 'Oct 24', tokens: 76 }, { month: 'Nov 24', tokens: 78 },
      { month: 'Dec 24', tokens: 80 },
    ],
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/250px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    color: 'from-blue-600 to-sky-500',
    gradientId: 'msftGradient',
    foundedYear: 1975,
    headquarters: 'Redmond, Washington, USA',
  },
  {
    name: 'Amazon',
    ceo: 'Jeff Bezos',
    position: 'Executive Chairman',
    aiFocusArea:
      'Cloud AI services, e-commerce AI, and voice assistants',
    flagshipAIProduct: 'AWS Bedrock / Amazon Q',
    estimatedTokens: '≈ 25 Trillion tokens / month', // Dec-24
    tokenHistory: [
      { month: 'Jan 24', tokens: 3 }, // Updated value from image
      { month: 'Feb 24', tokens: 10.71 }, { month: 'Mar 24', tokens: 12.34 }, // Note: Subsequent months might need adjustment
      { month: 'Apr 24', tokens: 19.97 }, { month: 'May 24', tokens: 20.60 },
      { month: 'Jun 24', tokens: 21.26 }, { month: 'Jul 24', tokens: 21.86 },
      { month: 'Aug 24', tokens: 22.49 }, { month: 'Sep 24', tokens: 23.11 },
      { month: 'Oct 24', tokens: 23.74 }, { month: 'Nov 24', tokens: 24.37 },
      { month: 'Dec 24', tokens: 25.00 },
    ],
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg/250px-Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    color: 'from-orange-500 to-yellow-400',
    gradientId: 'amznGradient',
    foundedYear: 1994,
    headquarters: 'Seattle, Washington, USA',
  },
  {
    name: 'OpenAI',
    ceo: 'Sam Altman',
    position: 'CEO',
    aiFocusArea:
      'Pioneering large-language models and generative-AI research',
    flagshipAIProduct: 'ChatGPT / GPT-4o',
    estimatedTokens: '≈ 28 Trillion tokens / month', // Dec-24
    tokenHistory: [
      { month: 'Jan 24', tokens: 1 }, // Updated value from image
      { month: 'Feb 24', tokens: 10.29 }, { month: 'Mar 24', tokens: 16.06 }, // Note: Subsequent months might need adjustment
      { month: 'Apr 24', tokens: 21.83 }, { month: 'May 24', tokens: 22.60 },
      { month: 'Jun 24', tokens: 23.37 }, { month: 'Jul 24', tokens: 24.11 },
      { month: 'Aug 24', tokens: 24.91 }, { month: 'Sep 24', tokens: 25.69 },
      { month: 'Oct 24', tokens: 26.46 }, { month: 'Nov 24', tokens: 27.23 },
      { month: 'Dec 24', tokens: 28.00 },
    ],
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg/250px-Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    color: 'from-teal-500 to-emerald-500',
    gradientId: 'openAIGra',
    foundedYear: 2015,
    headquarters: 'San Francisco, California, USA',
  },
  {
    name: 'Google',
    ceo: 'Sundar Pichai',
    position: 'CEO',
    aiFocusArea:
      'Leading AI research, cloud-AI platform & integrated AI features',
    flagshipAIProduct: 'Gemini / Vertex AI',
    estimatedTokens: '≈ 100 Trillion tokens / month', // Dec-24
    tokenHistory: [
      { month: 'Jan 24', tokens: 15 }, // Updated value from image
      { month: 'Feb 24', tokens: 25.71 }, { month: 'Mar 24', tokens: 38.14 }, // Note: Subsequent months might need adjustment
      { month: 'Apr 24', tokens: 60.57 }, { month: 'May 24', tokens: 73.00 },
      { month: 'Jun 24', tokens: 85.43 }, { month: 'Jul 24', tokens: 87.86 },
      { month: 'Aug 24', tokens: 90.29 }, { month: 'Sep 24', tokens: 92.71 },
      { month: 'Oct 24', tokens: 95.14 }, { month: 'Nov 24', tokens: 97.57 },
      { month: 'Dec 24', tokens: 100.00 },
    ],
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sundar_Pichai_-_2023_%28cropped%29.jpg/250px-Sundar_Pichai_-_2023_%28cropped%29.jpg',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1024px-Google_2015_logo.svg.png',
    color: 'from-red-500 to-blue-500',
    gradientId: 'googGradient',
    foundedYear: 1998,
    headquarters: 'Mountain View, California, USA',
  },
  {
    name: 'Meta',
    ceo: 'Mark Zuckerberg',
    position: 'Chairman & CEO',
    aiFocusArea:
      'Open-source LLMs and AI for social media & metaverse',
    flagshipAIProduct: 'Llama 3 / Meta AI',
    estimatedTokens: '≈ 8 Trillion tokens / month', // Dec-24
    tokenHistory: [
      { month: 'Jan 24', tokens: 1 }, // Updated value from image
      { month: 'Feb 24', tokens: 3.0 }, { month: 'Mar 24', tokens: 4.2 }, // Note: Subsequent months might need adjustment
      { month: 'Apr 24', tokens: 5.4 }, { month: 'May 24', tokens: 6.6 },
      { month: 'Jun 24', tokens: 6.8 }, { month: 'Jul 24', tokens: 7.0 },
      { month: 'Aug 24', tokens: 7.2 }, { month: 'Sep 24', tokens: 7.4 },
      { month: 'Oct 24', tokens: 7.6 }, { month: 'Nov 24', tokens: 7.8 },
      { month: 'Dec 24', tokens: 8.0 },
    ],
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/1280px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png',
    color: 'from-blue-700 to-indigo-600',
    gradientId: 'metaGradient',
    foundedYear: 2004,
    headquarters: 'Menlo Park, California, USA',
  },
  {
    name: 'Anthropic',
    ceo: 'Dario Amodei',
    position: 'CEO',
    aiFocusArea: 'AI safety & constitutional-AI research',
    flagshipAIProduct: 'Claude 3 / Opus',
    estimatedTokens: '≈ 12 Trillion tokens / month', // Dec-24
    tokenHistory: [
      { month: 'Jan 24', tokens: 0.2 }, // Updated value from image
      { month: 'Feb 24', tokens: 1.63 }, { month: 'Mar 24', tokens: 3.97 }, // Note: Subsequent months might need adjustment
      { month: 'Apr 24', tokens: 5.30 }, { month: 'May 24', tokens: 7.64 },
      { month: 'Jun 24', tokens: 9.97 }, { month: 'Jul 24', tokens: 10.32 },
      { month: 'Aug 24', tokens: 10.65 }, { month: 'Sep 24', tokens: 10.99 },
      { month: 'Oct 24', tokens: 11.33 }, { month: 'Nov 24', tokens: 11.66 },
      { month: 'Dec 24', tokens: 12.00 },
    ],
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg/330px-Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg',
    logoUrl:
      'https://images.crunchbase.com/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/gudggzfh7mq5dajv9zld',
    color: 'from-orange-800 to-amber-700',
    gradientId: 'anthropicGradient',
    foundedYear: 2021,
    headquarters: 'San Francisco, California, USA',
  },
];

/* -------------------------------------------------------------------------- */
/* HELPER – map Tailwind gradient to hex for Recharts <defs>                 */
/* -------------------------------------------------------------------------- */
// Mapping of Tailwind color names to approximate hex values
const colorMap: Record<string, string> = {
  blue: '#3b82f6', sky: '#0ea5e9', orange: '#f97316', yellow: '#f59e0b',
  teal: '#14b8a6', emerald: '#10b981', red: '#ef4444', indigo: '#4f46e5',
  amber: '#f59e0b', // Added amber just in case
};

// Function to extract start and end colors from Tailwind gradient class string
const getGradientColors = (tailwind: string): { from: string; to: string } => {
  // Regex to find 'from-{colorname}-...' and 'to-{colorname}-...'
  const fromMatch = tailwind.match(/from-([a-z]+)-/);
  const toMatch = tailwind.match(/to-([a-z]+)-/);

  // Get the color name (e.g., 'blue') from the match, or use 'blue' as default
  const fromColorName = fromMatch?.[1] ?? 'blue';
  const toColorName = toMatch?.[1] ?? 'blue'; // Use same default or a different one

  // Return hex values from map, or fallback hex colors if name not found
  return {
    from: colorMap[fromColorName] ?? '#8884d8', // Recharts default purple
    to: colorMap[toColorName] ?? '#82ca9d',   // Recharts default green
  };
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                 */
/* -------------------------------------------------------------------------- */
const CompanyStatsCarousel: React.FC = () => {
  const [api, setApi] = useState<CarouselApi | null>(null);

  /* Autoplay Effect */
  useEffect(() => {
    if (!api) return; // Exit if carousel api not ready
    // Set interval to scroll next every 5 seconds
    const autoplayIntervalId = setInterval(() => api.scrollNext?.(), 5000);
    // Clear interval on component unmount or when api changes
    return () => clearInterval(autoplayIntervalId);
  }, [api]); // Rerun effect if api instance changes

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      {/* Section Title */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800 dark:text-white">
          AI Industry Leaders & Scale
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Flagship AI and estimated monthly token trends (2024)
        </p>
      </div>

      {/* Carousel */}
      <div className="relative px-12"> {/* Horizontal padding for arrows */}
        <Carousel
            opts={{ align: 'start', loop: true }}
            setApi={setApi} // Get API instance for autoplay
            className="w-full"
        >
          <CarouselContent className="-ml-4"> {/* Offset item padding */}
            {companyStats.map((comp) => {
              // Get hex colors for the chart gradient
              const { from: fromColorHex, to: toColorHex } = getGradientColors(comp.color);
              // Get start and end data points for display
              const startData = comp.tokenHistory[0];
              const endData = comp.tokenHistory[comp.tokenHistory.length - 1];

              return (
                <CarouselItem
                  key={comp.name} // Use company name as key
                  className="pl-4 md:basis-1/2 lg:basis-1/3" // Responsive item width
                >
                  <Card className="h-full border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition shadow-lg rounded-xl overflow-hidden flex flex-col">
                    <CardContent className="p-0 flex flex-col flex-grow"> {/* No padding, ensure content grows */}
                      {/* Header Section */}
                      <div
                        className={`bg-gradient-to-br ${comp.color} text-white p-6 rounded-t-xl relative`}
                      >
                        {/* Company Logo */}
                        <img
                          src={comp.logoUrl}
                          alt={`${comp.name} logo`}
                          className="absolute top-4 right-4 h-8 w-auto opacity-80"
                          // Hide logo element if image fails to load
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        {/* Company Name */}
                        <h3 className="text-2xl font-bold mb-1">
                          {comp.name}
                        </h3>
                        {/* Latest Estimated Tokens */}
                        <p className="text-lg font-bold mb-3 opacity-90">
                          {comp.estimatedTokens}
                        </p>
                        {/* Flagship Product Badge */}
                        <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {comp.flagshipAIProduct}
                        </span>
                      </div>

                      {/* Body Section */}
                      <div className="p-6 flex flex-col flex-grow bg-white dark:bg-gray-800">
                        {/* Token Trend Chart Section */}
                        <div className="mb-4">
                           {/* Title and Start/End Values Row */}
                           <div className="flex justify-between items-baseline mb-1"> {/* Use items-baseline for better alignment */}
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                Token Trend (Trillions)
                              </p>
                              {/* Container for start/end values */}
                              <div className="flex items-baseline space-x-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                {/* Display start token value */}
                                {startData && (
                                  <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                      {startData.month}: {startData.tokens.toFixed(1)} T
                                  </span>
                                )}
                                <span className="text-gray-400 dark:text-gray-500">→</span>
                                {/* Display end token value */}
                                {endData && (
                                  <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                      {endData.month}: {endData.tokens.toFixed(1)} T
                                  </span>
                                )}
                              </div>
                           </div>
                           {/* Chart Container */}
                           <div className="h-20 w-full"> {/* Ensure chart takes full width */}
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                  data={comp.tokenHistory} // Use historical data
                                  margin={{ top: 5, right: 5, left: 5, bottom: 0 }} // Added slight horizontal margin
                                >
                                  {/* Define SVG gradient for the Area fill */}
                                  <defs>
                                    <linearGradient
                                      id={comp.gradientId} // Unique ID per company
                                      x1="0" y1="0" x2="0" y2="1" // Vertical gradient
                                    >
                                      {/* Use hex colors derived from Tailwind classes */}
                                      <stop offset="5%" stopColor={fromColorHex} stopOpacity={0.8} />
                                      <stop offset="95%" stopColor={toColorHex} stopOpacity={0.1} />
                                    </linearGradient>
                                  </defs>
                                  {/* X Axis (hidden, used for data mapping) */}
                                  <XAxis dataKey="month" hide />
                                  {/* Y Axis (hidden, scales automatically) */}
                                  <YAxis hide domain={['auto', 'auto']} />
                                  {/* Tooltip configuration */}
                                  <Tooltip
                                    contentStyle={{
                                      fontSize: '12px', padding: '4px 8px', borderRadius: '4px',
                                      backgroundColor: 'rgba(0,0,0,0.7)', border: 'none',
                                    }}
                                    itemStyle={{ color: '#fff' }} // Text color inside tooltip
                                    labelStyle={{ color: '#aaa', fontSize: '10px' }} // Month label style
                                    // Format tooltip to show value and month
                                    formatter={(value: number, name: string, props: any) => [`${value.toFixed(1)} T`, props.payload.month]} // Format value to 1 decimal place
                                  />
                                  {/* The actual Area plot */}
                                  <Area
                                    type="monotone" // Smooth curve
                                    dataKey="tokens" // Data key for Y values
                                    stroke={fromColorHex} // Line color
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#${comp.gradientId})`} // Reference the gradient fill
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                           </div>
                        </div>

                        {/* CEO Info */}
                        <div className="flex items-center gap-4 mb-4 pt-4 border-t border-gray-100 dark:border-gray-700"> {/* Separator line */}
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex-shrink-0">
                            <img
                              src={comp.imageUrl}
                              alt={comp.ceo}
                              className="w-full h-full object-cover"
                              // Fallback placeholder image using first initial
                              onError={(e) => (e.currentTarget.src = `https://placehold.co/64x64/eee/ccc?text=${comp.ceo[0]}`)}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">
                              {comp.ceo}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {comp.position}
                            </p>
                          </div>
                        </div>

                        {/* AI Focus Area */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">
                            AI Focus
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {comp.aiFocusArea}
                          </p>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500"> {/* Pushes to bottom */}
                          Founded {comp.foundedYear} • HQ {comp.headquarters}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Carousel Navigation Arrows */}
          <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-md" />
          <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-md" />
        </Carousel>
      </div>
    </div>
  );
};

export default CompanyStatsCarousel;
