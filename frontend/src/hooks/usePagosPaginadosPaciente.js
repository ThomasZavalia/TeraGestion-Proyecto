import { useState, useEffect, useCallback } from "react";
import { pagoService } from "../services/PagosService"; 

export const usePagosPaginadosPaciente = (pacienteId) => {
  const [data, setData] = useState({ items: [], totalItems: 0, totalPages: 0, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagina, setPagina] = useState(1);
  const [tamanio, setTamanio] = useState(5);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [metodoPago, setMetodoPago] = useState('');

  const fetchPagos = useCallback(async () => {
    if (!pacienteId) return;
    setLoading(true);
    try {
      const params = {
        pagina, tamanio,
        ...(desde && { desde }),
        ...(hasta && { hasta }),
        ...(metodoPago && { metodoPago })
      };
      const result = await pagoService.getPagosPaginadosPaciente(pacienteId, params);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pacienteId, pagina, tamanio, desde, hasta, metodoPago]);

  useEffect(() => { fetchPagos(); }, [fetchPagos]);

  const handleFiltroChange = (setter, value) => { setter(value); setPagina(1); };

  return {
    items: data.items, totalItems: data.totalItems, totalPages: data.totalPages, currentPage: data.currentPage, loading, error,
    pagina, setPagina, tamanio, setTamanio,
    desde, setDesde: (v) => handleFiltroChange(setDesde, v),
    hasta, setHasta: (v) => handleFiltroChange(setHasta, v),
    metodoPago, setMetodoPago: (v) => handleFiltroChange(setMetodoPago, v),
    recargar: fetchPagos
  };
};