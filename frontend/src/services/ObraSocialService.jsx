import axiosInstance  from './axiosInstance';

export const obraSocialService = {
 
  getObrasSociales: async () => {
    try {
      
      const { data } = await axiosInstance.get('/ObraSocial');
     
      return data.map(os => ({
        ...os, 
        value: os.id, 
        label: os.nombre, 
      })) || [];
    } catch (error) {
      console.error("Error al obtener obras sociales:", error);
      return [];
    }
  },

  getPrecio: async (obraSocialId) => {
    try {
     
      const { data } = await axiosInstance.get(`/ObraSocial/${obraSocialId}/precio`);
      return data.precio; 
    } catch (error) {
      console.error("Error al obtener precio:", error);
      return 0;
    }
  },


createObraSocial: async (obraSocialData) => {
    
    try {
      const { data } = await axiosInstance.post('/ObraSocial', obraSocialData);
      return { success: true, data };
    } catch (error) {
      console.error("Error al crear obra social:", error);
      return { success: false, message: error.response?.data?.error || "Error al crear." };
    }
  },


  updateObraSocial: async (id, obraSocialData) => {
   
    try {
      const { data } = await axiosInstance.put(`/ObraSocial/${id}`, obraSocialData);
      return { success: true, data };
    } catch (error) {
      console.error("Error al actualizar obra social:", error);
      return { success: false, message: error.response?.data?.error || "Error al actualizar." };
    }
  },


  deleteObraSocial: async (id) => {
    try {
      await axiosInstance.delete(`/ObraSocial/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error al eliminar obra social:", error);
      return { success: false, message: error.response?.data?.error || "Error al eliminar." };
    }
  },

  getObrasSocialesActivas : async () => {
    try {
     
      const { data } = await axiosInstance.get('ObraSocial/activas'); 
      return data.map(os => ({
        ...os,
        value: os.id,
        label: os.nombre,
      })) || [];
    } catch (error) {
      console.error("Error al obtener obras sociales ACTIVAS:", error);
      return [];
    }
},



};


