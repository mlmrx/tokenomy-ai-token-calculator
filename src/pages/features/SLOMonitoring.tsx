import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SLODashboard } from "@/components/enterprise/SLODashboard";

const SLOMonitoring = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <SLODashboard />
      </main>
      <Footer />
    </div>
  );
};

export default SLOMonitoring;
