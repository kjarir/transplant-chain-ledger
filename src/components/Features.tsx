import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Activity, 
  FileCheck, 
  Eye, 
  Lock,
  Heart,
  Stethoscope,
  Database
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Patient Dashboard",
      description: "Track your organ requests, view matches, and monitor transplant status in real-time with complete transparency.",
      color: "primary",
    },
    {
      icon: Heart,
      title: "Donor Management", 
      description: "Register organs for donation and track their allocation journey with blockchain-verified certificates.",
      color: "secondary",
    },
    {
      icon: Stethoscope,
      title: "Medical Verification",
      description: "Healthcare professionals can verify eligibility, update medical status, and approve transplant procedures.",
      color: "accent",
    },
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Every transaction is immutably recorded on the blockchain, ensuring complete transparency and trust.",
      color: "blockchain",
    },
    {
      icon: Eye,
      title: "Public Verification",
      description: "Anyone can verify transplant authenticity using transaction hashes in our public verification portal.",
      color: "success",
    },
    {
      icon: Database,
      title: "Admin Oversight",
      description: "Government health authorities can audit the entire process and generate tamper-proof certificates.",
      color: "warning",
    },
  ];

  const roleCards = [
    {
      title: "For Patients",
      description: "Register for organ requests and track your journey",
      icon: Users,
      benefits: ["Real-time status updates", "Verified medical matching", "Transparent allocation process"],
      action: "Register as Patient"
    },
    {
      title: "For Donors",
      description: "Make a difference by registering as an organ donor",
      icon: Heart,
      benefits: ["Track donation impact", "Blockchain certificates", "Privacy protection"],
      action: "Become a Donor"
    },
    {
      title: "For Healthcare",
      description: "Medical professionals managing the transplant process",
      icon: Stethoscope,
      benefits: ["Patient verification tools", "Medical status updates", "Secure data management"],
      action: "Healthcare Login"
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Comprehensive Transplant Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our platform serves every stakeholder in the organ transplant ecosystem with 
            specialized tools and blockchain-verified transparency.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-card hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role-based Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roleCards.map((role, index) => (
            <Card key={index} className="border-none shadow-card hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <role.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold">{role.title}</CardTitle>
                <CardDescription className="text-base">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3 mb-6">
                  {role.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <FileCheck className="w-4 h-4 text-success mr-3" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button variant="medical" className="w-full">
                  {role.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;