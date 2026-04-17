import { useState } from 'react';
import { X, Send } from 'lucide-react';
import './ContactModal.css';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    details: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // In Vercel, requests to /api/contact are routed to the api folder
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || data.error || 'Server error');
      }
      
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setFormData({ name: '', company: '', email: '', phone: '', details: '' });
      }, 3000);
      
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error occurred');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-up">
        <button className="close-btn" onClick={onClose}>
          <X size={24} color="#fff" />
        </button>
        
        <h2 className="heading-cyber text-center mb-6">
          INICIAR <span className="text-gradient">PROYECTO</span>
        </h2>
        
        {status === 'success' ? (
          <div className="success-message text-center">
            <h3 style={{color: 'var(--neon-green)', marginBottom: '16px'}}>¡Solicitud enviada!</h3>
            <p style={{color: 'var(--text-muted)'}}>Hemos recibido tu mensaje de cotización, en breve el equipo de ingeniería se pondrá en contacto al correo o teléfono provisto.</p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre y Apellido *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Ej. John Doe" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="ejemplo@empresa.com" />
              </div>
              <div className="form-group">
                <label>Teléfono o WhatsApp *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+56 9 1234 5678" />
              </div>
            </div>
            
            <div className="form-group">
              <label>Empresa / Organización</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Opcional" />
            </div>
            
            <div className="form-group">
              <label>Detalles del Proyecto *</label>
              <textarea name="details" required value={formData.details} onChange={handleChange} placeholder="Descríbenos brevemente qué necesitas (Landing Page interactiva, Tienda, SEO, etc.)" rows={4}></textarea>
            </div>
            
            {status === 'error' && (
              <div className="error-message">Error: {errorMsg}</div>
            )}
            
            <button type="submit" className="btn-primary w-full justify-center" disabled={status === 'loading'}>
              {status === 'loading' ? 'ENVIANDO...' : <><Send size={18} /> ENVIAR COTIZACIÓN</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
