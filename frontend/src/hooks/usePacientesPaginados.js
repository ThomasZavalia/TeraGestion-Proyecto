import { useState, useEffect, useCallback } from 'react';
import { pacienteService } from '../services/PacienteService/PacienteService';

export const usePacientesPaginados = () => {
  const [pacientes, setPacientes] = useState([]);
const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    obraSocialId: '',
    activo: 'true',
    tienePagosPendientes: ''
  });

  const cargarPacientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        pagina: currentPage,
        tamanio: pageSize,
        ...filtros
      };
      
      const data = await pacienteService.getPacientesPaginados(params);
      
      setPacientes(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
      setError(err);
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filtros]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarPacientes();
    }, 500);
    return () => clearTimeout(timer);
  }, [cargarPacientes]);

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

  const eliminarPaciente = async (id) => {
      await pacienteService.eliminarPaciente(id);
      cargarPacientes();
  };

  const reactivarPaciente = async (paciente) => {
      await pacienteService.actualizarPaciente(paciente.id, { ...paciente, activo: true });
      cargarPacientes();
  };
  
  return {
    pacientes, loading, error, currentPage, totalPages, totalItems, pageSize, filtros,
    cambiarPagina, aplicarFiltros, cambiarTamanio, eliminarPaciente, reactivarPaciente,
    recargarPacientes: cargarPacientes
  };
};