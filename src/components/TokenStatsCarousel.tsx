
import React, { useEffect, useState } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

type CompanyStatType = {
  name: string;
  ceo: string;
  position: string;
  tokens: string;
  imageUrl: string;
  logoUrl?: string;
  color: string;
};

const companyStats: CompanyStatType[] = [
  {
    name: "Microsoft",
    ceo: "Satya Nadella",
    position: "CEO",
    tokens: "50 trillion tokens/month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/250px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg",
    color: "from-blue-900 to-blue-700"
  },
    {
    name: "Amazon",
    ceo: "Jeff Bezos",
    position: "Chairman",
    tokens: "50 trillion tokens/month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg/250px-Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg",
    color: "from-blue-900 to-blue-700"
  },
  {
    name: "OpenAI",
    ceo: "Sam Altman",
    position: "CEO",
    tokens: "20+ trillion tokens/month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg/250px-Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg",
    color: "from-purple-900 to-purple-700"
  },
  {
    name: "Google",
    ceo: "Sundar Pichai",
    position: "CEO",
    tokens: "35 trillion tokens/month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sundar_Pichai_-_2023_%28cropped%29.jpg/250px-Sundar_Pichai_-_2023_%28cropped%29.jpg",
    color: "from-green-900 to-teal-700"
  },
  {
    name: "Meta",
    ceo: "Mark Zuckerberg",
    position: "CEO",
    tokens: "30 trillion tokens/month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/1280px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg",
    color: "from-indigo-900 to-indigo-700"
  },
  {
    name: "Anthropic",
    ceo: "Dario Amodei",
    position: "CEO",
    tokens: "15 trillion tokens/month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg/330px-Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg",
    color: "from-amber-900 to-amber-700"
  }
];

const TokenStatsCarousel = () => {
  const [api, setApi] = useState(null);
  
  useEffect(() => {
    if (!api) return;
    
    // Start autoplay
    const autoplayInterval = setInterval(() => {
      api.scrollNext();
    }, 3000); // Move to next slide every 3 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(autoplayInterval);
  }, [api]);
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Industry Token Usage</h2>
        <p className="text-muted-foreground">Leading companies and their token processing statistics</p>
      </div>
      
      <div className="relative px-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
          setApi={setApi}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {companyStats.map((company, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="h-full">
                  <Card className="h-full border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                    <CardContent className="p-0 h-full">
                      <div className="flex flex-col h-full">
                        <div className={`bg-gradient-to-br ${company.color} text-white p-6 rounded-t-lg`}>
                          <h3 className="text-2xl font-bold">{company.name}</h3>
                          <div className="mt-2 flex items-center">
                            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
                              {company.tokens}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                              <img 
                                src={company.imageUrl} 
                                alt={company.ceo} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold">{company.ceo}</p>
                              <p className="text-sm text-muted-foreground">{company.position}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
