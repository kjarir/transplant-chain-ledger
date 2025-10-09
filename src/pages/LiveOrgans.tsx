import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LiveOrgansDashboard from "@/components/LiveOrgansDashboard";

const LiveOrgans = () => {
  useEffect(() => {
    document.title = "Live Organs - TransplantChain";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <LiveOrgansDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default LiveOrgans;
