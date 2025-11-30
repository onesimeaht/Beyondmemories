import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Image as ImageIcon, Heart, Share2, Trash2, Plus, MapPin, FileText, Upload, Edit2 } from 'lucide-react';
import { BubbleData, TimelineEvent } from '../types';
import { api } from '../api';

interface MemorialOverlayProps {
  data: BubbleData;
  onClose: () => void;
  onDelete?: () => void;
}

export const MemorialOverlay: React.FC<MemorialOverlayProps> = ({ data, onClose, onDelete }) => {
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [gallery, setGallery] = useState(data.gallery);
  const [timeline, setTimeline] = useState(data.timeline);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    date: '',
    title: '',
    description: '',
    images: [] as File[]
  });

  useEffect(() => {
    loadGallery();
  }, [data.id]);

  const loadGallery = async () => {
    try {
      const memoryId = parseInt(data.id);
      const response = await api.getMemoryGallery(memoryId);
      
      if (response.success) {
        const galleryItems = response.gallery.map(photo => ({
          id: photo.id.toString(),
          url: photo.url,
          type: photo.type,
          caption: photo.name || '',
          date: photo.taken_at
        }));
        setGallery(galleryItems);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la galerie:', error);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingGallery(true);
    const files = Array.from(e.target.files);
    
    try {
      const memoryId = parseInt(data.id);
      const response = await api.addPhotosToGallery(memoryId, files);
      
      if (response.success) {
        await loadGallery();
      } else {
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.date || !newEvent.title) {
      return;
    }

    if (editingEvent) {
      // Mode édition
      setTimeline(timeline.map(event => 
        event.id === editingEvent
          ? {
              ...event,
              date: newEvent.date,
              title: newEvent.title,
              description: newEvent.description,
              images: newEvent.images.length > 0 
                ? newEvent.images.map((file, idx) => ({
                    id: `${Date.now()}-${idx}`,
                    url: URL.createObjectURL(file),
                    type: 'image' as const,
                    caption: file.name
                  }))
                : event.images
            }
          : event
      ).sort((a, b) => a.date.localeCompare(b.date)));
      setEditingEvent(null);
    } else {
      // Mode ajout
      const event: TimelineEvent = {
        id: Date.now().toString(),
        date: newEvent.date,
        title: newEvent.title,
        description: newEvent.description,
        images: newEvent.images.map((file, idx) => ({
          id: `${Date.now()}-${idx}`,
          url: URL.createObjectURL(file),
          type: 'image' as const,
          caption: file.name
        }))
      };
      setTimeline([...timeline, event].sort((a, b) => a.date.localeCompare(b.date)));
    }

    setNewEvent({ date: '', title: '', description: '', images: [] });
    setShowAddEvent(false);
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setNewEvent({
      date: event.date,
      title: event.title,
      description: event.description,
      images: []
    });
    setEditingEvent(event.id);
    setShowAddEvent(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window) {
      setTimeline(timeline.filter(e => e.id !== eventId));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewEvent({ ...newEvent, images: Array.from(e.target.files) });
    }
  };

  const handleCancelEdit = () => {
    setShowAddEvent(false);
    setEditingEvent(null);
    setNewEvent({ date: '', title: '', description: '', images: [] });
  };

  return (
    <>
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
          padding: '0'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#0B1229',
            width: '100%',
            height: '100%',
            maxWidth: '1400px',
            maxHeight: '90vh',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'row',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          
          {/* Boutons en haut à droite - Z-INDEX ÉLEVÉ */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 1000,
            display: 'flex',
            gap: '8px'
          }}>
            {onDelete && (
              <button 
                onClick={onDelete}
                style={{
                  padding: '12px',
                  borderRadius: '9999px',
                  background: 'rgba(239, 68, 68, 0.8)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)';
                }}
              >
                <Trash2 size={20} />
              </button>
            )}
            <button 
              onClick={onClose}
              style={{
                padding: '12px',
                borderRadius: '9999px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Colonne gauche - Image et bio */}
          <div style={{
            width: '40%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(5, 10, 24, 0.5)'
          }}>
            
            <div style={{ position: 'relative', height: '60%' }}>
              <img 
                src={data.mainImage} 
                alt={data.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #050A18, transparent)'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px'
              }}>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontFamily: 'Playfair Display, serif',
                  color: 'white',
                  marginBottom: '8px'
                }}>
                  {data.name}
                </h2>
                <p style={{
                  color: '#93c5fd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Calendar size={16} />
                  {data.birthDate} {data.deathDate && `- ${data.deathDate}`}
                </p>
              </div>
            </div>
            
            <div style={{
              padding: '24px',
              color: 'white',
              overflowY: 'auto',
              height: '40%'
            }} className="custom-scrollbar">
              <h3 style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#60a5fa',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                À propos
              </h3>
              
              <p style={{
                color: '#d1d5db',
                fontSize: '0.95rem',
                lineHeight: '1.7',
                marginBottom: '16px'
              }}>
                {data.fullBio}
              </p>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}>
                  <Heart size={16} /> Hommage
                </button>
                <button style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}>
                  <Share2 size={16} /> Partager
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite - Timeline et Galerie */}
          <div style={{
            width: '60%',
            overflowY: 'auto',
            padding: '40px',
            paddingTop: '80px',
            background: '#0B1229'
          }} className="custom-scrollbar">
            
            {/* Timeline */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontFamily: 'Playfair Display, serif',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: 0
                }}>
                  <span style={{
                    width: '32px',
                    height: '1px',
                    background: '#60a5fa'
                  }} />
                  Parcours de vie
                </h3>
                
                <button
                  onClick={() => {
                    if (showAddEvent && !editingEvent) {
                      handleCancelEdit();
                    } else {
                      setShowAddEvent(!showAddEvent);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: showAddEvent ? '#4b5563' : '#2563eb',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: 'none',
                    transition: 'all 0.3s'
                  }}
                >
                  <Plus size={16} />
                  {showAddEvent && !editingEvent ? 'Annuler' : (editingEvent ? 'Modifier' : 'Ajouter un événement')}
                </button>
              </div>

              {/* Formulaire d'ajout/édition d'événement */}
              {showAddEvent && (
                <div style={{
                  background: editingEvent ? 'rgba(245, 158, 11, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                  border: `1px solid ${editingEvent ? 'rgba(245, 158, 11, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      {editingEvent ? '✏️ Modifier l\'événement' : '➕ Nouvel événement'}
                    </h4>
                    {editingEvent && (
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '4px 12px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Annuler
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
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
                        <MapPin size={16} />
                        Titre de l'événement
                      </label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Ex: Naissance, Mariage, Diplôme..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>

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
                        <FileText size={16} />
                        Description (optionnel)
                      </label>
                      <textarea
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Détails de cet événement..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px',
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

                    <div>
                      <label htmlFor="event-images" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#93c5fd',
                        fontSize: '0.875rem',
                        marginBottom: '8px',
                        fontWeight: '600'
                      }}>
                        <Upload size={16} />
                        Photos (optionnel)
                      </label>
                      <label htmlFor="event-images" style={{
                        display: 'block',
                        padding: '20px',
                        border: '2px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.02)',
                        color: '#9ca3af',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s'
                      }}>
                        <input
                          id="event-images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          style={{ display: 'none' }}
                        />
                        {newEvent.images.length > 0 
                          ? `${newEvent.images.length} image(s) sélectionnée(s)`
                          : 'Cliquez pour ajouter des photos'
                        }
                      </label>
                    </div>

                    <button
                      onClick={handleAddEvent}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: editingEvent 
                          ? 'linear-gradient(to right, #f59e0b, #d97706)'
                          : 'linear-gradient(to right, #2563eb, #4f46e5)',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        border: 'none',
                        transition: 'all 0.3s'
                      }}
                    >
                      {editingEvent ? '✓ Enregistrer les modifications' : '✓ Ajouter l\'événement'}
                    </button>
                  </div>
                </div>
              )}
              
              <div style={{
                position: 'relative',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                marginLeft: '12px',
                paddingLeft: '32px'
              }}>
                {timeline.length > 0 ? timeline.map((event) => (
                  <div key={event.id} style={{
                    position: 'relative',
                    marginBottom: '32px'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: '-37px',
                      top: '8px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '9999px',
                      background: '#3b82f6',
                      border: '4px solid #0B1229',
                      zIndex: 1
                    }} />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          color: '#60a5fa',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          display: 'block',
                          marginBottom: '4px'
                        }}>
                          {event.date}
                        </span>
                        <h4 style={{
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '1.125rem',
                          marginBottom: '4px'
                        }}>
                          {event.title}
                        </h4>
                        <p style={{
                          color: '#9ca3af',
                          fontSize: '0.875rem'
                        }}>
                          {event.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEditEvent(event)}
                          style={{
                            padding: '6px',
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          style={{
                            padding: '6px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Images de l'événement */}
                    {event.images && event.images.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: '8px',
                        marginTop: '12px'
                      }}>
                        {event.images.map((img) => (
                          <div
                            key={img.id}
                            onClick={() => setSelectedImage(img.url)}
                            style={{
                              aspectRatio: '1',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'transform 0.3s',
                              border: '2px solid rgba(96, 165, 250, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <img
                              src={img.url}
                              alt={img.caption}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )) : (
                  <p style={{
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    Aucun événement marquant ajouté pour l'instant.
                  </p>
                )}
              </div>
            </div>

            {/* Galerie séparée */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontFamily: 'Playfair Display, serif',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: 0
                }}>
                  <span style={{
                    width: '32px',
                    height: '1px',
                    background: '#60a5fa'
                  }} />
                  Galerie Souvenirs ({gallery.length})
                </h3>
                
                <label htmlFor="gallery-upload" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: uploadingGallery ? '#4b5563' : '#2563eb',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: uploadingGallery ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  opacity: uploadingGallery ? 0.7 : 1,
                  transition: 'all 0.3s'
                }}>
                  <input 
                    id="gallery-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    style={{ display: 'none' }}
                  />
                  <Plus size={16} />
                  {uploadingGallery ? 'Upload...' : 'Ajouter des photos'}
                </label>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                {gallery.length > 0 ? gallery.map((media) => (
                  <div key={media.id} style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.05)',
                    transition: 'transform 0.3s'
                  }}
                  onClick={() => setSelectedImage(media.url)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  >
                    <img 
                      src={media.url} 
                      alt={media.caption}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit:'cover'
                      }}
                    />
                  </div>
                )) : (
                  <div style={{
                    gridColumn: '1 / -1',
                    padding: '32px',
                    textAlign: 'center',
                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px'
                  }}>
                    <ImageIcon style={{
                      margin: '0 auto 8px',
                      color: '#6b7280'
                    }} size={32} />
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      marginBottom: '8px'
                    }}>
                      La galerie est vide.
                    </p>
                    <p style={{
                      color: '#4b5563',
                      fontSize: '0.75rem'
                    }}>
                      Cliquez sur "Ajouter des photos" pour importer
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal d'agrandissement d'image */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 300,
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px'
            }}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedImage}
              alt="Agrandissement"
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '12px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
