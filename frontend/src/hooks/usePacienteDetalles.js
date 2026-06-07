import { useState, useEffect, useCallback } from "react";
import {useParams} from "react-router-dom";
import {pacienteService} from "../services/PacienteService/PacienteService";

export const usePacienteDetalles = () => {
  
  const { id } = useParams(); 

  const [detalles, setDetalles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const cargarDetalles = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await pacienteService.getPacienteDetalles(id);
      setDetalles(data);
      setError(null);
    } catch (err) {
      console.error("Error en usePacienteDetalles:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]); 

 
  useEffect(() => {
    cargarDetalles();
  }, [cargarDetalles]);

  return {
    detalles,
    loading,
    error,
    recargarDetalles: cargarDetalles,
  };
};