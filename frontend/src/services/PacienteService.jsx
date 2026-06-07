
import  axiosInstance  from './axiosInstance';
export const pacienteService = {



  /**
   * 
   * @param {string} query 
   * @returns {Promise<Array>} 
   */
  buscarPacientes: async (query) => {
    if (!query) return [];
    try {
      
      const { data } = await axiosInstance.get(`/Paciente/buscar?query=${query}`);
      
      
      return data.map(paciente => ({
        value: paciente.id, 
        label: `${paciente.nombre} ${paciente.apellido} (DNI: ${paciente.dni})`, 
        obraSocialId: paciente.obraSocialId, 
      }));
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
      return [];
    }
  },
  
checkDniExists: async (dni) => {
      try {
       
        const { data } = await axiosInstance.get(`/Paciente/check-dni?dni=${dni}`);
        return data.exists;
      } catch (error) {
        console.error("Error al verificar DNI:", error);
       
        return false; 
      }
    },


  
};