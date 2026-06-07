import React, { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Alert, AlertIcon, Badge, Flex, Input, Select, FormControl, FormLabel, Center, Spinner, Text,
  Collapse, Button, HStack
} from '@chakra-ui/react';
import { usePagosPaginadosPaciente } from '../../../hooks/usePagosPaginadosPaciente'; 
import Pagination from '../../../components/ui/Pagination'; 
import { turnoService } from '../../../services/TurnoService';

export const TabHistorialPagos = ({ pacienteId, tienePagosPendientes, cantidadPendientes }) => { 
  const { 
    items: pagos, totalItems, totalPages, currentPage, loading, error,
    pagina, setPagina, tamanio, setTamanio, desde, setDesde, hasta, setHasta, metodoPago, setMetodoPago 
  } = usePagosPaginadosPaciente(pacienteId);

  const [mostrarPendientes, setMostrarPendientes] = useState(false);
  const [turnosPendientes, setTurnosPendientes] = useState([]);
  const [paginaPendientes, setPaginaPendientes] = useState(1);
  const [totalPaginasPendientes, setTotalPaginasPendientes] = useState(1);
  const [loadingPendientes, setLoadingPendientes] = useState(false);

  useEffect(() => {
    const fetchPendientes = async () => {
      if (!mostrarPendientes || !tienePagosPendientes) return;
      try {
        setLoadingPendientes(true);
        const data = await turnoService.getTurnosPendientesPaciente(pacienteId, paginaPendientes, 5);
        setTurnosPendientes(data.items);
        setTotalPaginasPendientes(data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPendientes(false);
      }
    };
    fetchPendientes();
  }, [mostrarPendientes, paginaPendientes, pacienteId, tienePagosPendientes]);

  const formatFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' });
  const formatPrecio = (precio) => `$${Number(precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

  if (error) return <Alert status="error"><AlertIcon />Error cargando historial de pagos: {error.message}</Alert>;

  return (
    <Box p={4}>

     
      {tienePagosPendientes && (
        <Box mb={5} borderWidth="1px" borderColor="orange.300" borderRadius="md" overflow="hidden">
          <Alert status="warning" borderRadius="0">
            <AlertIcon />
            <HStack justify="space-between" w="100%">
              <Text fontWeight="semibold">
                {cantidadPendientes} turno{cantidadPendientes !== 1 ? 's' : ''} con pago pendiente
              </Text>
              <Button
                size="xs"
                variant="outline"
                colorScheme="orange"
                onClick={() => setMostrarPendientes(p => !p)}
              >
                {mostrarPendientes ? 'Ocultar' : 'Ver detalle'}
              </Button>
            </HStack>
          </Alert>

          <Collapse in={mostrarPendientes}>
            <TableContainer bg="orange.50" maxH="250px" overflowY="auto">
              <Table size="sm" variant="simple">
                <Thead bg="orange.100">
                  <Tr>
                    <Th>Fecha del Turno</Th>
                    <Th>Terapeuta</Th>
                    <Th>Estado</Th>
                    <Th isNumeric>Monto</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loadingPendientes ? (
                    <Tr><Td colSpan="4" textAlign="center"><Spinner size="sm" /></Td></Tr>
                  ) : (
                    turnosPendientes.map((t) => (
                      <Tr key={t.id}>
                        <Td fontWeight="medium">{formatFecha(t.fechaHora)}</Td>
                      <Td>{t.terapeutaNombre}</Td>
                      <Td>
                        <Badge colorScheme={t.estado === 'Atendido' ? 'green' : 'yellow'}>
                          {t.estado}
                        </Badge>
                      </Td>
                      <Td isNumeric fontWeight="bold" color="orange.700">
                        {formatPrecio(t.precio)}
                      </Td>
                    </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
            {totalPaginasPendientes > 1 && (
              <Flex justify="space-between" align="center" p={2} bg="orange.100" borderTopWidth="1px" borderColor="orange.200">
                <Button 
                  size="xs" colorScheme="orange" variant="ghost"
                  isDisabled={paginaPendientes === 1 || loadingPendientes}
                  onClick={() => setPaginaPendientes(p => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <Text fontSize="xs" fontWeight="bold" color="orange.800">
                  Página {paginaPendientes} de {totalPaginasPendientes}
                </Text>
                <Button 
                  size="xs" colorScheme="orange" variant="ghost"
                  isDisabled={paginaPendientes >= totalPaginasPendientes || loadingPendientes}
                  onClick={() => setPaginaPendientes(p => p + 1)}
                >
                  Siguiente
                </Button>
              </Flex>
            )}
          </Collapse>
        </Box>
      )}
      <Flex gap={4} mb={4} align="flex-end" wrap="wrap" bg="gray.50" p={4} borderRadius="md" borderWidth="1px">
        <FormControl w={{ base: '100%', md: '150px' }}>
          <FormLabel fontSize="sm" mb={1}>Desde</FormLabel>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} bg="white" size="sm"/>
        </FormControl>

        <FormControl w={{ base: '100%', md: '150px' }}>
          <FormLabel fontSize="sm" mb={1}>Hasta</FormLabel>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} bg="white" size="sm"/>
        </FormControl>

        <FormControl w={{ base: '100%', md: '200px' }}>
          <FormLabel fontSize="sm" mb={1}>Método de Pago</FormLabel>
          <Select placeholder="Todos" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} bg="white" size="sm">
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </Select>
        </FormControl>
      </Flex>
  

      {loading ? (
        <Center py={10}><Spinner size="xl" /></Center>
      ) : pagos.length === 0 ? (
        <Alert status="info"><AlertIcon />No se encontraron pagos con estos filtros.</Alert>
      ) : (
        <>
          <TableContainer bg="white" borderRadius="md" shadow="sm" borderWidth="1px">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Fecha y Hora</Th>
                  <Th>Método de Pago</Th>
                  <Th isNumeric>Monto</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagos.map((pago) => (
                  <Tr key={pago.id}>
                    <Td>{formatFecha(pago.fecha)}</Td>
                    <Td>
                      <Badge colorScheme={
                        pago.metodoPago === 'Efectivo' ? 'green' : 
                        pago.metodoPago === 'Transferencia' ? 'blue' : 'purple'
                      }>
                        {pago.metodoPago}
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight="bold" color="green.600">
                      ${pago.monto.toLocaleString('es-AR')}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <Box mt={4}>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={tamanio}
              onPageChange={setPagina}
              onPageSizeChange={(newSize) => { setTamanio(newSize); setPagina(1); }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};