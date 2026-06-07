import { useState, useEffect, useCallback } from 'react';
import { auditoriaService } from '../services/AuditoriaService';

export const useAuditoriasPaginadas = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
const [filtros, setFiltros] = useState({ 
    modulo: '', 
    accion: '', 
    fechaDesde: '', 
    fechaHasta: '' 
  });
  
  const cargarAuditorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { pagina: currentPage, tamanio: pageSize, ...filtros };
      const data = await auditoriaService.getAuditoriasPaginadas(params);
      
      setAuditorias(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError(err);
      setAuditorias([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filtros]);
  
  useEffect(() => {
    cargarAuditorias();
  }, [cargarAuditorias]);
  
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPages) setCurrentPage(nuevaPagina);
  };
  
  const aplicarFiltros = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    setCurrentPage(1);
  };
  
  const cambiarTamanio = (nuevoTamanio) => {
    setPageSize(nuevoTamanio);
    setCurrentPage(1);
  };
  
  return {
    auditorias, loading, error, currentPage, totalPages, totalItems, pageSize, filtros,
    cambiarPagina, aplicarFiltros, cambiarTamanio, recargarAuditorias: cargarAuditorias
  };
};