import axios from 'axios';


const publicAxios = axios.create({
  baseURL: 'https://api-teragestion-tz-cpcch8dseddre2a2.centralus-01.azurewebsites.net/api', 
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