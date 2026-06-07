import axiosInstance from './axiosInstance';

export const sesionService = {


  /**
   
   * @param {number} turnoId 
   * @param {string} asistencia 
   * @returns {Promise<object>} 
   */
  registrarAsistencia: async (turnoId, asistencia) => {
    try {
     
      const dto = { turnoId, asistencia };
      
     
      const { data } = await axiosInstance.post('/Sesion/registrar-asistencia', dto); 
      
      return { success: true, data };
    } catch (error) {
      console.error("Error al registrar asistencia:", error);
      const errorMessage = error.response?.data?.error 
                         || error.response?.data?.title 
                         || error.response?.data?.message 
                         || "No se pudo registrar la asistencia.";
      
      
      if (errorMessage.includes("Ya existe una sesion")) {
           return { success: false, message: errorMessage, alreadyExists: true };
      }
      return { success: false, message: errorMessage };
    }
  },


 actualizarSesion: async (id, sesionData) => {
    
    try {
      const { data } = await axiosInstance.put(`/Sesion/${id}`, sesionData);
      return { success: true, data };
    } catch (error) {
      console.error("Error actualizando sesion:", error);
      return { success: false, message: "Error al guardar notas." };
    }
  },

};