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
  logoUrl: string; // Kept in data structure, but not used in render
  color: string;       // Tailwind gradient classes
  gradientId: string; // unique ID for Recharts <defs>
  foundedYear: number;
  headquarters: string;
  avgCostPerMillionTokens: number; // USD per million tokens (blended rate)
}

/* -------------------------------------------------------------------------- */
/* PRICING CALCULATION UTILITIES                                              */
/* -------------------------------------------------------------------------- */
// Calculate monthly cost based on token volume and pricing
const calculateMonthlyCost = (tokens: number, costPerMillion: number): number => {
  return (tokens * 1000000 * costPerMillion) / 1000000; // tokens in trillions * 1M * cost / 1M
};

// Format currency for display
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(2)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

/* -------------------------------------------------------------------------- */
/* DATA (2024-2025, trillions) - Updated for 2025 Trends                     */
/* Source: Industry estimates based on public disclosures, infrastructure    */
/* capacity, and observed API usage patterns (Q4 2024-Q1 2025).              */
/* Pricing: Blended rates based on major cloud AI service pricing.           */
/* -------------------------------------------------------------------------- */
const companyStats: CompanyStatType[] = [
  {
    name: 'Microsoft',
    ceo: 'Satya Nadella',
    position: 'Chairman & CEO',
    aiFocusArea:
      'Enterprise AI infrastructure, cloud-scale inference, and productivity AI',
    flagshipAIProduct: 'Azure OpenAI Service / Copilot',
    estimatedTokens: '≈ 2.8 Trillion tokens / month', // Jan-25
    avgCostPerMillionTokens: 4.50, // Blended Azure OpenAI pricing
    tokenHistory: [
      { month: 'Jan 24', tokens: 0.42 },
      { month: 'Feb 24', tokens: 0.51 },
      { month: 'Mar 24', tokens: 0.63 },
      { month: 'Apr 24', tokens: 0.78 },
      { month: 'May 24', tokens: 0.95 },
      { month: 'Jun 24', tokens: 1.14 },
      { month: 'Jul 24', tokens: 1.37 },
      { month: 'Aug 24', tokens: 1.62 },
      { month: 'Sep 24', tokens: 1.91 },
      { month: 'Oct 24', tokens: 2.15 },
      { month: 'Nov 24', tokens: 2.42 },
      { month: 'Dec 24', tokens: 2.58 },
      { month: 'Jan 25', tokens: 2.80 },
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
    ceo: 'Andy Jassy',
    position: 'President & CEO',
    aiFocusArea:
      'Multi-model cloud AI platform, enterprise automation, and conversational AI',
    flagshipAIProduct: 'AWS Bedrock / Amazon Q',
    estimatedTokens: '≈ 1.9 Trillion tokens / month', // Jan-25
    avgCostPerMillionTokens: 3.80, // Blended AWS Bedrock pricing
    tokenHistory: [
      { month: 'Jan 24', tokens: 0.28 },
      { month: 'Feb 24', tokens: 0.35 },
      { month: 'Mar 24', tokens: 0.44 },
      { month: 'Apr 24', tokens: 0.56 },
      { month: 'May 24', tokens: 0.71 },
      { month: 'Jun 24', tokens: 0.88 },
      { month: 'Jul 24', tokens: 1.05 },
      { month: 'Aug 24', tokens: 1.24 },
      { month: 'Sep 24', tokens: 1.42 },
      { month: 'Oct 24', tokens: 1.58 },
      { month: 'Nov 24', tokens: 1.73 },
      { month: 'Dec 24', tokens: 1.82 },
      { month: 'Jan 25', tokens: 1.90 },
    ],
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Andy_Jassy_2022.jpg/440px-Andy_Jassy_2022.jpg',
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
      'Frontier AI models, reasoning systems, and multimodal intelligence',
    flagshipAIProduct: 'ChatGPT / GPT-4o & o1',
    estimatedTokens: '≈ 3.5 Trillion tokens / month', // Jan-25
    avgCostPerMillionTokens: 5.25, // Blended GPT-4o + o1 pricing
    tokenHistory: [
      { month: 'Jan 24', tokens: 0.65 },
      { month: 'Feb 24', tokens: 0.82 },
      { month: 'Mar 24', tokens: 1.05 },
      { month: 'Apr 24', tokens: 1.32 },
      { month: 'May 24', tokens: 1.64 },
      { month: 'Jun 24', tokens: 1.98 },
      { month: 'Jul 24', tokens: 2.28 },
      { month: 'Aug 24', tokens: 2.56 },
      { month: 'Sep 24', tokens: 2.84 },
      { month: 'Oct 24', tokens: 3.05 },
      { month: 'Nov 24', tokens: 3.22 },
      { month: 'Dec 24', tokens: 3.38 },
      { month: 'Jan 25', tokens: 3.50 },
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
      'Multimodal AI, long-context reasoning, and integrated AI experiences',
    flagshipAIProduct: 'Gemini 2.0 / Vertex AI',
    estimatedTokens: '≈ 2.4 Trillion tokens / month', // Jan-25
    avgCostPerMillionTokens: 3.50, // Blended Gemini 2.0 pricing
    tokenHistory: [
      { month: 'Jan 24', tokens: 0.38 },
      { month: 'Feb 24', tokens: 0.48 },
      { month: 'Mar 24', tokens: 0.62 },
      { month: 'Apr 24', tokens: 0.78 },
      { month: 'May 24', tokens: 0.96 },
      { month: 'Jun 24', tokens: 1.16 },
      { month: 'Jul 24', tokens: 1.38 },
      { month: 'Aug 24', tokens: 1.62 },
      { month: 'Sep 24', tokens: 1.84 },
      { month: 'Oct 24', tokens: 2.05 },
      { month: 'Nov 24', tokens: 2.22 },
      { month: 'Dec 24', tokens: 2.33 },
      { month: 'Jan 25', tokens: 2.40 },
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
      'Open-source LLMs, social AI integration, and metaverse intelligence',
    flagshipAIProduct: 'Llama 4 / Meta AI',
    estimatedTokens: '≈ 1.6 Trillion tokens / month', // Jan-25
    avgCostPerMillionTokens: 2.20, // Lower cost for internal/open-source model infrastructure
    tokenHistory: [
      { month: 'Jan 24', tokens: 0.22 },
      { month: 'Feb 24', tokens: 0.28 },
      { month: 'Mar 24', tokens: 0.36 },
      { month: 'Apr 24', tokens: 0.46 },
      { month: 'May 24', tokens: 0.58 },
      { month: 'Jun 24', tokens: 0.72 },
      { month: 'Jul 24', tokens: 0.87 },
      { month: 'Aug 24', tokens: 1.02 },
      { month: 'Sep 24', tokens: 1.18 },
      { month: 'Oct 24', tokens: 1.32 },
      { month: 'Nov 24', tokens: 1.45 },
      { month: 'Dec 24', tokens: 1.54 },
      { month: 'Jan 25', tokens: 1.60 },
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
    aiFocusArea: 'Constitutional AI, safety research, and enterprise reasoning models',
    flagshipAIProduct: 'Claude 3.5 Sonnet / Opus',
    estimatedTokens: '≈ 1.2 Trillion tokens / month', // Jan-25
    avgCostPerMillionTokens: 4.80, // Blended Claude 3.5 pricing
    tokenHistory: [
      { month: 'Jan 24', tokens: 0.12 },
      { month: 'Feb 24', tokens: 0.16 },
      { month: 'Mar 24', tokens: 0.22 },
      { month: 'Apr 24', tokens: 0.30 },
      { month: 'May 24', tokens: 0.41 },
      { month: 'Jun 24', tokens: 0.54 },
      { month: 'Jul 24', tokens: 0.68 },
      { month: 'Aug 24', tokens: 0.82 },
      { month: 'Sep 24', tokens: 0.95 },
      { month: 'Oct 24', tokens: 1.06 },
      { month: 'Nov 24', tokens: 1.14 },
      { month: 'Dec 24', tokens: 1.18 },
      { month: 'Jan 25', tokens: 1.20 },
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
         WHY? Check AI Industry Leaders and Scale
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Flagship AI and estimated monthly token trends (2025)
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
                        {/* Company Name */}
                        <h3 className="text-2xl font-bold mb-1">
                          {comp.name}
                        </h3>
                        {/* Latest Estimated Tokens */}
                        <p className="text-lg font-bold mb-1 opacity-90">
                          {comp.estimatedTokens}
                        </p>
                        {/* Monthly Cost Estimate */}
                        <p className="text-base font-semibold mb-3 opacity-95">
                          ≈ {formatCurrency(calculateMonthlyCost(endData?.tokens || 0, comp.avgCostPerMillionTokens))} / month
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
                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          {/* Cost per Million Tokens */}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Avg Cost/M Tokens:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              ${comp.avgCostPerMillionTokens.toFixed(2)}
                            </span>
                          </div>
                          {/* Founded and Location Row */}
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Founded {comp.foundedYear} • HQ {comp.headquarters}
                          </div>
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
