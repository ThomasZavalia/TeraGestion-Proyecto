import axiosInstance from './axiosInstance';

export const pagoService = {
  /**
   
   * @param {object} filtros 
   * @param {string} filtros.fechaDesde 
   * @param {string} filtros.fechaHasta 
   * @param {number} filtros.pacienteId ll
   * @returns {Promise<Array>} 
   */
  getPagos: async (filtros = {}) => {
    try {
     
      const params = new URLSearchParams();
      if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
      if (filtros.pacienteId) params.append('pacienteId', filtros.pacienteId);

      
      const { data } = await axiosInstance.get('/Pago/pagos-filtrados', { params }); 
      return data; 
    } catch (error) {
      console.error("Error al obtener pagos:", error);
      
      return []; 
    }
  },



  
  getPagosPaginados: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append('pagina', params.pagina || 1);
      queryParams.append('tamanio', params.tamanio || 10);

      if (params.busqueda && params.busqueda.trim() !== '') {
          queryParams.append('busqueda', params.busqueda);
      }
      if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
      if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
      if (params.metodoPago) queryParams.append('metodoPago', params.metodoPago);

      const { data } = await axiosInstance.get('/Pago/paginated', { params: queryParams }); 
      return data; 
    } catch (error) {
      console.error("Error al obtener pagos paginados:", error);
      throw error; 
    }
  },

  anularPago: async (id) => {
    try {
      const { data } = await axiosInstance.put(`/Pago/${id}/anular`);
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Error al anular el pago:", error);
      return { success: false, message: error.response?.data?.message || "Error al anular el pago" };
    }
  },

  


exportarExcel: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.busqueda && params.busqueda.trim() !== '') queryParams.append('busqueda', params.busqueda);
      if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
      if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
      if (params.metodoPago) queryParams.append('metodoPago', params.metodoPago);

      const response = await axiosInstance.get('/Pago/exportar-excel', { 
        params: queryParams,
        responseType: 'blob' 
      }); 

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fechaHoy = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Pagos_${fechaHoy}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      return { success: false, message: "Hubo un error al intentar descargar el archivo." };
    }
  },

  getPagosPaginadosPaciente: async (pacienteId, params) => {
    try {
      const { data } = await axiosInstance.get(`/Pago/paciente/${pacienteId}`, { params });
      return data;
    } catch (error) {
      console.error("Error al obtener pagos paginados:", error);
      throw error;
    }
  },
};



