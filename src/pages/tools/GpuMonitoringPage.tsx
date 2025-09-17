import React from "react";
import { Helmet } from "react-helmet-async";
import GpuMonitoring from "../GpuMonitoring";

const GpuMonitoringPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "GPU Throughput Monitor",
    "description": "Monitor GPU performance and throughput for AI model training and inference. Real-time GPU monitoring for machine learning workloads.",
    "url": "https://tokenomy.app/tools/gpu-monitoring",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser"
  };

  return (
    <>
      <Helmet>
        <title>GPU Throughput Monitor | AI GPU Performance Monitoring Tool</title>
        <meta name="description" content="Monitor GPU performance and throughput for AI model training and inference. Real-time GPU monitoring dashboard for machine learning and deep learning workloads." />
        <meta name="keywords" content="GPU monitoring, GPU throughput, AI GPU performance, machine learning GPU, NVIDIA monitoring, GPU utilization, AI hardware monitoring, deep learning GPU, GPU metrics, CUDA monitoring" />
        
        <meta property="og:title" content="GPU Throughput Monitor | AI Performance Tool" />
        <meta property="og:description" content="Monitor GPU performance and throughput for AI model training and inference." />
        <meta property="og:url" content="https://tokenomy.app/tools/gpu-monitoring" />
        
        <link rel="canonical" href="https://tokenomy.app/tools/gpu-monitoring" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <main className="min-h-screen">
        <article>
          <header>
            <h1 className="sr-only">GPU Throughput Monitor - AI Performance Monitoring</h1>
          </header>
          <GpuMonitoring />
        </article>
      </main>
    </>
  );
};

export default GpuMonitoringPage;