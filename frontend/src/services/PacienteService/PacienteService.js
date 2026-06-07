import  axiosInstance  from '../axiosInstance';

const API_URL = '/Paciente';

export const pacienteService = {


   /**
   
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




  getPacientes: async (filtros = {}) => {
    try {
      
      const params = new URLSearchParams();
      
      
      if (filtros.obraSocialId && parseInt(filtros.obraSocialId, 10) > 0) {
        params.append('obraSocialId', filtros.obraSocialId);
      }
      
     
      if (filtros.activo !== undefined && filtros.activo !== '') {
        params.append('activo', filtros.activo);
      }

      if (filtros.tienePagosPendientes !== undefined && filtros.tienePagosPendientes !== '') {
        params.append('tienePagosPendientes', filtros.tienePagosPendientes);
      }

      console.log("Enviando filtros a la API:", Object.fromEntries(params)); 

     
      const { data } = await axiosInstance.get(API_URL, { params });
      return data;

    } catch (error) {
      console.error("Error al obtener pacientes:", error);
      throw error;
    }
  },


  crearPaciente: async (pacienteData) => {
    try{
      const {data} = await axiosInstance.post(API_URL, pacienteData);
      return data;
    }catch(error){
      console.error("Error al crear el paciente:", error);
      throw error;
    }
  },




  /** 
  *@param {String|number} id
  *@param {Object} pacienteData
  */

  actualizarPaciente: async (id, pacienteData) => {

    try{
      const {data} = await axiosInstance.put(`${API_URL}/${id}`, pacienteData);
      return data;
    }catch (error){
      console.log("Error al actualizar el paciente:", error);
      throw error;
    }
  },



   /**
   * @param {String|number} id
   */

  getPacienteDetalles: async (id) => {
    try{
      const {data} = await axiosInstance.get(`${API_URL}/${id}/detalles`);
      return data;
    }catch (error) {
      console.log("Error al obtener los detalles del paciente:", error);
      throw error;
    }
  },


  eliminarPaciente: async (id) => {
    try{
      const {data} = await axiosInstance.delete(`${API_URL}/${id}`);
      return data;
    }catch (error){
      console.log("Error al eliminar el paciente:", error);
      throw error;
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


   
  getPacientesPaginados: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append('pagina', params.pagina || 1);
      queryParams.append('tamanio', params.tamanio || 10);

      if (params.obraSocialId) queryParams.append('obraSocialId', params.obraSocialId);
      if (params.activo) queryParams.append('activo', params.activo);
      if (params.tienePagosPendientes) queryParams.append('tienePagosPendientes', params.tienePagosPendientes);
      
      if (params.busqueda && params.busqueda.trim() !== '') {
          queryParams.append('busqueda', params.busqueda);
      }

      const { data } = await axiosInstance.get(`${API_URL}/paginated`, { params: queryParams });
      return data; 
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
      throw error;
    }
  },

};