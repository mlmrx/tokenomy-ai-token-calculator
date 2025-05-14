
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize the app with the root element
createRoot(document.getElementById("root")!).render(<App />);

// Enable better error reporting during development
if (import.meta.env.DEV) {
  console.log(
    '%cToken Calculator App',
    'font-weight: bold; font-size: 16px; color: #10b981;',
    'Initializing application...'
  );
}
