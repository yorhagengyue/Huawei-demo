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
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator
} from '@/components/ui';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Lock, 
  UserPlus, 
  Mail,
  ArrowLeft,
  KeyRound,
  PencilLine,
  Trash2,
  Eye,
  EyeOff,
  HelpCircle,
  AlertTriangle,
  Smartphone,
  ArrowRight
} from 'lucide-react';

export default function AccountManagementGuidePage() {
  // Animation for elements when they enter the viewport
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section1Ref, section1InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section2Ref, section2InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section3Ref, section3InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section4Ref, section4InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div 
        ref={headerRef}
        className={`mb-8 transition-all duration-700 ${
          headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h1 className="text-3xl font-bold mb-4">Account Management Guide</h1>
        <p className="text-lg text-muted-foreground">
          Learn how to manage your SingaReport account, update your profile, and configure your preferences
        </p>
      </div>
      
      {/* Creating an Account Section */}
      <Card 
        ref={section1Ref}
        className={`mb-8 transition-all duration-700 ${
          section1InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Creating Your Account
          </CardTitle>
          <CardDescription>
            Getting started with your SingaReport account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Creating a SingaReport account gives you access to all platform features, allows you to track 
            your reports, and helps you manage your community engagement.
          </p>
          
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">Account Creation Steps</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Visit the SingaReport platform</strong> - Access our website at 
                  <span className="text-primary"> www.singareport.sg</span> or download our mobile app
                </li>
                <li>
                  <strong>Click on "Sign Up" or "Create Account"</strong> - Located in the top right of the website or on the welcome screen of the app
                </li>
                <li>
                  <strong>Enter your personal information</strong>:
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                    <li>Full name</li>
                    <li>Email address (this will be your username)</li>
                    <li>Mobile number</li>
                    <li>Create a strong password</li>
                  </ul>
                </li>
                <li>
                  <strong>Verify your email address</strong> - Check your inbox for a verification link
                </li>
                <li>
                  <strong>Complete your profile</strong> - Add optional details like your neighborhood or areas of interest
                </li>
              </ol>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Account Verification</AlertTitle>
              <AlertDescription>
                Email verification helps prevent spam accounts and ensures we can contact you about your reports.
                Your account won't be fully activated until you verify your email address.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Management Section */}
      <Card 
        ref={section2Ref}
        className={`mb-8 transition-all duration-700 ${
          section2InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Managing Your Profile
          </CardTitle>
          <CardDescription>
            Keep your personal information up-to-date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="avatar">Profile Picture</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-4 pt-4">
              <h3 className="font-medium">Updating Personal Information</h3>
              <p className="text-sm text-muted-foreground">
                You can update your name and other personal details at any time:
              </p>
              
              <ol className="list-decimal pl-5 space-y-2">
                <li>Navigate to your profile by clicking on your name or profile icon</li>
                <li>Select "Edit Profile" or "Account Settings"</li>
                <li>Update the relevant fields in the "Personal Information" section</li>
                <li>Click "Save Changes" to apply your updates</li>
              </ol>
              
              <Alert variant="outline" className="mt-2">
                <PencilLine className="h-4 w-4" />
                <AlertDescription>
                  Keeping your profile up-to-date helps authorities contact you if they need additional
                  information about your reports.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4 pt-4">
              <h3 className="font-medium">Updating Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                It's important to keep your email and phone number current:
              </p>
              
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Changing Email Address</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Go to "Account Settings" → "Contact Information"</li>
                    <li>Click "Change" next to your email address</li>
                    <li>Enter your new email address and current password</li>
                    <li>A verification link will be sent to your new email</li>
                    <li>Click the link to verify and complete the change</li>
                  </ol>
                </div>
                
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Changing Phone Number</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Go to "Account Settings" → "Contact Information"</li>
                    <li>Click "Change" next to your phone number</li>
                    <li>Enter your new number and verify with the OTP sent via SMS</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="avatar" className="space-y-4 pt-4">
              <h3 className="font-medium">Managing Your Profile Picture</h3>
              <p className="text-sm text-muted-foreground">
                A profile picture helps identify your contributions to the community:
              </p>
              
              <ol className="list-decimal pl-5 space-y-2">
                <li>Go to your profile and click on the profile picture or placeholder</li>
                <li>Select "Upload Photo" to choose an image from your device</li>
                <li>Crop and adjust the image as needed</li>
                <li>Click "Save" to update your profile picture</li>
              </ol>
              
              <div className="bg-muted rounded-lg p-4 mt-2">
                <h4 className="font-medium mb-1">Profile Picture Guidelines</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Maximum file size: 5MB</li>
                  <li>Recommended dimensions: 500x500 pixels</li>
                  <li>Supported formats: JPG, PNG, GIF (non-animated)</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Account Security Section */}
      <Card 
        ref={section3Ref}
        className={`mb-8 transition-all duration-700 ${
          section3InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Account Security
          </CardTitle>
          <CardDescription>
            Protect your account from unauthorized access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-500" />
                Password Management
              </h3>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Changing Your Password</h4>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Go to "Account Settings" → "Security"</li>
                  <li>Click on "Change Password"</li>
                  <li>Enter your current password</li>
                  <li>Create a new strong password and confirm it</li>
                  <li>Click "Update Password" to save the changes</li>
                </ol>
                
                <div className="flex mt-3">
                  <div className="bg-primary/10 rounded-lg p-3 flex-1">
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      Strong Password Tips
                    </h4>
                    <ul className="list-disc pl-4 text-xs space-y-0.5">
                      <li>At least 8 characters long</li>
                      <li>Include uppercase and lowercase letters</li>
                      <li>Include numbers and special characters</li>
                      <li>Avoid common words or personal information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Add an extra layer of security by enabling two-factor authentication:
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="enable-2fa">
                  <AccordionTrigger className="text-sm">How to Enable 2FA</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 text-sm space-y-1">
                      <li>Go to "Account Settings" → "Security" → "Two-Factor Authentication"</li>
                      <li>Click "Enable 2FA"</li>
                      <li>Choose your preferred 2FA method:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>SMS authentication (receive codes via text message)</li>
                          <li>Authenticator app (Google Authenticator, Microsoft Authenticator, etc.)</li>
                        </ul>
                      </li>
                      <li>Follow the setup instructions for your chosen method</li>
                      <li>Verify the setup by entering a generated code</li>
                      <li>Save your backup recovery codes in a secure location</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="recovery">
                  <AccordionTrigger className="text-sm">Recovery Options</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm mb-2">
                      If you lose access to your 2FA device, you can use one of these recovery methods:
                    </p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li><strong>Recovery codes</strong> - Use one of the backup codes provided during setup</li>
                      <li><strong>Alternative method</strong> - If you set up multiple 2FA methods, use an alternative one</li>
                      <li><strong>Contact support</strong> - If all else fails, contact our support team with proof of identity</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          
          <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Account Security Warning</AlertTitle>
            <AlertDescription>
              Never share your password or 2FA codes with anyone, including SingaReport staff. 
              Our team will never ask for your full password or security codes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      {/* Notification Preferences Section */}
      <Card 
        ref={section4Ref}
        className={`mb-8 transition-all duration-700 ${
          section4InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Customize how and when you receive updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            SingaReport sends notifications about report status updates, community engagement, 
            and platform announcements. You can customize which notifications you receive and how:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">Notification Types</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <strong>Report Updates</strong> - Status changes on your reports
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <strong>Comments</strong> - When someone comments on your reports
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <strong>Official Responses</strong> - Replies from authorities
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <strong>Community</strong> - Updates about your neighborhood
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                  <strong>System</strong> - Platform announcements and updates
                </li>
              </ul>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">Delivery Methods</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <strong>Email</strong>
                    <p className="text-xs text-muted-foreground">Daily or immediate options available</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Smartphone className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Push Notifications</strong> (Mobile App)
                    <p className="text-xs text-muted-foreground">Real-time alerts on your device</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Bell className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <strong>In-App Notifications</strong>
                    <p className="text-xs text-muted-foreground">Notification center within the platform</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium mb-2">Managing Notification Settings</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Go to "Account Settings" → "Notifications"</li>
              <li>Customize each notification type:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Toggle notifications on/off by category</li>
                  <li>Select delivery methods for each notification type</li>
                  <li>Choose frequency (immediate, daily digest, weekly summary)</li>
                </ul>
              </li>
              <li>Click "Save Changes" to apply your preferences</li>
            </ol>
          </div>
        </CardContent>
      </Card>
      
      {/* Account Deletion Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Account Deletion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning: Account Deletion is Permanent</AlertTitle>
            <AlertDescription>
              Deleting your account will permanently remove all your data, including report history,
              personal information, and community contributions. This action cannot be undone.
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium mb-2">How to Delete Your Account</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Go to "Account Settings" → "Privacy & Data"</li>
              <li>Scroll to the bottom and click "Delete My Account"</li>
              <li>Read the information about account deletion carefully</li>
              <li>Enter your password for verification</li>
              <li>Confirm by clicking "Permanently Delete My Account"</li>
              <li>Complete any final verification steps if prompted</li>
            </ol>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Note: If you have active reports that require your attention, we recommend resolving
            these matters before deleting your account. Reports in progress will continue to be 
            processed, but you'll no longer receive updates about them.
          </p>
        </CardContent>
      </Card>
      
      {/* Help and Support Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Help and Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            If you need assistance with your account or have questions not covered in this guide,
            our support team is ready to help:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Contact Support</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Email: support@singareport.sg</span>
                </li>
                <li className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <span>Phone: +65 6XXX XXXX (Mon-Fri, 9am-5pm)</span>
                </li>
                <li>
                  In-app: Tap on "Help" → "Contact Support"
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Additional Resources</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <Link href="/help/faq" className="text-primary hover:underline">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <Link href="/help/tutorials" className="text-primary hover:underline">
                    Video Tutorials
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <Link href="/help/guides" className="text-primary hover:underline">
                    All User Guides
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button asChild variant="outline">
          <Link href="/help">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>
        </Button>
        
        <Button asChild>
          <Link href="/help/guides/mobile-app">
            Explore Mobile App Guide
          </Link>
        </Button>
      </div>
    </div>
  );
} 