import axiosInstance from './axiosInstance';

export const ausenciaService = {
  
  
  getAusencias: async () => {
    try {
      const { data } = await axiosInstance.get('/usuario/me/ausencias');
      return data || [];
    } catch (error) {
      console.error("Error al obtener ausencias:", error);
      return [];
    }
  },

  
  crearAusencia: async (ausenciaData) => {
    
    try {
      const { data } = await axiosInstance.post('/usuario/me/ausencias', ausenciaData);
      return { success: true, data };
    } catch (error) {
      console.error("Error al crear ausencia:", error);
      return { 
          success: false, 
          message: error.response?.data?.message || error.response?.data?.error || "Error al registrar ausencia." 
      };
    }
  },

  
  eliminarAusencia: async (id) => {
    try {
      await axiosInstance.delete(`/usuario/me/ausencias/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error al eliminar ausencia:", error);
      return { success: false, message: "Error al eliminar." };
    }
  }
};