import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ExternalLink, Bell, Video } from "lucide-react";

export default function ConferenceCalendar() {
  const conferences = [
    {
      id: 1,
      name: "NeurIPS 2025",
      fullName: "Neural Information Processing Systems",
      date: "December 10-16, 2025",
      location: "New Orleans, LA",
      type: "Academic",
      attendees: "15,000+",
      topics: ["Deep Learning", "Reinforcement Learning", "Theory"],
      deadline: "May 17, 2025",
      notificationDate: "Sep 22, 2025",
      virtual: true,
      status: "Upcoming"
    },
    {
      id: 2,
      name: "ICML 2026",
      fullName: "International Conference on Machine Learning",
      date: "July 13-19, 2026",
      location: "Vienna, Austria",
      type: "Academic",
      attendees: "12,000+",
      topics: ["Machine Learning", "Optimization", "Applications"],
      deadline: "February 1, 2026",
      notificationDate: "May 8, 2026",
      virtual: true,
      status: "Call for Papers"
    },
    {
      id: 3,
      name: "CVPR 2026",
      fullName: "Conference on Computer Vision and Pattern Recognition",
      date: "June 19-25, 2026",
      location: "Seattle, WA",
      type: "Academic",
      attendees: "10,000+",
      topics: ["Computer Vision", "Image Recognition", "Video Analysis"],
      deadline: "November 15, 2025",
      notificationDate: "February 27, 2026",
      virtual: true,
      status: "Upcoming"
    },
    {
      id: 4,
      name: "AI Summit SF",
      fullName: "AI Summit San Francisco",
      date: "November 12-13, 2025",
      location: "San Francisco, CA",
      type: "Industry",
      attendees: "5,000+",
      topics: ["Enterprise AI", "AI Strategy", "Implementation"],
      deadline: "N/A",
      virtual: false,
      status: "Registration Open"
    },
    {
      id: 5,
      name: "ICLR 2026",
      fullName: "International Conference on Learning Representations",
      date: "April 24-28, 2026",
      location: "Addis Ababa, Ethiopia",
      type: "Academic",
      attendees: "8,000+",
      topics: ["Representation Learning", "Deep Learning", "Theory"],
      deadline: "October 1, 2025",
      notificationDate: "January 28, 2026",
      virtual: true,
      status: "Upcoming"
    },
    {
      id: 6,
      name: "IROS 2025",
      fullName: "IEEE/RSJ International Conference on Intelligent Robots",
      date: "October 19-23, 2025",
      location: "Abu Dhabi, UAE",
      type: "Academic",
      attendees: "4,000+",
      topics: ["Robotics", "Automation", "Control Systems"],
      deadline: "March 1, 2025",
      notificationDate: "June 30, 2025",
      virtual: true,
      status: "Accepted Papers Announced"
    },
    {
      id: 7,
      name: "AI DevWorld",
      fullName: "AI Developer World Conference",
      date: "October 29-30, 2025",
      location: "Santa Clara, CA",
      type: "Industry",
      attendees: "3,000+",
      topics: ["AI Development", "MLOps", "Production AI"],
      deadline: "N/A",
      virtual: true,
      status: "Registration Open"
    },
    {
      id: 8,
      name: "ACL 2026",
      fullName: "Association for Computational Linguistics",
      date: "August 2-7, 2026",
      location: "Bangkok, Thailand",
      type: "Academic",
      attendees: "3,500+",
      topics: ["NLP", "Language Models", "Linguistics"],
      deadline: "February 15, 2026",
      notificationDate: "May 15, 2026",
      virtual: true,
      status: "Call for Papers"
    }
  ];

  return (
    <>
      <Helmet>
        <title>AI Conference Calendar 2025-2026 - NeurIPS, ICML, CVPR, ICLR Deadlines | Tokenomy</title>
        <meta name="description" content="Complete AI and robotics conference calendar for 2025-2026. Track submission deadlines, acceptance dates, and locations for NeurIPS, ICML, CVPR, ICLR, ACL, IROS. Find academic and industry AI events worldwide." />
        <meta name="keywords" content="AI conferences 2025, machine learning conferences, NeurIPS 2025, ICML 2026, CVPR 2026, ICLR 2026, ACL 2026, IROS 2025, AI conference deadlines, paper submission deadlines, AI events calendar, robotics conferences, deep learning conferences, computer vision conferences, NLP conferences" />
        <meta name="author" content="Tokenomy Research Team" />
        <link rel="canonical" href="https://tokenomy.dev/research/conference-calendar" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AI Conference Calendar 2025-2026 - Track Major AI & Robotics Events" />
        <meta property="og:description" content="Complete calendar of AI conferences including NeurIPS, ICML, CVPR, ICLR with submission deadlines and acceptance dates. Plan your AI research publications." />
        <meta property="og:url" content="https://tokenomy.dev/research/conference-calendar" />
        <meta property="og:site_name" content="Tokenomy" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Conference Calendar 2025-2026 | Tokenomy" />
        <meta name="twitter:description" content="Track NeurIPS, ICML, CVPR, ICLR and more AI conferences. Never miss submission deadlines." />
        
        {/* Structured Data for Event Listings */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "AI and Robotics Conference Calendar",
            "description": "Comprehensive calendar of major AI, machine learning, and robotics conferences worldwide",
            "itemListElement": conferences.map((conf, index) => ({
              "@type": "Event",
              "position": index + 1,
              "name": conf.fullName,
              "alternateName": conf.name,
              "startDate": conf.date.split("-")[0],
              "endDate": conf.date.split("-")[1] || conf.date.split("-")[0],
              "eventAttendanceMode": conf.virtual ? "https://schema.org/MixedEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
              "location": {
                "@type": "Place",
                "name": conf.location
              },
              "description": `${conf.fullName} - ${conf.topics.join(", ")}`,
              "eventStatus": "https://schema.org/EventScheduled",
              "organizer": {
                "@type": "Organization",
                "name": conf.name
              }
            }))
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Conference Calendar
          </h1>
          <p className="text-lg text-muted-foreground">
            Track upcoming AI and robotics conferences, deadlines, and events
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-1">8</div>
              <div className="text-sm text-muted-foreground">Upcoming Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-1">3</div>
              <div className="text-sm text-muted-foreground">Deadlines This Month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-1">60K+</div>
              <div className="text-sm text-muted-foreground">Total Attendees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-1">5</div>
              <div className="text-sm text-muted-foreground">Virtual Events</div>
            </CardContent>
          </Card>
        </div>

        {/* Conference List */}
        <div className="space-y-4">
          {conferences.map((conf) => (
            <Card key={conf.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{conf.name}</CardTitle>
                      <Badge variant={conf.type === "Academic" ? "default" : "secondary"}>
                        {conf.type}
                      </Badge>
                      <Badge variant="outline">{conf.status}</Badge>
                      {conf.virtual && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          Virtual
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">{conf.fullName}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{conf.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{conf.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{conf.attendees} expected attendees</span>
                    </div>
                  </div>
                  
                  {conf.deadline && (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="font-medium mb-1">Paper Submission Deadline</div>
                        <div className="text-muted-foreground">{conf.deadline}</div>
                      </div>
                      {conf.notificationDate && (
                        <div className="text-sm">
                          <div className="font-medium mb-1">Notification Date</div>
                          <div className="text-muted-foreground">{conf.notificationDate}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Topics</div>
                  <div className="flex flex-wrap gap-2">
                    {conf.topics.map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Official Website
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Bell className="h-3 w-3" />
                    Set Reminder
                  </Button>
                  {conf.virtual && (
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Video className="h-3 w-3" />
                      Virtual Access
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
