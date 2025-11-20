import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, PlayCircle, FileText, Code, ExternalLink } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface ModuleContentViewerProps {
  module: any;
  onComplete: () => void;
  isCompleted: boolean;
}

const ModuleContentViewer: React.FC<ModuleContentViewerProps> = ({ 
  module, 
  onComplete, 
  isCompleted 
}) => {
  const [hasStarted, setHasStarted] = useState(false);
  const content = module.content || {};

  const renderVideoContent = () => {
    const videoUrl = content.video_url;
    const videoId = videoUrl?.includes('youtube.com') 
      ? videoUrl.split('v=')[1]?.split('&')[0] 
      : null;

    return (
      <div className="space-y-6">
        {videoId && (
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={module.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        
        {content.key_takeaways && (
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Key Takeaways
            </h3>
            <ul className="space-y-2">
              {content.key_takeaways.map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {content.topics && (
          <div className="flex flex-wrap gap-2">
            {content.topics.map((topic: string, index: number) => (
              <Badge key={index} variant="secondary">{topic}</Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderArticleContent = () => {
    return (
      <div className="space-y-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{content.article_content || "Article content coming soon..."}</ReactMarkdown>
        </div>

        {content.resources && (
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Additional Resources
            </h3>
            <ul className="space-y-2">
              {content.resources.map((resource: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  <span>{resource}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  };

  const renderHandsOnContent = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-purple-500/5 border-2 border-primary/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Hands-On Lab
          </h3>
          <p className="text-muted-foreground mb-4">
            {content.lab_instructions || "Follow the steps below to complete this hands-on exercise."}
          </p>
        </Card>

        {content.exercises && content.exercises.map((exercise: any, index: number) => (
          <Card key={index} className="p-6">
            <h4 className="font-semibold mb-2">{exercise.title}</h4>
            <p className="text-sm text-muted-foreground mb-4">{exercise.description}</p>
            
            {exercise.sample_prompts && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Try these prompts:</p>
                <div className="space-y-2">
                  {exercise.sample_prompts.map((prompt: string, idx: number) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <code className="text-sm">{prompt}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {exercise.tools && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Tools you'll use:</p>
                <div className="flex flex-wrap gap-2">
                  {exercise.tools.map((tool: string, idx: number) => (
                    <Badge key={idx} variant="outline">{tool}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}

        {content.starter_code && (
          <Card className="p-6 bg-black text-green-400">
            <h4 className="font-semibold mb-3">Starter Code</h4>
            <pre className="text-sm overflow-x-auto">
              <code>{content.starter_code}</code>
            </pre>
          </Card>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (module.type) {
      case 'video':
        return renderVideoContent();
      case 'article':
        return renderArticleContent();
      case 'hands-on':
        return renderHandsOnContent();
      default:
        return <p className="text-muted-foreground">Content type not supported yet.</p>;
    }
  };

  return (
    <div className="space-y-6">
      {!hasStarted && !isCompleted ? (
        <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-purple-500/10">
          <PlayCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Ready to start?</h3>
          <p className="text-muted-foreground mb-6">
            This module will take approximately {module.duration} to complete
          </p>
          <Button size="lg" onClick={() => setHasStarted(true)}>
            Start Module
          </Button>
        </Card>
      ) : (
        <>
          {renderContent()}
          
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              Estimated time: {module.duration}
            </div>
            {!isCompleted ? (
              <Button onClick={onComplete} size="lg">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            ) : (
              <Badge className="bg-green-500 text-white px-4 py-2">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completed
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ModuleContentViewer;