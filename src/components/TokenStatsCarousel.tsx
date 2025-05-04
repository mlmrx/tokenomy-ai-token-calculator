// Assuming these components are correctly set up in your project
// using shadcn/ui or a similar library.
// If these paths are incorrect, adjust them to match your project structure.
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi // Import CarouselApi type for setApi
} from "@/components/ui/carousel"; // Adjust path if needed
import { Card, CardContent } from "@/components/ui/card"; // Adjust path if needed

// Define the structure for each company's statistics
interface CompanyStatType {
  name: string; // Company name
  ceo: string; // CEO's name (or relevant executive)
  position: string; // Executive's position title
  aiFocusArea: string; // General area of AI focus or scale indicator
  flagshipAIProduct: string; // The company's most prominent AI product/service
  estimatedTokens: string; // Estimated monthly token processing (display string)
  imageUrl: string; // URL for the executive's image
  logoUrl: string; // URL for the company's logo
  color: string; // Tailwind CSS gradient classes reflecting brand colors
  foundedYear: number; // Year the company was founded
  headquarters: string; // Location of the company's headquarters
}

// Array containing statistics for various tech companies
// Updated estimatedTokens to spell out "Trillion".
const companyStats: CompanyStatType[] = [
  {
    name: "Microsoft",
    ceo: "Satya Nadella",
    position: "Chairman & CEO",
    aiFocusArea: "Large-scale cloud AI infrastructure and integrated AI assistants",
    flagshipAIProduct: "Azure AI / Microsoft Copilot",
    estimatedTokens: "≈ 80 Trillion tokens / month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/250px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1024px-Microsoft_logo.svg.png",
    color: "from-blue-600 to-sky-500",
    foundedYear: 1975,
    headquarters: "Redmond, Washington, USA"
  },
  {
    name: "Amazon",
    ceo: "Jeff Bezos",
    position: "Executive Chairman",
    aiFocusArea: "Cloud AI services, e-commerce AI, and voice assistants",
    flagshipAIProduct: "AWS Bedrock / Alexa",
    estimatedTokens: "≈ 25 Trillion tokens / month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg/250px-Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png",
    color: "from-orange-500 to-yellow-400",
    foundedYear: 1994,
    headquarters: "Seattle, Washington, USA"
  },
  {
    name: "OpenAI",
    ceo: "Sam Altman",
    position: "CEO",
    aiFocusArea: "Pioneering large language models and generative AI research",
    flagshipAIProduct: "ChatGPT / GPT Models",
    estimatedTokens: "≈ 28 Trillion tokens / month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg/250px-Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1024px-OpenAI_Logo.svg.png",
    color: "from-teal-500 to-emerald-500",
    foundedYear: 2015,
    headquarters: "San Francisco, California, USA"
  },
  {
    name: "Google",
    ceo: "Sundar Pichai",
    position: "CEO",
    aiFocusArea: "Leading AI research, cloud AI platform, and integrated AI features",
    flagshipAIProduct: "Gemini / Vertex AI",
    estimatedTokens: "≈ 100 Trillion tokens / month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sundar_Pichai_-_2023_%28cropped%29.jpg/250px-Sundar_Pichai_-_2023_%28cropped%29.jpg",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1024px-Google_2015_logo.svg.png",
    color: "from-red-500 via-yellow-400 to-blue-500",
    foundedYear: 1998,
    headquarters: "Mountain View, California, USA"
  },
  {
    name: "Meta",
    ceo: "Mark Zuckerberg",
    position: "Chairman & CEO",
    aiFocusArea: "Open-source AI models and AI for social media and metaverse",
    flagshipAIProduct: "Llama Models / Meta AI",
    estimatedTokens: "≈ 8 Trillion tokens / month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/1280px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Meta-Logo.png/1024px-Meta-Logo.png",
    color: "from-blue-700 to-indigo-600",
    foundedYear: 2004,
    headquarters: "Menlo Park, California, USA"
  },
  {
    name: "Anthropic",
    ceo: "Dario Amodei",
    position: "CEO",
    aiFocusArea: "Focus on AI safety and constitutional AI principles",
    flagshipAIProduct: "Claude Models",
    estimatedTokens: "≈ 12 Trillion tokens / month",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg/330px-Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg",
    logoUrl: "https://images.crunchbase.com/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/gudggzfh7mq5dajv9zld",
    color: "from-orange-800 to-amber-700",
    foundedYear: 2021,
    headquarters: "San Francisco, California, USA"
  }
];


