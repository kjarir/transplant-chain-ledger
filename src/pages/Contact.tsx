import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HeadphonesIcon, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent Successfully",
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({
      name: '',
      email: '',
      subject: '',
      category: '',
      message: ''
    });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@transplantchain.org",
      hours: "24/7 Response"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our team",
      contact: "+1 (555) 123-4567",
      hours: "Mon-Fri, 9AM-6PM EST"
    },
    {
      icon: MapPin,
      title: "Headquarters",
      description: "Visit our main office",
      contact: "123 Medical Center Blvd, Healthcare City, HC 12345",
      hours: "Mon-Fri, 8AM-5PM EST"
    },
    {
      icon: HeadphonesIcon,
      title: "Emergency Support",
      description: "24/7 critical support",
      contact: "+1 (555) 911-HELP",
      hours: "24/7 Available"
    }
  ];

  const faqItems = [
    {
      question: "How secure is the TransplantChain platform?",
      answer: "Our platform uses blockchain technology and end-to-end encryption to ensure maximum security and data privacy."
    },
    {
      question: "How do I register as a donor or patient?",
      answer: "You can register through our authentication page by selecting your role and providing the required medical information."
    },
    {
      question: "Can doctors verify organ compatibility?",
      answer: "Yes, certified medical professionals can access verification tools and compatibility matching systems."
    },
    {
      question: "Is TransplantChain available globally?",
      answer: "We're currently operating in 25+ countries and expanding. Check our coverage area for your location."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            Contact Support
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Get in
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Have questions about TransplantChain? Need technical support? Our dedicated team is here 
            to help you 24/7 with any queries or concerns.
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="medical">Medical Questions</SelectItem>
                          <SelectItem value="account">Account Issues</SelectItem>
                          <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                          <SelectItem value="general">General Information</SelectItem>
                          <SelectItem value="emergency">Emergency Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your inquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide detailed information about your inquiry..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" variant="medical" className="w-full" disabled={loading}>
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                  <CardDescription>
                    Multiple ways to reach our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{info.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{info.description}</p>
                        <p className="text-sm font-medium">{info.contact}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{info.hours}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Global Presence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">North America</h4>
                      <p className="text-xs text-muted-foreground">USA, Canada, Mexico</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Europe</h4>
                      <p className="text-xs text-muted-foreground">UK, Germany, France, Spain</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Asia Pacific</h4>
                      <p className="text-xs text-muted-foreground">Japan, Australia, Singapore</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Quick answers to common questions about TransplantChain
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqItems.map((faq, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;