import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Community from './components/Community';
import Stats from './components/Stats';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import './App.css';

function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="app-wrapper">
      <Navbar onOpenContact={() => setIsContactOpen(true)} />
      <main>
        <Hero onOpenContact={() => setIsContactOpen(true)} />
        <Services />
        <Community />
        <Stats />
      </main>
      <Footer />
      
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}

export default App;