// Main component for the Company Stats Carousel
const CompanyStatsCarousel = () => {
  // State to hold the carousel API instance
  const [api, setApi] = useState<CarouselApi | null>(null); // Use CarouselApi type

  // Effect for handling autoplay
  useEffect(() => {
    // Do nothing if the API instance is not available
    if (!api) return;

    // Set up an interval to scroll to the next slide
    const autoplayInterval = setInterval(() => {
      // Check if the carousel API has a scrollNext method before calling it
      if (api.scrollNext) {
         api.scrollNext();
      }
    }, 5000); // Change slide every 5 seconds (adjust as needed)

    // Clean up the interval when the component unmounts or api changes
    return () => clearInterval(autoplayInterval);
  }, [api]); // Dependency array includes api

  // Render the carousel component
  return (
    // Container for the entire carousel section
    <div className="w-full max-w-6xl mx-auto py-8 px-4"> {/* Increased max-width and added padding */}
      {/* Section Title */}
      <div className="mb-8 text-center"> {/* Increased bottom margin */}
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800 dark:text-white"> {/* Larger text, margin */}
          AI Industry Leaders & Scale
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400"> {/* Larger text */}
          Key players, their flagship products, and estimated monthly token processing
        </p>
      </div>

      {/* Carousel container with relative positioning for arrows */}
      <div className="relative px-12"> {/* Padding for arrows */}
        <Carousel
          opts={{
            align: "start", // Align items to the start
            loop: true, // Enable looping
          }}
          className="w-full" // Full width
          setApi={setApi} // Pass the setApi function to get the API instance
        >
          <CarouselContent className="-ml-4"> {/* Negative margin to counteract item padding */}
            {/* Map through the companyStats data to create carousel items */}
            {companyStats.map((company, index) => {

              return (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3"> {/* Padding and basis for responsiveness */}
                  <div className="p-1 h-full"> {/* Padding wrapper for potential focus rings */}
                    {/* Card component for each company */}
                    <Card className="h-full border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 shadow-lg rounded-xl overflow-hidden flex flex-col"> {/* Enhanced styling, added flex flex-col */}
                      <CardContent className="p-0 flex flex-col flex-grow"> {/* No padding, flex column, flex grow */}
                        {/* Top section with gradient background */}
                        <div className={`bg-gradient-to-br ${company.color} text-white p-6 rounded-t-xl relative`}> {/* Added relative positioning */}
                           {/* Company Logo */}
                           <img
                              src={company.logoUrl}
                              alt={`${company.name} Logo`}
                              className="absolute top-4 right-4 h-8 w-auto opacity-80" // Positioned logo
                              onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if logo fails to load
                           />
                          {/* Company Name */}
                          <h3 className="text-2xl font-bold mb-1">{company.name}</h3> {/* Reduced margin-bottom */}

                           {/* Estimated Tokens Text - More Prominent */}
                           <p className="text-lg font-bold mb-3 opacity-90"> {/* Increased size, bold, added margin */}
                               {company.estimatedTokens}
                           </p>

                          {/* Flagship Product */}
                          <div className="mt-1"> {/* Removed margin-bottom */}
                            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                              {company.flagshipAIProduct}
                            </span>
                          </div>

                        </div>
                        {/* Bottom section with details */}
                        <div className="p-6 flex flex-col flex-grow bg-white dark:bg-gray-800"> {/* White/dark background */}
                          {/* CEO Info */}
                          <div className="flex items-center gap-4 mb-4"> {/* Increased gap */}
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"> {/* Added flex-shrink-0 */}
                              <img
                                src={company.imageUrl}
                                alt={company.ceo}
                                className="w-full h-full object-cover"
                                // Basic fallback if image fails
                                onError={(e) => (e.currentTarget.src = `https://placehold.co/64x64/eee/ccc?text=${company.ceo.substring(0,1)}`)}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-lg text-gray-900 dark:text-white">{company.ceo}</p> {/* Larger text */}
                              <p className="text-sm text-gray-500 dark:text-gray-400">{company.position}</p>
                            </div>
                          </div>
                           {/* AI Focus Area */}
                           <div className="mb-4"> {/* Added margin-bottom */}
                             <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">AI Focus:</p>
                             <p className="text-sm text-gray-500 dark:text-gray-400">{company.aiFocusArea}</p>
                           </div>

                          {/* Footer Info (Founded/HQ) - Pushed to bottom */}
                          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                             <p className="text-xs text-gray-400 dark:text-gray-500">
                               Founded: {company.foundedYear} | HQ: {company.headquarters}
                             </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          {/* Navigation Arrows */}
          <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-md" /> {/* Styled arrows */}
          <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-md" /> {/* Styled arrows */}
        </Carousel>
      </div>
    </div>
  );
};

// Export the component for use in other parts of the application
export default CompanyStatsCarousel;
