import { Terminal } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">
              <Terminal size={32} color="var(--neon-green)" />
              <span className="logo-text">MAX<span className="text-gradient">FPS</span></span>
              <span className="logo-domain">.CL</span>
            </div>
            <p className="footer-desc">
              Llevando el desarrollo web y la comunidad gamer al máximo nivel de rendimiento en Chile y toda Latinoamérica.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon">IG</a>
              <a href="#" className="social-icon">TW</a>
              <a href="#" className="social-icon">IN</a>
              <a href="#" className="social-icon">GH</a>
            </div>
          </div>
          
          <div className="footer-links">
            <h4>Servicios</h4>
            <ul>
              <li><a href="#">Landing Pages</a></li>
              <li><a href="#">E-Commerce</a></li>
              <li><a href="#">Desarrollo a Medida</a></li>
              <li><a href="#">Optimización WPO</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>Comunidad</h4>
            <ul>
              <li><a href="#">Discord Server</a></li>
              <li><a href="#">Reglas de la Comunidad</a></li>
              <li><a href="#">Próximos Torneos</a></li>
              <li><a href="#">Hall of Fame</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contacto</h4>
            <ul>
              <li>hello@maxfps.cl</li>
              <li>Santiago, Chile</li>
              <li>(+56) 9 1234 5678</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MaxFPS.CL. Todos los derechos reservados.</p>
          <div className="legal-links">
            <a href="#">Privacidad</a>
            <a href="#">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
