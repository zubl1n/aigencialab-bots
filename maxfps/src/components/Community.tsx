import { Gamepad2, Users, Trophy } from 'lucide-react';
import './Community.css';

const Community = () => {
  return (
    <section id="community" className="community section-padding">
      <div className="container">
        <div className="community-wrapper glass-panel">
          <div className="community-content">
            <h2 className="heading-cyber animate-fade-up">
              LA <span className="text-gradient-pink">COMUNIDAD</span> DEFINITIVA
            </h2>
            <p className="community-desc animate-fade-up">
              MaxFPS no es solo código y servidores. Somos una comunidad de gamers apasionados. 
              Únete a nuestros torneos, encuentra tu squad, y comparte la misma pasión por el rendimiento absoluto.
            </p>
            
            <div className="community-features animate-fade-up">
              <div className="feature">
                <Gamepad2 size={24} color="var(--cyber-pink)" />
                <span>Torneos Exclusivos</span>
              </div>
              <div className="feature">
                <Users size={24} color="var(--neon-blue)" />
                <span>Encuentra tu Squad</span>
              </div>
              <div className="feature">
                <Trophy size={24} color="#FFD700" />
                <span>Premios y Sorteos</span>
              </div>
            </div>

            <button className="btn-discord animate-fade-up">
              ÚNETE A NUESTRO DISCORD
            </button>
          </div>
          
          <div className="community-visual animate-fade-up">
            <div className="cyber-circle">
              <div className="inner-circle"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
