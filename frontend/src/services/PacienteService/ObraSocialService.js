import axiosInstance from '../axiosInstance';


const API_URL = '/ObraSocial'; 

export const obraSocialService = {

  /**
   
   */
  getAll: async () => {
    try {
      const { data } = await axiosInstance.get(API_URL);
      
      return data; 
    } catch (error) {
      console.error("Error al cargar obras sociales:", error);
      throw error; 
    }
  }
};