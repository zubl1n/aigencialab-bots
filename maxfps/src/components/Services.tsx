import { Layout, ShoppingCart, Code2, Rocket } from 'lucide-react';
import './Services.css';

const servicesData = [
  {
    id: 1,
    title: 'Landing Pages',
    description: 'Páginas diseñadas específicamente para marketing y alta conversión. Ideales para campañas, captación de leads y lanzamientos de productos.',
    icon: <Layout size={32} color="var(--neon-green)" />,
    features: ['Carga ultrarrápida', 'Optimización SEO', 'Diseño responsivo']
  },
  {
    id: 2,
    title: 'E-Commerce',
    description: 'Tiendas online robustas y seguras. Vende tus productos 24/7 con sistemas de pago integrados y gestión de inventario.',
    icon: <ShoppingCart size={32} color="var(--neon-blue)" />,
    features: ['Integración de pagos', 'Gestor de productos', 'Alta seguridad']
  },
  {
    id: 3,
    title: 'Soluciones Full-Stack',
    description: 'Sistemas a medida, paneles de administración y aplicaciones web complejas estructuradas para escalar sin límites.',
    icon: <Code2 size={32} color="var(--cyber-pink)" />,
    features: ['Arquitectura moderna', 'Bases de datos', 'APIs personalizadas']
  }
];

const Services = () => {
  return (
    <section id="services" className="services section-padding">
      <div className="container">
        <div className="section-header text-center animate-fade-up">
          <h2 className="heading-cyber">NUESTROS <span className="text-gradient">SERVICIOS</span></h2>
          <p className="section-desc">Tecnología de última generación para asegurar que tu proyecto funcione al máximo nivel.</p>
        </div>

        <div className="services-grid">
          {servicesData.map((service, index) => (
            <div 
              key={service.id} 
              className="service-card glass-panel animate-fade-up"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div className="service-icon-wrapper">
                {service.icon}
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.description}</p>
              
              <ul className="service-features">
                {service.features.map((feature, i) => (
                  <li key={i}>
                    <Rocket size={14} className="feature-icon" color="var(--neon-green)" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
