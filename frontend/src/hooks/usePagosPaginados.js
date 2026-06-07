import { useState, useEffect, useCallback } from 'react';
import { pagoService } from '../services/PagosService';

export const usePagosPaginados = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    fechaDesde: '',
    fechaHasta: '',
    metodoPago: ''
  });

  const [isExporting, setIsExporting] = useState(false);
  
  const cargarPagos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { pagina: currentPage, tamanio: pageSize, ...filtros };
      const data = await pagoService.getPagosPaginados(params);
      
      setPagos(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.error("Error al cargar pagos:", err);
      setError(err);
      setPagos([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filtros]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarPagos();
    }, 500);
    return () => clearTimeout(timer);
  }, [cargarPagos]);
  
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

  const handleExportarExcel = async () => {
    setIsExporting(true);
   
    const result = await pagoService.exportarExcel(filtros);
    setIsExporting(false);
    return result;
  };
  
  return {
    pagos, loading, error, currentPage, totalPages, totalItems, pageSize, filtros,
    cambiarPagina, aplicarFiltros, cambiarTamanio, recargarPagos: cargarPagos,
    isExporting,
    exportarExcel: handleExportarExcel
  };
};