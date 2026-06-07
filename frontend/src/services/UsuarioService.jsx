import axiosInstance from './axiosInstance';

export const usuarioService = {

  getMyProfile: async () => {
    try {
      
      const { data } = await axiosInstance.get('/Usuario/me'); 
      return data; 
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error; 
    }
  },


  updateMyProfile: async (profileData) => {
   
    try {
    
      const { data } = await axiosInstance.put('/Usuario/me', profileData); 
      return data; 
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error; 
    }
  },

 
  changePassword: async (passwordData) => {
   
    try {

      const { data } = await axiosInstance.post('/Usuario/change-password', passwordData); 
      return { success: true, message: data.message || "Contraseña actualizada" };
    } catch (error) {
      console.error("Error changing password:", error);
      
      return { success: false, message: error.response?.data?.message || "Error al cambiar contraseña" }; 
    }
  },
  getTerapeutas: async () => {
    try {
      const { data } = await axiosInstance.get('/Usuario/terapeutas');
      return data;
    } catch (error) {
      console.error("Error al traer terapeutas:", error);
      return [];
    }
  },
  getUsuarios: async () => {
    const { data } = await axiosInstance.get('/Usuario');
    return data;
  },

  crearUsuario: async (usuario) => {
    const { data } = await axiosInstance.post('/Usuario', usuario);
    return data;
  },

  actualizarUsuario: async (id, usuario) => {
    const { data } = await axiosInstance.put(`/Usuario/${id}`, usuario);
    return data;
  },

  toggleEstadoUsuario: async (id) => {
    await axiosInstance.delete(`/Usuario/${id}`);
    return true;
  },

  blanquearClave: async (id, nuevaClave) => {
    const { data } = await axiosInstance.put(`/Usuario/${id}/blanquear-clave`, {
      contraseñaNueva: nuevaClave 
    });
    return data;
  },

  getUsuariosPaginados: async (pagina = 1, tamanio = 10, busqueda = '', mostrarInactivos = false) => {
    try {
      const { data } = await axiosInstance.get('/Usuario/paginados', {
        params: { pagina, tamanio, busqueda, mostrarInactivos }
      });
      return data; 
    } catch (error) {
      console.error("Error al traer usuarios paginados:", error);
      return { items: [], total: 0 };
    }
  },
  
  
};