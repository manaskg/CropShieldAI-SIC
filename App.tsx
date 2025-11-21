
import React, { useState } from 'react';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Detect from './pages/Detect';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

export type Page = 'home' | 'detect' | 'login' | 'signup' | 'profile';

function AppContent() {
  const [page, setPage] = useState<Page>('home');

  const renderPage = () => {
    switch(page) {
      case 'detect': return <Detect />;
      case 'login': return <Login onNavigate={setPage} />;
      case 'signup': return <SignUp onNavigate={setPage} />;
      case 'profile': return <Profile onNavigate={setPage} />;
      case 'home':
      default: 
        return <Home onNavigate={setPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar onNavigate={setPage} currentPage={page} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
