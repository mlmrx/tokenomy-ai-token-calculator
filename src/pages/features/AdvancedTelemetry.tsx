import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TelemetryDashboard } from "@/components/enterprise/TelemetryDashboard";

const AdvancedTelemetry = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <TelemetryDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default AdvancedTelemetry;
