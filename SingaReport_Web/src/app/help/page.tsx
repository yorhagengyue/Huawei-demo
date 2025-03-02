'use client';

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ChevronDown, ChevronUp, Search, Mail, Phone, MapPin, Clock, ExternalLink } from "lucide-react";

// FAQ 数据
const faqItems = [
  {
    question: "What is SingaReport?",
    answer: "SingaReport is a platform that allows Singapore residents to report urban issues directly to relevant authorities. Users can submit reports with photos, track the status of their reports, and receive updates when issues are resolved."
  },
  {
    question: "How do I create an account?",
    answer: "To create an account, click on the 'Register' button in the top-right corner of the homepage. You'll need to provide your email address, create a username and password, and verify your email."
  },
  {
    question: "What types of issues can I report?",
    answer: "You can report various urban issues including road damage, street light outages, illegal dumping, graffiti, broken public facilities, unsafe conditions, and more. If you're unsure about a specific issue, you can select 'Other' and provide details."
  },
  {
    question: "Can I attach photos to my reports?",
    answer: "Yes, you can attach up to 5 photos or videos to each report. Visual evidence helps authorities better understand and address the reported issues."
  },
  {
    question: "How long does it take for issues to be resolved?",
    answer: "Resolution times vary depending on the type and severity of the issue, as well as the responsible agency's workload. You can check the status of your reports in your dashboard, and you'll receive notifications when there are updates."
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we take data privacy seriously. Your personal information is encrypted and only shared with relevant authorities when necessary for resolving reported issues. Please review our Privacy Policy for more details."
  },
  {
    question: "Can I report issues anonymously?",
    answer: "While you need an account to submit reports, you can choose to keep your identity private from public view. However, relevant authorities may still receive your contact information if necessary for follow-up."
  },
  {
    question: "How do I track the status of my reports?",
    answer: "You can view all your submitted reports and their current status on your dashboard. Each report will be marked as 'Pending', 'In Progress', 'Resolved', or 'Closed'."
  }
];

// 使用指南列表
const guides = [
  {
    title: "Getting Started Guide for New Users",
    description: "Learn the basics of SingaReport, from creating an account to submitting your first report.",
    link: "/help/guides/getting-started"
  },
  {
    title: "Effective Reporting Guide",
    description: "Tips for creating clear, detailed reports that get faster resolution.",
    link: "/help/guides/effective-reporting"
  },
  {
    title: "Mobile App User Guide",
    description: "How to use the SingaReport mobile app for on-the-go reporting.",
    link: "/help/guides/mobile-app"
  },
  {
    title: "Report Status Tracking",
    description: "Understanding the different status labels and tracking system.",
    link: "/help/guides/report-tracking"
  },
  {
    title: "Account Management",
    description: "How to manage your profile, notifications, and privacy settings.",
    link: "/help/guides/account-management"
  }
];

// 联系支持信息
const supportContact = {
  email: "support@singareport.com",
  phone: "+65 6123 4567",
  hours: "Monday to Friday, 8:30 AM to 6:00 PM (SGT)",
  address: "123 Urban Solutions Tower, Singapore 123456"
};

export default function HelpCenterPage() {
  // 状态管理
  const [activeTab, setActiveTab] = useState("faq");
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);

  // 切换FAQ展开/收起状态
  const toggleFaq = (index: number) => {
    setExpandedFaqs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };
  
  // 使用useEffect处理动画样式的添加，确保只在客户端执行
  useEffect(() => {
    // 添加全局动画样式
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideRight {
        from { 
          opacity: 0;
          transform: translateX(-20px);
        }
        to { 
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .animate-fade-in {
        animation: fadeIn 0.6s ease forwards;
      }
      
      .animate-slide-up {
        animation: slideUp 0.5s ease forwards;
      }
      
      .animate-slide-right {
        animation: slideRight 0.5s ease forwards;
      }
      
      .tab-transition {
        transition: all 0.3s ease;
      }
      
      .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
        opacity: 0;
        margin-top: 0;
      }
      
      .faq-answer.expanded {
        max-height: 500px;
        opacity: 1;
        margin-top: 0.5rem;
      }
      
      .faq-question {
        transition: background-color 0.2s ease;
      }
      
      .faq-question:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .guide-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .guide-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      
      .contact-item {
        transition: transform 0.2s ease;
      }
      
      .contact-item:hover {
        transform: translateX(5px);
      }
    `;
    document.head.appendChild(style);
    
    // 组件卸载时清理
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center animate-fade-in">
        Help Center
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger 
            value="faq" 
            className={`tab-transition ${activeTab === "faq" ? "animate-slide-up" : ""}`}
          >
            FAQ
          </TabsTrigger>
          <TabsTrigger 
            value="guides" 
            className={`tab-transition ${activeTab === "guides" ? "animate-slide-up" : ""}`}
          >
            User Guides
          </TabsTrigger>
          <TabsTrigger 
            value="contact" 
            className={`tab-transition ${activeTab === "contact" ? "animate-slide-up" : ""}`}
          >
            Contact Support
          </TabsTrigger>
        </TabsList>
        
        {/* FAQ 内容 */}
        <TabsContent value="faq" className="animate-slide-up">
          <div className="space-y-2">
            <div className="flex items-center mb-4">
              <Search className="w-5 h-5 mr-2 text-gray-500" />
              <Input 
                type="search" 
                placeholder="Search FAQs..." 
                className="transition-all duration-300 focus:border-primary"
              />
            </div>
            
            {faqItems.map((faq, index) => (
              <div 
                key={index} 
                className="border rounded-lg overflow-hidden mb-3"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Button
                  variant="ghost"
                  className={`w-full p-4 flex justify-between items-center text-left faq-question bg-card hover:bg-muted`}
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-md">{faq.question}</span>
                  {expandedFaqs.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-primary transition-transform duration-300" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-300" />
                  )}
                </Button>
                <div className={`px-4 pb-4 text-muted-foreground faq-answer ${expandedFaqs.includes(index) ? 'expanded' : ''}`}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* 使用指南内容 */}
        <TabsContent value="guides" className="animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <Link href={guide.link} key={index}>
                <Card 
                  className="guide-card h-full cursor-pointer" 
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <CardTitle>{guide.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{guide.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end text-primary">
                    <ExternalLink className="h-5 w-5" />
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
        
        {/* 联系支持内容 */}
        <TabsContent value="contact" className="animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 contact-item">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href={`mailto:${supportContact.email}`} className="text-blue-600 hover:underline">
                      {supportContact.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 contact-item">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href={`tel:${supportContact.phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline">
                      {supportContact.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 contact-item">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Working Hours</p>
                    <p>{supportContact.hours}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 contact-item">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Office Address</p>
                    <p>{supportContact.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" className="transition-all duration-300 focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your email" className="transition-all duration-300 focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issue">Issue Description</Label>
                    <Textarea 
                      id="issue" 
                      placeholder="Please describe your issue in detail"
                      className="min-h-[120px] transition-all duration-300 focus:border-primary"
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button className="w-full transition-transform hover:scale-105">
                  Submit Request
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 