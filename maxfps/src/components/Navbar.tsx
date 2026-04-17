import { useState, useEffect } from 'react';
import { Menu, X, Terminal } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  onOpenContact: () => void;
}

const Navbar = ({ onOpenContact }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <div className="logo cursor-pointer">
          <Terminal size={32} color="var(--neon-green)" />
          <span className="logo-text">MAX<span className="text-gradient">FPS</span></span>
          <span className="logo-domain">.CL</span>
        </div>

        <ul className="nav-links desktop-only">
          <li><a href="#services" className="nav-link">Servicios</a></li>
          <li><a href="#community" className="nav-link">Comunidad</a></li>
        </ul>

        <div className="nav-actions desktop-only">
          <button className="btn-neon" onClick={onOpenContact}>Iniciar Proyecto</button>
        </div>

        <button className="mobile-toggle mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <ul>
            <li><a href="#services" onClick={() => setMobileMenuOpen(false)}>Servicios</a></li>
            <li><a href="#community" onClick={() => setMobileMenuOpen(false)}>Comunidad</a></li>
            <li>
              <button 
                className="btn-neon" 
                style={{marginTop: '20px', width: '100%', justifyContent: 'center'}}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContact();
                }}
              >
                Iniciar Proyecto
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
