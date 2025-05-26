
import React from 'react';
import { ConfigurationManager } from '@/components/ConfigurationManager';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';

const Configuration = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground">
              Please sign in to access the configuration manager.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <ConfigurationManager />
      </main>
      <Footer />
    </div>
  );
};

export default Configuration;
