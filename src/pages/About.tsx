import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Heart, Users, Activity, Lock, Globe, CheckCircle, Zap } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Immutable records ensure transparency and prevent tampering with organ allocation data."
    },
    {
      icon: Heart,
      title: "Life-Saving Impact",
      description: "Streamlined processes reduce waiting times and improve patient outcomes."
    },
    {
      icon: Users,
      title: "Multi-Stakeholder Platform",
      description: "Connects patients, donors, doctors, and administrators in one secure ecosystem."
    },
    {
      icon: Activity,
      title: "Real-Time Tracking",
      description: "Monitor organ requests, donations, and allocations in real-time with full audit trails."
    },
    {
      icon: Lock,
      title: "Privacy Protection",
      description: "Advanced encryption and role-based access ensure medical data privacy."
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      description: "Accessible from anywhere, enabling cross-border organ sharing when appropriate."
    }
  ];

  const stats = [
    { label: "Lives Saved", value: "10,000+", description: "Successful transplants facilitated" },
    { label: "Active Users", value: "50,000+", description: "Patients, donors, and medical professionals" },
    { label: "Partner Hospitals", value: "500+", description: "Medical institutions worldwide" },
    { label: "Countries", value: "25+", description: "Global reach and impact" }
  ];

  const timeline = [
    { year: "2024", title: "TransplantChain Launch", description: "Revolutionary blockchain-based organ transplant platform goes live" },
    { year: "2024", title: "Medical Partnerships", description: "Major hospitals and medical institutions join the network" },
    { year: "2024", title: "Global Expansion", description: "Platform extends to multiple countries with regulatory approval" },
    { year: "Future", title: "AI Integration", description: "Advanced matching algorithms and predictive analytics" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            About TransplantChain
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Revolutionizing Organ
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Transplant Management
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            TransplantChain leverages blockchain technology to create a transparent, secure, and efficient 
            ecosystem for organ donation and transplantation, saving lives through innovation.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We believe that technology can save lives. TransplantChain was created to address the critical 
                challenges in organ transplantation: lack of transparency, inefficient allocation systems, 
                and trust issues between stakeholders.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                By combining blockchain technology with modern web applications, we've created a platform 
                that ensures every organ donation is tracked, verified, and allocated fairly and transparently.
              </p>
              <div className="flex items-center gap-4">
                <CheckCircle className="w-6 h-6 text-success" />
                <span className="text-lg font-medium">Transparent allocation process</span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <CheckCircle className="w-6 h-6 text-success" />
                <span className="text-lg font-medium">Immutable transaction records</span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <CheckCircle className="w-6 h-6 text-success" />
                <span className="text-lg font-medium">Enhanced patient outcomes</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm font-medium mb-1">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with intuitive design to create 
              the most advanced organ transplant management system.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground">
              From concept to global impact - the TransplantChain story
            </p>
          </div>
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                    {item.year === "Future" ? <Zap className="w-6 h-6" /> : item.year.slice(-2)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{item.year}</Badge>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join the Revolution
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of the future of organ transplantation. Together, we can save more lives 
            and create a more transparent, efficient healthcare system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth" className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
              Get Started Today
            </a>
            <a href="/contact" className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;