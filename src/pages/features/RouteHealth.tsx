import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RouteHealthMonitor } from "@/components/enterprise/RouteHealthMonitor";

const RouteHealth = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <RouteHealthMonitor />
      </main>
      <Footer />
    </div>
  );
};

export default RouteHealth;
