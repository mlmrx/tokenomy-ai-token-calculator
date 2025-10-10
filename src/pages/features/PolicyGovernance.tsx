import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PolicyEditor } from "@/components/enterprise/PolicyEditor";

const PolicyGovernance = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <PolicyEditor />
      </main>
      <Footer />
    </div>
  );
};

export default PolicyGovernance;
