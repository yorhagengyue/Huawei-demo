'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Button, 
  Alert,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  Shield, 
  FileCheck, 
  Bell, 
  Smartphone,
  ArrowRight
} from 'lucide-react';

export default function ReportTrackingGuidePage() {
  // Animation for elements when they enter the viewport
  const [titleRef, titleInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section1Ref, section1InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section2Ref, section2InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section3Ref, section3InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section4Ref, section4InView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="container max-w-5xl py-8 space-y-10">
      {/* Page Title */}
      <div 
        ref={titleRef}
        className={`space-y-4 text-center transition-all duration-700 ${
          titleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h1 className="text-4xl font-bold tracking-tight">Report Status Tracking Guide</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Learn how to track and understand the status of your reports in the SingaReport system
        </p>
      </div>

      {/* Introduction Section */}
      <Card
        ref={section1Ref}
        className={`transition-all duration-700 ${
          section1InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            Understanding Report Tracking
          </CardTitle>
          <CardDescription>
            The SingaReport system provides transparent tracking of all your submitted reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            After submitting a report through the SingaReport platform, you can track its status 
            throughout the entire resolution process. Our tracking system is designed to provide 
            transparency and keep you informed about what's happening with your reports.
          </p>

          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>Why Track Reports?</AlertTitle>
            <AlertDescription>
              Tracking allows you to stay informed about the progress of your reports, know when action has been taken,
              and receive updates when your reported issues have been resolved.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Report Status Meanings Section */}
      <Card
        ref={section2Ref}
        className={`transition-all duration-700 ${
          section2InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Report Status Meanings
          </CardTitle>
          <CardDescription>
            Understanding what each status means in the report lifecycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium">Pending</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your report has been submitted and is waiting for initial review by our team. 
                  All new reports start in this status.
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">Under Review</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your report is currently being evaluated by our team. We're assessing its
                  details and determining the appropriate response.
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-medium">In Progress</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Action is being taken on your report. The relevant department is working
                  to address the issue you've reported.
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Resolved</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  The issue in your report has been successfully addressed and is now considered resolved.
                  You can provide feedback on the resolution.
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="font-medium">Rejected</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your report couldn't be processed. This may happen if there's insufficient information,
                  it's a duplicate, or it falls outside our service scope.
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-purple-500" />
                  <h3 className="font-medium">Need More Info</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  We need additional information to proceed with your report. Please check your
                  notifications for specific requests from our team.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Track Reports Section */}
      <Card
        ref={section3Ref}
        className={`transition-all duration-700 ${
          section3InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            How to Track Your Reports
          </CardTitle>
          <CardDescription>
            Multiple ways to monitor the status of your submitted reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="webapp" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="webapp">Web Application</TabsTrigger>
              <TabsTrigger value="mobile">Mobile App</TabsTrigger>
            </TabsList>
            <TabsContent value="webapp" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h3 className="font-medium">Tracking via Web Dashboard</h3>
                <ol className="space-y-3 list-decimal pl-5">
                  <li>
                    <strong>Log in</strong> to your SingaReport account at <span className="text-primary">app.singareport.sg</span>
                  </li>
                  <li>
                    <strong>Navigate to Dashboard</strong> - Your most recent reports will be displayed on the main dashboard
                  </li>
                  <li>
                    <strong>Go to "My Reports" section</strong> - For a full history of all your submitted reports
                  </li>
                  <li>
                    <strong>Click on any report</strong> - To view its detailed status, history, and any comments or updates
                  </li>
                </ol>

                <div className="border rounded-lg p-4 bg-muted/50 mt-4">
                  <h4 className="font-medium mb-2">Dashboard Report Color Coding</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                      <span>Yellow - Pending or Under Review</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span>Blue - In Progress</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span>Green - Resolved</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span>Red - Rejected or Requires Attention</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="mobile" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h3 className="font-medium">Tracking via Mobile App</h3>
                <ol className="space-y-3 list-decimal pl-5">
                  <li>
                    <strong>Open</strong> the SingaReport mobile app on your device
                  </li>
                  <li>
                    <strong>Tap on "My Reports" tab</strong> - Located at the bottom navigation bar
                  </li>
                  <li>
                    <strong>View your report list</strong> - All reports are displayed with their current status
                  </li>
                  <li>
                    <strong>Tap any report</strong> - To see detailed information and status history
                  </li>
                </ol>

                <Alert className="mt-4">
                  <Bell className="h-4 w-4" />
                  <AlertTitle>Enable Notifications</AlertTitle>
                  <AlertDescription>
                    Make sure to enable push notifications in the mobile app settings to receive real-time 
                    updates whenever your report status changes.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notifications and Updates Section */}
      <Card
        ref={section4Ref}
        className={`transition-all duration-700 ${
          section4InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notifications and Updates
          </CardTitle>
          <CardDescription>
            Stay informed with automatic notifications about your reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            SingaReport provides multiple channels to keep you updated about changes to your report status:
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive email updates when your report status changes, when someone comments on your 
                report, or when additional information is requested.
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-medium">Mobile Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Get instant alerts on your mobile device for real-time updates about your reports
                when using the SingaReport mobile app.
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-medium">In-App Notifications</h3>
              <p className="text-sm text-muted-foreground">
                A notification bell in both web and mobile interfaces shows recent activity related
                to your reports, including status changes and comments.
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-medium">SMS Updates (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                You can opt in to receive text message updates for critical status changes by
                enabling this feature in your account settings.
              </p>
            </div>
          </div>

          <Alert className="bg-primary/10 border-primary/20 mt-4">
            <AlertTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Notification Preferences
            </AlertTitle>
            <AlertDescription>
              You can customize your notification preferences in your account settings. Choose which 
              types of updates you receive and through which channels.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Next Steps Navigation */}
      <div className="pt-6 space-y-4">
        <h2 className="text-2xl font-bold text-center">Explore Other Guides</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/help/guides/mobile-app">
            <Button variant="outline" className="w-full justify-between">
              Mobile App Guide
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/help/guides/account-management">
            <Button variant="outline" className="w-full justify-between">
              Account Management Guide
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/help/guides/effective-reporting">
            <Button variant="outline" className="w-full justify-between">
              Effective Reporting Guide
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/help">
            <Button variant="outline" className="w-full justify-between">
              Help Center Home
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 