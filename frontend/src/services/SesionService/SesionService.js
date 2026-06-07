import axiosInstance from "../axiosInstance";

const API_URL = "/Sesion";


export const SesionService = {


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
      
      
      if (errorMessage.includes("Ya existe una sesión")) {
           return { success: false, message: errorMessage, alreadyExists: true };
      }
      return { success: false, message: errorMessage };
    }
  },



  /**
   * 
   * @param {number} id 
   * @param {object} sesionData 
   */
  actualizarSesion: async (id, sesionData) => {
    try {

        const dto = {
        asistencia: sesionData.asistencia,
        notas: sesionData.notas,
      };
      const { data } = await axiosInstance.put(`${API_URL}/${id}`, dto);
    return { success: true, data };
    } catch (error) {
      console.error("Error al actualizar la sesión:", error);
      throw error;
    }
  },

  /**
   * @param {number} id
   */
  eliminarSesion: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error al eliminar la sesión:", error);
      throw error;
    }
  },

  getSesionesPaginadas: async (pacienteId, params) => {
    try {
      
      const { data } = await axiosInstance.get(`/Sesion/paciente/${pacienteId}`, { params });
      return data;
    } catch (error) {
      console.error("Error al obtener sesiones paginadas:", error);
      throw error;
    }
  },

};