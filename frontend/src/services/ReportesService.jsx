import axiosInstance from './axiosInstance';

/**
 * 
 * @param {Date | string | null} date 
 * @returns {string | null}
 */
const formatDateQuery = (date) => {
    if (!date) return null;
    try {
        
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        
        return new Date(date).toISOString().split('T')[0];
    } catch (e) {
        return null; 
    }
};

export const reportesService = {
    getTopPacientes: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            const fechaDesde = formatDateQuery(filtros.fechaDesde);
            const fechaHasta = formatDateQuery(filtros.fechaHasta);
            if (fechaDesde) params.append('fechaDesde', fechaDesde);
            if (fechaHasta) params.append('fechaHasta', fechaHasta);
            const { data } = await axiosInstance.get('/Reportes/top-pacientes', { params });
            return data || [];
        } catch (error) {
            console.error("Error fetching top pacientes:", error);
            return [];
        }
    },

    getMetodosPago: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            const fechaDesde = formatDateQuery(filtros.fechaDesde);
            const fechaHasta = formatDateQuery(filtros.fechaHasta);
            if (fechaDesde) params.append('fechaDesde', fechaDesde);
            if (fechaHasta) params.append('fechaHasta', fechaHasta);
            const { data } = await axiosInstance.get('/Reportes/metodos-pago', { params });
            return data || [];
        } catch (error) {
            console.error("Error fetching metodos pago:", error);
            return [];
        }
    },

    getTurnosPorEstado: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            const fechaDesde = formatDateQuery(filtros.fechaDesde);
            const fechaHasta = formatDateQuery(filtros.fechaHasta);
            if (fechaDesde) params.append('fechaDesde', fechaDesde);
            if (fechaHasta) params.append('fechaHasta', fechaHasta);
            const { data } = await axiosInstance.get('/Reportes/turnos-por-estado', { params });
            return data || [];
        } catch (error) {
            console.error("Error fetching turnos por estado:", error);
            return [];
        }
    },

    getTurnosPorMes: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            const fechaDesde = formatDateQuery(filtros.fechaDesde);
            const fechaHasta = formatDateQuery(filtros.fechaHasta);
            if (fechaDesde) params.append('fechaDesde', fechaDesde);
            if (fechaHasta) params.append('fechaHasta', fechaHasta);

            const { data } = await axiosInstance.get('/Reportes/turnos-por-mes', { params });
            return data || [];
        } catch (error) {
            console.error("Error fetching turnos por mes:", error);
            return [];
        }
    },

    getIngresosPorMes: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            const fechaDesde = formatDateQuery(filtros.fechaDesde);
            const fechaHasta = formatDateQuery(filtros.fechaHasta);
            if (fechaDesde) params.append('fechaDesde', fechaDesde);
            if (fechaHasta) params.append('fechaHasta', fechaHasta);

            const { data } = await axiosInstance.get('/Reportes/ingresos-por-mes', { params });
            
            return data || []; 
        } catch (error) {
            console.error("Error fetching ingresos por mes:", error);
            return [];
        }
    },

    getTurnosPorObraSocial: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            const fechaDesde = formatDateQuery(filtros.fechaDesde);
            const fechaHasta = formatDateQuery(filtros.fechaHasta);
            if (fechaDesde) params.append('fechaDesde', fechaDesde);
            if (fechaHasta) params.append('fechaHasta', fechaHasta);
            const { data } = await axiosInstance.get('/Reportes/turnos-por-obrasocial', { params });
            return data || [];
        } catch (error) {
            console.error("Error fetching turnos por obra social:", error);
            return [];
        }
    },


    exportarExcel: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            const fechaDesde = formatDateQuery(filtros.fechaDesde);
            const fechaHasta = formatDateQuery(filtros.fechaHasta);
            
            if (fechaDesde) params.append('fechaDesde', fechaDesde);
            if (fechaHasta) params.append('fechaHasta', fechaHasta);

            const response = await axiosInstance.get('/Reportes/exportar-excel', { 
                params,
                responseType: 'blob' 
            });
            
            return response.data; 
        } catch (error) {
            console.error("Error exportando excel:", error);
            throw error;
        }
    },
    

  getMiRendimiento: async (filtros = {}) => {
     
      const queryParams = new URLSearchParams();
      if (filtros.fechaDesde) queryParams.append('fechaDesde', `${filtros.fechaDesde}-01`);
      if (filtros.fechaHasta) {
      
          const [year, month] = filtros.fechaHasta.split('-');
          const lastDay = new Date(year, month, 0).getDate();
          queryParams.append('fechaHasta', `${filtros.fechaHasta}-${lastDay}`);
      }

      const { data } = await axiosInstance.get(`/reportes/mi-rendimiento?${queryParams.toString()}`);
      return data;
  }


};
