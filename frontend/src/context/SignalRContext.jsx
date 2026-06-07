import React, { createContext, useContext, useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useToast } from '@chakra-ui/react';
import axiosInstance from '../services/axiosInstance'; 

const SignalRContext = createContext();

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ultimaNotificacion, setUltimaNotificacion] = useState(null);
  const toast = useToast();

  
  const fetchHistorial = async () => {
    try {
      const { data } = await axiosInstance.get('/notificaciones');
      setNotificaciones(data);
      setUnreadCount(data.filter(n => !n.leida).length);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  };

  
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return; 

    fetchHistorial();

    const newConnection = new HubConnectionBuilder()
      .withUrl("https://api-teragestion-tz-cpcch8dseddre2a2.centralus-01.azurewebsites.net/hubs/notificaciones", { 
        accessTokenFactory: () => token 
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop();
        console.log("Conexión de SignalR cerrada correctamente.");
      }
    };
  }, []);

  
 useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          connection.on('RecibirNotificacion', (notif) => {
            setNotificaciones(prev => [notif, ...prev].slice(0, 20)); // máx 20, igual que el backend
            setUnreadCount(prev => prev + 1);
            setUltimaNotificacion(notif); 
            
            toast({
              title: notif.titulo,
              description: notif.mensaje,
              status: 'info',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
              variant: 'solid' 
            });
          });
        })
        .catch(e => console.log(' Error conectando SignalR: ', e));

      return () => {
        connection.off('RecibirNotificacion');
      };
    }
  }, [connection, toast]);


  const marcarLeida = async (id) => {
    
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    
 
    try {
      await axiosInstance.put(`/notificaciones/${id}/leer`);
    } catch (error) { console.error(error); }
  };

  return (
    <SignalRContext.Provider value={{ notificaciones, unreadCount, marcarLeida, ultimaNotificacion }}>
      {children}
    </SignalRContext.Provider>
  );
};