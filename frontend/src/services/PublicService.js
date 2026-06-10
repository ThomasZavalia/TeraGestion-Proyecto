import axios from 'axios';


const publicAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const publicService = {
 getDisponibilidad: async (fecha, terapeutaId) => {
    const dateString = fecha.toISOString().split('T')[0];
    const { data } = await publicAxios.get(`/public/turnos/disponibilidad/${terapeutaId}?fecha=${dateString}`);
    return data;
  },
  getObrasSociales: async () => {
    const { data } = await publicAxios.get('/public/turnos/obras-sociales');
    return data;
  },
  reservar: async (reservaData) => {
    const { data } = await publicAxios.post('/public/turnos/reservar', reservaData);
    return data;
  },

  getTerapeutas: async () => {
    const { data } = await publicAxios.get('/Usuario/terapeutas');
    return data;
  }
};