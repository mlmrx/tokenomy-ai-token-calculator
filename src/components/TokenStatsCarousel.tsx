
import React, { useEffect, useState } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

// Define the structure for each company's statistics
interface CompanyStatType {
  name: string; // Company name
  ceo: string; // CEO's name
  position: string; // CEO's position title
  // tokens: string; // Removed: Precise token data is not publicly available
  aiFocusArea: string; // General area of AI focus or scale indicator
  flagshipAIProduct: string; // The company's most prominent AI product/service
  imageUrl: string; // URL for the CEO's image
  logoUrl: string; // URL for the company's logo
  color: string; // Tailwind CSS gradient classes reflecting brand colors
  foundedYear: number; // Year the company was founded
  headquarters: string; // Location of the company's headquarters
}

// Array containing statistics for various tech companies
const companyStats: CompanyStatType[] = [
  {
    name: "Microsoft",
    ceo: "Satya Nadella",
    position: "Chairman & CEO", // Updated Position
    aiFocusArea: "Large-scale cloud AI infrastructure and integrated AI assistants",
    flagshipAIProduct: "Azure AI / Microsoft Copilot",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/250px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1024px-Microsoft_logo.svg.png", // Microsoft logo URL
    color: "from-blue-600 to-sky-500", // Microsoft blue gradient
    foundedYear: 1975,
    headquarters: "Redmond, Washington, USA"
  },
  {
    name: "Amazon",
    ceo: "Andy Jassy",
    position: "CEO",
    aiFocusArea: "Cloud AI services, e-commerce AI, and voice assistants",
    flagshipAIProduct: "AWS Bedrock / Alexa",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Andy_Jassy_at_the_Vanity_Fair_New_Establishment_Summit_2016_%28cropped%29.jpg/440px-Andy_Jassy_at_the_Vanity_Fair_New_Establishment_Summit_2016_%28cropped%29.jpg", // Andy Jassy image URL
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png", // Amazon logo URL
    color: "from-orange-500 to-yellow-400", // Amazon orange gradient
    foundedYear: 1994,
    headquarters: "Seattle, Washington, USA"
  },
  {
    name: "OpenAI",
    ceo: "Sam Altman",
    position: "CEO",
    aiFocusArea: "Pioneering large language models and generative AI research",
    flagshipAIProduct: "ChatGPT / GPT Models",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg/250px-Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1024px-OpenAI_Logo.svg.png", // OpenAI logo URL
    color: "from-teal-500 to-emerald-500", // OpenAI teal/green gradient
    foundedYear: 2015,
    headquarters: "San Francisco, California, USA"
  },
  {
    name: "Google",
    ceo: "Sundar Pichai",
    position: "CEO",
    aiFocusArea: "Leading AI research, cloud AI platform, and integrated AI features",
    flagshipAIProduct: "Gemini / Vertex AI",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sundar_Pichai_-_2023_%28cropped%29.jpg/250px-Sundar_Pichai_-_2023_%28cropped%29.jpg",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1024px-Google_2015_logo.svg.png", // Google logo URL
    color: "from-red-500 via-yellow-400 to-blue-500", // Google multi-color gradient (simplified)
    foundedYear: 1998,
    headquarters: "Mountain View, California, USA"
  },
  {
    name: "Meta",
    ceo: "Mark Zuckerberg",
    position: "Chairman & CEO",
    aiFocusArea: "Open-source AI models and AI for social media and metaverse",
    flagshipAIProduct: "Llama Models / Meta AI",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/1280px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Meta-Logo.png/1024px-Meta-Logo.png", // Meta logo URL
    color: "from-blue-700 to-indigo-600", // Meta blue gradient
    foundedYear: 2004, // As Facebook
    headquarters: "Menlo Park, California, USA"
  },
  {
    name: "Anthropic",
    ceo: "Dario Amodei",
    position: "CEO",
    aiFocusArea: "Focus on AI safety and constitutional AI principles",
    flagshipAIProduct: "Claude Models",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg/330px-Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg",
    logoUrl: "https://images.crunchbase.com/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/gudggzfh7mq5dajv9zld", // Anthropic logo URL (using Crunchbase as source)
    color: "from-orange-800 to-amber-700", // Anthropic orange/amber gradient
    foundedYear: 2021,
    headquarters: "San Francisco, California, USA"
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
