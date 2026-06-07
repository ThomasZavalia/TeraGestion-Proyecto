import { useState, useEffect, useCallback } from "react";
import { SesionService } from "../services/SesionService/SesionService.js";

export const useSesionesPaginadas = (pacienteId) => {
  
  const [data, setData] = useState({ items: [], totalItems: 0, totalPages: 0, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagina, setPagina] = useState(1);
  const [tamanio, setTamanio] = useState(5);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [asistencia, setAsistencia] = useState('');
  const [terapeutaId, setTerapeutaId] = useState(null); 

  const fetchSesiones = useCallback(async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    try {
      
      const params = {
        pagina,
        tamanio,
        ...(desde && { desde }),
        ...(hasta && { hasta }),
        ...(asistencia && { asistencia }),
        ...(terapeutaId && { terapeutaId })
      };

      const result = await SesionService.getSesionesPaginadas(pacienteId, params);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pacienteId, pagina, tamanio, desde, hasta, asistencia, terapeutaId]);

  useEffect(() => {
    fetchSesiones();
  }, [fetchSesiones]);

  const handleFiltroChange = (setter, value) => {
    setter(value);
    setPagina(1); 
  };

  return {
    items: data.items,
    totalItems: data.totalItems,
    totalPages: data.totalPages,
    currentPage: data.currentPage,
    loading,
    error,
  
    pagina, setPagina,
    tamanio, setTamanio,
    desde, setDesde: (v) => handleFiltroChange(setDesde, v),
    hasta, setHasta: (v) => handleFiltroChange(setHasta, v),
    asistencia, setAsistencia: (v) => handleFiltroChange(setAsistencia, v),
    terapeutaId, setTerapeutaId: (v) => handleFiltroChange(setTerapeutaId, v),
    recargar: fetchSesiones
  };
};