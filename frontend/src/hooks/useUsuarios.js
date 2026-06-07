import { useState, useEffect, useCallback } from 'react';
import { usuarioService } from '../services/UsuarioService';
import { useToast } from '@chakra-ui/react';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    mostrarInactivos: false
  });

  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const toast = useToast();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBusqueda(filtros.busqueda);
    }, 500);
    return () => clearTimeout(handler);
  }, [filtros.busqueda]);

const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usuarioService.getUsuariosPaginados(
        currentPage, 
        pageSize, 
        debouncedBusqueda, 
        filtros.mostrarInactivos
      );
      setUsuarios(data.items || []);
      setTotalItems(data.total || 0);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los usuarios.', status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedBusqueda, filtros.mostrarInactivos, toast]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const aplicarFiltros = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    setCurrentPage(1);
  };

  const cambiarPagina = (page) => setCurrentPage(page);
  
  const cambiarTamanio = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

 return {
    usuarios,
    loading,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    filtros,
    cambiarPagina,
    aplicarFiltros,
    cambiarTamanio,
    recargarUsuarios: cargarUsuarios
  };
};