import React, { useState, useEffect } from 'react';
import { OceanScene } from './components/OceanScene';
import { UIOverlay } from './components/UIOverlay';
import { MemorialOverlay } from './components/MemorialOverlay';
import { AddBubbleModal } from './components/AddBubbleModal';
import { BubbleData, BubbleType } from './types';
import { AnimatePresence } from 'framer-motion';
import { api, Memory } from './api';

// Convertir Memory API -> BubbleData
const memoryToBubble = (memory: Memory, index: number): BubbleData => {
  const randomPos = (scale: number): [number, number, number] => [
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale,
  ];

  // Formater la date si elle existe
  let displayDate = '';
  if (memory.taken_at) {
    try {
      const date = new Date(memory.taken_at);
      displayDate = date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      displayDate = memory.taken_at;
    }
  }

  return {
    id: memory.id.toString(),
    name: memory.name || `Souvenir #${memory.id}`,
    type: BubbleType.EVENT,
    mainImage: memory.url,
    birthDate: displayDate,
    shortBio: memory.description || 'Un moment précieux capturé dans le temps...',
    fullBio: memory.description || 'Ce souvenir fait partie de votre histoire personnelle. Chaque instant compte.',
    position: index < 5 ? [
      (index - 2) * 3,
      Math.sin(index) * 2,
      0
    ] : randomPos(25),
    size: memory.is_featured ? 2.5 : 1.5,
    timeline: [],
    gallery: []
  };
};

const App: React.FC = () => {
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const selectedBubble = bubbles.find(b => b.id === selectedBubbleId);

  // Charger les souvenirs depuis l'API
  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const response = await api.getMemories();
      console.log('🔥 Souvenirs chargés:', response);
      
      if (response.success) {
        const bubblesData = response.memories.map((memory, index) => 
          memoryToBubble(memory, index)
        );
        console.log('🎈 Bulles créées:', bubblesData);
        setBubbles(bubblesData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des souvenirs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBubbleClick = (data: BubbleData) => {
    setSelectedBubbleId(data.id);
  };

  const handleCloseMemorial = () => {
    setSelectedBubbleId(null);
  };

  const handleAddBubble = async (
    files: File[], 
    metadata: { name: string; date: string; description: string }
  ) => {
    try {
      console.log('📤 Upload des fichiers avec métadonnées:', {
        filesCount: files.length,
        metadata
      });
      
      const response = await api.uploadMemories(
        files, 
        metadata.date || undefined,
        metadata.name || undefined,
        metadata.description || undefined
      );
      
      console.log('✅ Réponse API:', response);
      
      if (response.success) {
        await loadMemories();
      } else {
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error);
    }
  };

  const handleDeleteBubble = async (id: string) => {

    try {
      const memoryId = parseInt(id);
      console.log('🗑️ Suppression du souvenir ID:', memoryId);
      
      const response = await api.deleteMemory(memoryId);
      console.log('Réponse suppression:', response);
      
      if (response.success) {
        setSelectedBubbleId(null);
        await loadMemories();
      } else {
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050A18',
        color: 'white',
        fontSize: '1.5rem',
        fontFamily: 'Playfair Display, serif'
      }}>
        Chargement de l'océan des souvenirs...
      </div>
    );
  }

  return (
    <>
      <OceanScene 
        bubbles={bubbles} 
        onBubbleClick={handleBubbleClick} 
        selectedId={selectedBubbleId}
      />

      <AnimatePresence>
        {!selectedBubbleId && !isAddModalOpen && (
          <UIOverlay onAddClick={() => setIsAddModalOpen(true)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedBubble && (
          <MemorialOverlay 
            data={selectedBubble} 
            onClose={handleCloseMemorial}
            onDelete={() => handleDeleteBubble(selectedBubble.id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddBubbleModal 
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddBubble}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default App;