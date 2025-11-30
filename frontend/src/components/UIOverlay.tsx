import React from 'react';
import { Plus, Search, Menu } from 'lucide-react';

interface UIOverlayProps {
  onAddClick: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ onAddClick }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
      pointerEvents: 'none'
    }}>
      
      {/* HEADER */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px',
        pointerEvents: 'auto',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontFamily: 'Playfair Display, serif', 
              color: 'white',
              fontWeight: '600'
            }}>
              Memory<span style={{ color: '#93c5fd' }}>Bubbles</span>
            </h1>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: '0.75rem', 
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: '4px'
            }}>
              L'Océan Infini des Souvenirs
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              padding: '12px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}>
              <Search size={20} />
            </button>
            <button style={{
              padding: '12px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* BOUTON ADD */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '32px',
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'center',
        background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
      }}>
        <button 
          onClick={onAddClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 32px',
            background: 'white',
            color: '#111827',
            borderRadius: '9999px',
            fontWeight: '700',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            background: '#111827',
            color: 'white',
            borderRadius: '9999px'
          }}>
            <Plus size={16} strokeWidth={3} />
          </div>
          <span>Ajouter un souvenir</span>
        </button>
      </div>
    </div>
  );
};