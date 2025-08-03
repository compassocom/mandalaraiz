import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { DreamPage } from './pages/DreamPage';
import { CreateDreamPage } from './pages/CreateDreamPage';
import { DashboardPage } from './pages/DashboardPage';
import { CollectiveCareAgreementPage } from './pages/CollectiveCareAgreementPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { RegenerativeFAQPage } from './pages/RegenerativeFAQPage';
import { DragonPrinciplesPage } from './pages/DragonPrinciplesPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { Footer } from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/create-dream" element={<CreateDreamPage />} />
            <Route path="/dream/:id" element={<DreamPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/agreement" element={<CollectiveCareAgreementPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/faq" element={<RegenerativeFAQPage />} />
            <Route path="/principles" element={<DragonPrinciplesPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
