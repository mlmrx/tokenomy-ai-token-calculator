import { GpuGrid } from "../../gpu-monitor/ui/GpuGrid";
import Footer from "@/components/Footer";

const GpuMonitoring = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">GPU Token Throughput Monitor</h1>
        <GpuGrid />
      </main>
      <Footer />
    </div>
  );
};

export default GpuMonitoring;
