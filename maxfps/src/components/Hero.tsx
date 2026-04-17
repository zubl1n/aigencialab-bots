import { ChevronRight, Zap } from 'lucide-react';
import './Hero.css';

interface HeroProps {
  onOpenContact: () => void;
}

const Hero = ({ onOpenContact }: HeroProps) => {
  return (
    <section className="hero">
      <div className="glow-effect" style={{top: '10%', left: '20%'}}></div>
      <div className="glow-effect" style={{bottom: '10%', right: '20%', background: 'radial-gradient(circle, rgba(255,0,229,0.15) 0%, rgba(9,11,16,0) 70%)'}}></div>
      
      <div className="container hero-content">
        <div className="hero-badge animate-fade-up">
          <Zap size={16} color="var(--neon-green)" />
          <span>MAX PERFORMANCE WEB & GAMING</span>
        </div>
        
        <h1 className="hero-title animate-fade-up" style={{animationDelay: '0.1s'}}>
          MAXIMIZA TU <br />
          <span className="text-gradient">PRESENCIA DIGITAL</span>
        </h1>
        
        <p className="hero-subtitle animate-fade-up" style={{animationDelay: '0.2s'}}>
          Desarrollo web de élite para empresas, marcas y proyectos de alta conversión. 
          Alcanza el máximo rendimiento con nuestras Landing Pages y E-Commerce.
        </p>
        
        <div className="hero-cta animate-fade-up" style={{animationDelay: '0.3s'}}>
          <button className="btn-primary" onClick={onOpenContact}>
            Cotizar Proyecto <ChevronRight size={20} />
          </button>
          <a href="#services" className="btn-neon">
            Nuestros Servicios
          </a>
        </div>
        
        <div className="hero-stats animate-fade-up" style={{animationDelay: '0.4s'}}>
          <div className="stat-item">
            <span className="stat-number">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">&lt;1s</span>
            <span className="stat-label">Carga Inicial</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">MAX</span>
            <span className="stat-label">Rendimiento SEO</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
