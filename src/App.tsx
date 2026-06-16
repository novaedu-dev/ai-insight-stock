import { HashRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { ThemeAnalysis } from '@/pages/ThemeAnalysis';
import { StockDetail } from '@/pages/StockDetail';
import { AIAgent } from '@/pages/AIAgent';

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/themes" element={<ThemeAnalysis />} />
        <Route path="/stock/:ticker" element={<StockDetail />} />
        <Route path="/ai-agent" element={<AIAgent />} />
        <Route path="/market" element={<ThemeAnalysis />} />
        <Route path="/settings" element={<ThemeAnalysis />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </HashRouter>
  );
}
