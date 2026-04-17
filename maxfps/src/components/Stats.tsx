import './Stats.css';

const Stats = () => {
  return (
    <section className="stats section-padding">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-box animate-fade-up">
            <h3 className="stat-value text-gradient">200+</h3>
            <p className="stat-text">Proyectos Entregados</p>
          </div>
          <div className="stat-box animate-fade-up" style={{animationDelay: '0.1s'}}>
            <h3 className="stat-value text-gradient">99%</h3>
            <p className="stat-text">Satisfacción de Clientes</p>
          </div>
          <div className="stat-box animate-fade-up" style={{animationDelay: '0.2s'}}>
            <h3 className="stat-value text-gradient">5K+</h3>
            <p className="stat-text">Gamers en Comunidad</p>
          </div>
          <div className="stat-box animate-fade-up" style={{animationDelay: '0.3s'}}>
            <h3 className="stat-value text-gradient">24/7</h3>
            <p className="stat-text">Soporte Continuo</p>
          </div>
        </div>
        
        <div className="cta-banner glass-panel animate-fade-up">
          <h2>¿Listo para subir de nivel?</h2>
          <p>Escríbenos y comencemos a desarrollar el pilar digital de tu negocio hoy mismo.</p>
          <button className="btn-primary">INICIAR CONTACTO</button>
        </div>
      </div>
    </section>
  );
};

export default Stats;
