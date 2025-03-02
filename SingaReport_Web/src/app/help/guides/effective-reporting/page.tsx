'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui';
import Link from 'next/link';
import { 
  Camera, 
  MapPin, 
  FileText, 
  Check, 
  X, 
  Clock, 
  Info, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  ImageIcon,
  MessageSquare,
  LucideIcon,
  Calendar,
  Flag,
  Clipboard,
  Lightbulb
} from 'lucide-react';

// Example component for best practice cards
interface BestPracticeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tips: string[];
  color: string;
}

const BestPracticeCard = ({ icon, title, description, tips, color }: BestPracticeCardProps) => {
  return (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-md">
      <CardHeader className={`bg-${color}-50`}>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <h4 className="font-medium mb-2">Tips:</h4>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className={`h-5 w-5 text-${color}-500 shrink-0 mt-0.5`} />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default function EffectiveReportingGuidePage() {
  // Animation for elements when they enter the viewport
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section1Ref, section1InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section2Ref, section2InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section3Ref, section3InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section4Ref, section4InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div 
        ref={headerRef}
        className={`mb-10 transition-all duration-700 ${
          headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h1 className="text-4xl font-bold mb-4">Effective Reporting Guide</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Learn how to create high-quality reports that get faster resolution and help improve your community
        </p>
      </div>
      
      {/* Introduction Section */}
      <section 
        ref={section1Ref}
        className={`mb-12 transition-all duration-700 ${
          section1InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <Card>
          <CardHeader>
            <CardTitle>Why Effective Reporting Matters</CardTitle>
            <CardDescription>
              The quality of your report directly impacts how quickly issues can be resolved
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              When you submit a report through SingaReport, your information is directed to the appropriate 
              government agency or department responsible for addressing the issue. Creating clear, 
              detailed, and accurate reports helps these teams:
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <div className="border rounded-lg p-4 bg-blue-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-blue-100 transform hover:-translate-y-1">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Respond Faster
                </h3>
                <p className="text-sm">
                  Clear information means less time spent seeking clarification and more time spent solving the problem.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 bg-green-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 transform hover:-translate-y-1">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Address Issues Correctly
                </h3>
                <p className="text-sm">
                  Detailed reports ensure that the right resources are allocated and proper solutions are implemented.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 bg-purple-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-purple-100 transform hover:-translate-y-1">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-purple-600" />
                  Improve Service Quality
                </h3>
                <p className="text-sm">
                  Quality data helps agencies identify patterns and implement systemic improvements.
                </p>
              </div>
            </div>
            
            <Alert className="mt-4 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle>Remember</AlertTitle>
              <AlertDescription>
                Your report may be one of hundreds received each day. Making it stand out with clear,
                actionable information significantly increases the chances of prompt resolution.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>
      
      {/* Best Practices Section */}
      <section 
        ref={section2Ref}
        className={`mb-12 transition-all duration-700 ${
          section2InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h2 className="text-2xl font-bold mb-6">Reporting Best Practices</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <BestPracticeCard
            icon={<ImageIcon className="h-5 w-5 text-blue-600" />}
            title="Take Clear Photos"
            description="Visual evidence is crucial for effective reports"
            tips={[
              "Capture multiple angles of the issue",
              "Ensure good lighting when possible",
              "Include context in your shots (surrounding area)",
              "Focus on the specific problem area",
              "Avoid blurry or extremely dark images"
            ]}
            color="blue"
          />
          
          <BestPracticeCard
            icon={<MapPin className="h-5 w-5 text-red-600" />}
            title="Provide Precise Location"
            description="Help teams locate the issue quickly"
            tips={[
              "Use the map pin feature to mark exact locations",
              "Mention nearby landmarks or street intersections",
              "Include building names or numbers when applicable",
              "Specify the floor/level for issues in multi-story buildings",
              "Describe the location in relation to prominent features"
            ]}
            color="red"
          />
          
          <BestPracticeCard
            icon={<MessageSquare className="h-5 w-5 text-green-600" />}
            title="Write Clear Descriptions"
            description="Details help determine the right response"
            tips={[
              "Be specific about what the issue is",
              "Mention how long the issue has been present (if known)",
              "Describe the severity or impact",
              "Note if the situation is worsening",
              "Use concise, factual language"
            ]}
            color="green"
          />
          
          <BestPracticeCard
            icon={<Calendar className="h-5 w-5 text-purple-600" />}
            title="Report Timely Information"
            description="Current information leads to better responses"
            tips={[
              "Submit reports as soon as you notice issues",
              "Include the date and time you observed the problem",
              "Note if the issue occurs at specific times",
              "Update your report if conditions change",
              "Mention if it's a recurring issue"
            ]}
            color="purple"
          />
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-primary" />
              Before Submitting Your Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Take a moment to review your report and ensure it includes:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Complete information</strong>
                  <p className="text-sm text-muted-foreground">
                    All relevant details about the issue
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Accurate location data</strong>
                  <p className="text-sm text-muted-foreground">
                    Precise location where the issue is occurring
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Clear photos</strong>
                  <p className="text-sm text-muted-foreground">
                    Visual evidence that helps explain the issue
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Correct categorization</strong>
                  <p className="text-sm text-muted-foreground">
                    The proper issue type to route to the right department
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Examples Section */}
      <section 
        ref={section3Ref}
        className={`mb-12 transition-all duration-700 ${
          section3InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h2 className="text-2xl font-bold mb-6">Examples of Effective Reports</h2>
        
        <Tabs defaultValue="pothole" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pothole">Pothole</TabsTrigger>
            <TabsTrigger value="streetlight">Streetlight</TabsTrigger>
            <TabsTrigger value="trash">Illegal Dumping</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pothole" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Road Damage Report Example</CardTitle>
                <CardDescription>Example of a well-structured pothole report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Good Example:</h3>
                    <div className="border rounded-lg p-4 bg-green-50">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium">Category:</h4>
                          <p className="text-sm">Road Damage > Pothole</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Location:</h4>
                          <p className="text-sm">Orchard Road, approximately 50 meters east of the Orchard MRT station exit B, in the rightmost lane heading east</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Description:</h4>
                          <p className="text-sm">Large pothole approximately 40cm wide and 8cm deep causing vehicles to swerve suddenly. I first noticed it 3 days ago and it appears to be growing larger. The pothole fills with water when it rains, making it difficult to see and more dangerous.</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Photos:</h4>
                          <p className="text-sm">3 clear images from different angles, including one showing the pothole in relation to nearby landmarks</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-muted-foreground">This report provides precise location, size details, and context about the hazard's severity and history.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Poor Example:</h3>
                    <div className="border rounded-lg p-4 bg-red-50">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium">Category:</h4>
                          <p className="text-sm">Other</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Location:</h4>
                          <p className="text-sm">Orchard Road</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Description:</h4>
                          <p className="text-sm">There's a hole in the road. Please fix it soon.</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Photos:</h4>
                          <p className="text-sm">1 blurry, distant photo where the pothole is barely visible</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ThumbsDown className="h-5 w-5 text-red-600" />
                      <p className="text-sm text-muted-foreground">This report lacks specific location details, size information, and clear visual evidence, making it difficult to locate and assess.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="streetlight" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Streetlight Malfunction Example</CardTitle>
                <CardDescription>Example of a well-structured streetlight report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Good Example:</h3>
                    <div className="border rounded-lg p-4 bg-green-50">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium">Category:</h4>
                          <p className="text-sm">Public Infrastructure > Streetlight Issue</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Location:</h4>
                          <p className="text-sm">Junction of Clementi Road and West Coast Road, northeast corner. The lamppost number is CL-0542 (visible on the pole).</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Description:</h4>
                          <p className="text-sm">Streetlight is flickering continuously after dark and occasionally goes completely dark for several minutes. This has been happening nightly for about a week. The area is a busy pedestrian crossing and the poor lighting is creating safety concerns for pedestrians.</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Photos:</h4>
                          <p className="text-sm">2 photos: one daytime photo clearly showing the lamppost number and location, one nighttime photo showing the flickering light</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-muted-foreground">This report includes the crucial lamppost identification number, exact location, and details about the pattern of malfunction.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Poor Example:</h3>
                    <div className="border rounded-lg p-4 bg-red-50">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium">Category:</h4>
                          <p className="text-sm">Electrical Issue</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Location:</h4>
                          <p className="text-sm">Clementi area near the bus stop</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Description:</h4>
                          <p className="text-sm">Light not working properly. Makes the area dark and dangerous.</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Photos:</h4>
                          <p className="text-sm">No photos</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ThumbsDown className="h-5 w-5 text-red-600" />
                      <p className="text-sm text-muted-foreground">This report lacks specific location identifiers, details about the nature of the malfunction, and visual evidence to help locate the issue.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trash" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Illegal Dumping Example</CardTitle>
                <CardDescription>Example of a well-structured illegal dumping report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Good Example:</h3>
                    <div className="border rounded-lg p-4 bg-green-50">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium">Category:</h4>
                          <p className="text-sm">Environmental > Illegal Dumping</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Location:</h4>
                          <p className="text-sm">Behind the playground at Bishan Park Block C, near the walking path that connects to Ang Mo Kio Avenue 1. The dump site is approximately 20 meters from the back gate of the playground.</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Description:</h4>
                          <p className="text-sm">Large pile of construction waste including broken tiles, cement bags, and metal scraps. The pile is approximately 2 meters wide and 1 meter high. This appears to be fresh dumping as it wasn't there when I walked by yesterday. Some of the metal pieces have sharp edges posing danger to park visitors and children.</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Photos:</h4>
                          <p className="text-sm">4 photos showing the entire pile from different angles, close-ups of hazardous materials, and wider shots showing the location context within the park</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-muted-foreground">This report provides a detailed description of the materials dumped, precise location information, timing, and information about safety hazards.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Poor Example:</h3>
                    <div className="border rounded-lg p-4 bg-red-50">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium">Category:</h4>
                          <p className="text-sm">Cleanliness</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Location:</h4>
                          <p className="text-sm">Bishan Park</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Description:</h4>
                          <p className="text-sm">Someone left a lot of trash in the park. It's disgusting and needs to be cleaned up.</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Photos:</h4>
                          <p className="text-sm">1 distant photo where the dump site is barely visible among trees</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ThumbsDown className="h-5 w-5 text-red-600" />
                      <p className="text-sm text-muted-foreground">This report lacks specific location within the large park, details about the type of waste, and clear photos to assess the severity and nature of the dumping.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
      
      {/* Tips for Follow-Up Section */}
      <section 
        ref={section4Ref}
        className={`mb-12 transition-all duration-700 ${
          section4InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              Following Up on Your Reports
            </CardTitle>
            <CardDescription>How to effectively check status and provide additional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              After submitting your report, you may need to follow up or provide additional information.
              Here are some best practices for effective follow-up:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Allow Reasonable Time
                </h3>
                <p className="text-sm">
                  Different issues require different response times. Minor issues may take several days, 
                  while urgent safety hazards should be addressed more quickly. Check the estimated 
                  response time provided when you submitted your report.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Respond to Questions
                </h3>
                <p className="text-sm">
                  If the assigned department asks follow-up questions through the app, respond promptly
                  with the requested information. Enable notifications to ensure you don't miss these requests.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                  Provide Updates
                </h3>
                <p className="text-sm">
                  If conditions change (e.g., situation worsens, emergency develops), update your report
                  with new information and photos rather than creating a duplicate report.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  Be Solution-Oriented
                </h3>
                <p className="text-sm">
                  When following up, focus on providing helpful information rather than just expressing 
                  frustration. Suggest potential solutions if you have relevant insights or expertise.
                </p>
              </div>
            </div>
            
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Status Updates</AlertTitle>
              <AlertDescription>
                Remember to check your report status in the app before following up. The status may provide
                information about actions already taken or scheduled.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>
      
      {/* Final Tips & Navigation */}
      <section className="mb-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-center">Final Tips for Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Check className="h-6 w-6 text-primary mx-auto" />
                <h3 className="font-medium">Be Factual</h3>
                <p className="text-sm text-muted-foreground">
                  Focus on observable facts rather than opinions or assumptions
                </p>
              </div>
              
              <div className="space-y-2">
                <Check className="h-6 w-6 text-primary mx-auto" />
                <h3 className="font-medium">Be Concise</h3>
                <p className="text-sm text-muted-foreground">
                  Provide all necessary details without unnecessary information
                </p>
              </div>
              
              <div className="space-y-2">
                <Check className="h-6 w-6 text-primary mx-auto" />
                <h3 className="font-medium">Be Respectful</h3>
                <p className="text-sm text-muted-foreground">
                  Maintain a constructive tone focused on problem-solving
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-center max-w-md">
              Your participation helps make our community better. High-quality reports lead to faster resolution,
              better data, and ultimately more effective public services for everyone.
            </p>
          </CardFooter>
        </Card>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button asChild variant="outline">
            <Link href="/help">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Link>
          </Button>
          
          <Button asChild>
            <Link href="/help/guides/report-tracking">
              Explore Report Tracking Guide
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
} 