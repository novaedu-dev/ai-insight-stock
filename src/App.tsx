import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { ThemeAnalysis } from '@/pages/ThemeAnalysis';
import { StockDetail } from '@/pages/StockDetail';
import { MarketOverview } from '@/pages/MarketOverview';
import { PolicyPredictions } from '@/pages/PolicyPredictions';
import { AIAgent } from '@/pages/AIAgent';

export default function App() {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/themes" element={<ThemeAnalysis />} />
          <Route path="/stock/:ticker" element={<StockDetail />} />
          <Route path="/market" element={<MarketOverview />} />
          <Route path="/policy" element={<PolicyPredictions />} />
          <Route path="/ai-agent" element={<AIAgent />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
