import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Calendar, Type, AlignLeft, Trash2 } from 'lucide-react';

interface AddBubbleModalProps {
  onClose: () => void;
  onAdd: (files: File[], metadata: { name: string; date: string; description: string }) => void;
}

export const AddBubbleModal: React.FC<AddBubbleModalProps> = ({ onClose, onAdd }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      // Créer des aperçus
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Libérer l'URL de l'aperçu
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      return;
    }
    
    setUploading(true);
    await onAdd(selectedFiles, { name, date, description });
    setUploading(false);
    
    // Nettoyer les URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
        overflowY: 'auto'
      }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0B1229',
          width: '100%',
          maxWidth: '600px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          margin: '20px 0'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontFamily: 'Playfair Display, serif',
            color: 'white'
          }}>
            Ajouter des souvenirs
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Zone d'upload */}
          <div>
            <label htmlFor="file-upload" style={{
              display: 'block',
              border: '2px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              color: '#9ca3af',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <input 
                id="file-upload"
                type="file" 
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Upload size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
              <span style={{ fontSize: '0.875rem', display: 'block', marginBottom: '8px' }}>
                {selectedFiles.length === 0 
                  ? 'Cliquez pour sélectionner des photos/vidéos'
                  : `${selectedFiles.length} fichier(s) sélectionné(s)`
                }
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                JPG, PNG, GIF, MP4, MOV, AVI (max 50MB)
              </span>
            </label>
          </div>

          {/* Aperçu des fichiers */}
          {selectedFiles.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '12px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto'
            }} className="custom-scrollbar">
              {selectedFiles.map((file, index) => (
                <div key={index} style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'rgba(0, 0, 0, 0.3)'
                }}>
                  {file.type.startsWith('image/') ? (
                    <img 
                      src={previewUrls[index]} 
                      alt={file.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                      fontSize: '0.75rem'
                    }}>
                      Vidéo
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Champ Titre */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#93c5fd',
              fontSize: '0.875rem',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              <Type size={16} />
              Titre du souvenir
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vacances à Paris, Anniversaire de Marie..."
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Champ Date */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#93c5fd',
              fontSize: '0.875rem',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              <Calendar size={16} />
              Date
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                colorScheme: 'dark'
              }}
            />
          </div>

          {/* Champ Description */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#93c5fd',
              fontSize: '0.875rem',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              <AlignLeft size={16} />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Partagez les détails de ce moment précieux..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button 
            type="submit"
            disabled={uploading || selectedFiles.length === 0}
            style={{
              width: '100%',
              background: uploading || selectedFiles.length === 0 
                ? '#4b5563' 
                : 'linear-gradient(to right, #2563eb, #4f46e5)',
              color: 'white',
              fontWeight: '600',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              cursor: uploading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
          >
            {uploading ? 'Upload en cours...' : 'Ajouter à l\'océan'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};