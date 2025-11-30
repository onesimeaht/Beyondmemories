const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface Memory {
  id: number;
  url: string;
  type: 'image' | 'video';
  taken_at: string;
  is_featured: boolean;
  name?: string;
  description?: string;
}

export interface Parcel {
  id: number;
  name: string;
  template_id: number;
  share_uuid: string;
  share_url: string;
  created_at?: string;
}

export interface TimelineMemory {
  id: number;
  url: string;
  type: 'image' | 'video';
  taken_at: string;
}

class API {
  // Upload de fichiers
  async uploadMemories(
    files: File[], 
    takenAt?: string,
    name?: string,
    description?: string
  ): Promise<{ success: boolean; message: string; memories: Memory[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files[]', file));
    
    if (takenAt) formData.append('taken_at', takenAt);
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);

    try {
      console.log('📤 Envoi vers:', `${API_BASE_URL}/upload`);
      console.log('📦 Données:', {
        filesCount: files.length,
        takenAt,
        name,
        description
      });
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      
      console.log('📡 Statut réponse:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Données reçues:', data);
      return data;
    } catch (error) {
      console.error('💥 Erreur upload:', error);
      throw error;
    }
  }

  // Ajouter des photos à la galerie d'un souvenir existant
  async addPhotosToGallery(memoryId: number, files: File[]): Promise<{ success: boolean; message: string; photos: Memory[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files[]', file));
    formData.append('memory_id', memoryId.toString());

    try {
      console.log('📸 Ajout de photos à la galerie du souvenir ID:', memoryId);
      
      const response = await fetch(`${API_BASE_URL}/memories/${memoryId}/gallery`, {
        method: 'POST',
        body: formData
      });
      
      console.log('📡 Statut réponse:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Photos ajoutées:', data);
      return data;
    } catch (error) {
      console.error('💥 Erreur addPhotosToGallery:', error);
      throw error;
    }
  }

  // Récupérer la galerie d'un souvenir
  async getMemoryGallery(memoryId: number): Promise<{ success: boolean; gallery: Memory[] }> {
    try {
      console.log('🖼️ Récupération de la galerie du souvenir ID:', memoryId);
      
      const response = await fetch(`${API_BASE_URL}/memories/${memoryId}/gallery`);
      
      console.log('📡 Statut réponse:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Galerie récupérée:', data);
      return data;
    } catch (error) {
      console.error('💥 Erreur getMemoryGallery:', error);
      throw error;
    }
  }

  // Récupérer tous les souvenirs
  async getMemories(): Promise<{ success: boolean; memories: Memory[] }> {
    try {
      console.log('📥 Récupération des souvenirs depuis:', `${API_BASE_URL}/memories`);
      
      const response = await fetch(`${API_BASE_URL}/memories`);
      
      console.log('📡 Statut réponse:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Souvenirs récupérés:', data.memories?.length || 0);
      console.log('📸 URLs des images:', data.memories?.map((m: Memory) => m.url));
      return data;
    } catch (error) {
      console.error('💥 Erreur getMemories:', error);
      throw error;
    }
  }

  // Marquer/démarquer comme featured
  async toggleFeatured(id: number): Promise<{ success: boolean; memory: Memory }> {
    try {
      console.log('⭐ Toggle featured pour ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/memories/${id}/feature`, {
        method: 'POST'
      });
      
      console.log('📡 Statut réponse:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Featured toggleé:', data);
      return data;
    } catch (error) {
      console.error('💥 Erreur toggleFeatured:', error);
      throw error;
    }
  }

  // Supprimer un souvenir
  async deleteMemory(id: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ Suppression de la mémoire ID:', id);
      console.log('🔗 URL:', `${API_BASE_URL}/memories/${id}`);
      
      const response = await fetch(`${API_BASE_URL}/memories/${id}`, {
        method: 'DELETE'
      });
      
      console.log('📡 Statut réponse:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur (texte brut):', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Erreur serveur (JSON):', errorJson);
        } catch (e) {
          console.error('❌ Impossible de parser l\'erreur en JSON');
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Suppression réussie:', data);
      return data;
    } catch (error) {
      console.error('💥 Erreur deleteMemory:', error);
      throw error;
    }
  }

  // Récupérer la timeline
  async getTimeline(): Promise<{ success: boolean; timeline: TimelineMemory[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/timeline`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('💥 Erreur getTimeline:', error);
      throw error;
    }
  }

  // Générer automatiquement la timeline
  async generateTimeline(): Promise<{ success: boolean; message: string; timeline: TimelineMemory[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-timeline`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('💥 Erreur generateTimeline:', error);
      throw error;
    }
  }

  // Créer une parcelle
  async createParcel(templateId: number, name?: string): Promise<{ success: boolean; message: string; parcel: Parcel }> {
    try {
      const response = await fetch(`${API_BASE_URL}/parcel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId, name })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('💥 Erreur createParcel:', error);
      throw error;
    }
  }

  // Récupérer une parcelle par UUID
  async getParcel(uuid: string): Promise<{ success: boolean; parcel: Parcel; memories: Memory[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/parcel/${uuid}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('💥 Erreur getParcel:', error);
      throw error;
    }
  }

  // Lister toutes les parcelles
  async getParcels(): Promise<{ success: boolean; parcels: Parcel[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/parcels`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('💥 Erreur getParcels:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('💥 Erreur healthCheck:', error);
      throw error;
    }
  }
}

export const api = new API();