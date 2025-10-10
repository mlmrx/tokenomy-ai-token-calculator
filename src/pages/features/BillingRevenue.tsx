import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BillingPortal } from "@/components/enterprise/BillingPortal";

const BillingRevenue = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <BillingPortal />
      </main>
      <Footer />
    </div>
  );
};

export default BillingRevenue;
