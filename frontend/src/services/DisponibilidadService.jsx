import axiosInstance from './axiosInstance';


const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const formatDia = (numDia) => diasSemana[numDia] || 'Desconocido';


const ordenarPorDia = (a, b) => {
    
    const diaA = a.diaSemana === 0 ? 7 : a.diaSemana;
    const diaB = b.diaSemana === 0 ? 7 : b.diaSemana;
    return diaA - diaB;
};


export const disponibilidadService = {
 
  getDisponibilidad: async () => {
    try {
  
      const { data } = await axiosInstance.get('/usuario/me/disponibilidad'); 
     
      return data.sort(ordenarPorDia) || []; 
    } catch (error) {
      console.error("Error fetching disponibilidad:", error);
      throw error;
    }
  },

  getDisponibilidadTerapeuta: async (terapeutaId) => {
    try {
      const { data } = await axiosInstance.get(`/usuario/me/disponibilidad/terapeuta/${terapeutaId}`); 
      return data.sort(ordenarPorDia) || []; 
    } catch (error) {
      console.error("Error fetching disponibilidad del terapeuta:", error);
      throw error;
    }
  },

 
  updateDisponibilidad: async (disponibilidadSemanal) => {
   
    try {
      
      const dto = { dias: disponibilidadSemanal };
      
      const { data } = await axiosInstance.put('/usuario/me/disponibilidad', dto); 
      return { success: true, message: data.message || "Disponibilidad actualizada" };
    } catch (error) {
      console.error("Error updating disponibilidad:", error);
      return { success: false, message: error.response?.data?.error || error.message || "Error al actualizar" };
    }
  },

  updateDisponibilidadTerapeuta: async (terapeutaId, disponibilidadSemanal) => {
    try {
      const dto = { dias: disponibilidadSemanal };
      
      const { data } = await axiosInstance.put(`/usuario/me/disponibilidad/terapeuta/${terapeutaId}`, dto); 
      return { success: true, message: data.message || "Horarios actualizados correctamente" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al actualizar" };
    }
  },
};