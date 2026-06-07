import axiosInstance from './axiosInstance';

export const auditoriaService = {
  getAuditoriasPaginadas: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append('pagina', params.pagina || 1);
      queryParams.append('tamanio', params.tamanio || 10);

      if (params.modulo) queryParams.append('modulo', params.modulo);
      if (params.accion) queryParams.append('accion', params.accion);
      if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
      if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);

      const { data } = await axiosInstance.get('/Auditoria/paginated', { params: queryParams }); 
      return data; 
    } catch (error) {
      console.error("Error al obtener auditorías:", error);
      throw error;
    }
  }
};