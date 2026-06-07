import React from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Text, Center, Spinner, Badge, HStack, Select, useColorModeValue, Alert, AlertIcon,Input
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import { useAuditoriasPaginadas } from '../../hooks/useAuditoriasPaginadas';
import Pagination from '../../components/ui/Pagination';

const AuditoriaPage = () => {
  const { 
    auditorias, loading, error, currentPage, totalPages, totalItems, pageSize, filtros,
    cambiarPagina, aplicarFiltros, cambiarTamanio 
  } = useAuditoriasPaginadas();

  const boxBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const rowBorder = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');

  const getColorAccion = (accion) => {
    const acc = accion?.toUpperCase() || '';
    if (acc.includes('CREACION') || acc.includes('ALTA')) return 'green';
    if (acc.includes('ELIMINACION') || acc.includes('DESACTIVACION') || acc.includes('ANULACION') || acc.includes('CANCELACION')) return 'red';
    if (acc.includes('EDICION') || acc.includes('MODIFICACION')) return 'orange';
    return 'blue';
  };

  const formatFecha = (fechaString) => {
    try {
      return format(parseISO(fechaString), 'dd MMM yyyy, HH:mm', { locale: es });
    } catch { return 'Fecha inválida'; }
  };

  return (
    <Box>
      <Heading mb={6}>Registro de Auditoría</Heading>

      <Box bg={boxBg} p={4} borderRadius="md" shadow="sm" mb={6}>
        <HStack spacing={4} wrap="wrap">
        
          <Box w="150px">
            <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.500" textTransform="uppercase">Fecha Desde</Text>
            <Input 
              type="date" size="sm" bg={inputBg} 
              value={filtros.fechaDesde || ''}
              onChange={(e) => aplicarFiltros({ fechaDesde: e.target.value })}
            />
          </Box>
          <Box w="150px">
            <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.500" textTransform="uppercase">Fecha Hasta</Text>
            <Input 
              type="date" size="sm" bg={inputBg} 
              value={filtros.fechaHasta || ''}
              onChange={(e) => aplicarFiltros({ fechaHasta: e.target.value })} 
            />
          </Box>
          <Box w="200px">
            <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.500" textTransform="uppercase">Acción</Text>
            <Select size="sm" value={filtros.accion} onChange={(e) => aplicarFiltros({ accion: e.target.value })}>
              <option value="">Todas las acciones</option>
              <option value="CREACION">Creación</option>
              <option value="MODIFICACION">Modificación</option>
              <option value="ANULACION">Anulación</option>
              <option value="DESACTIVACION">Desactivación</option>
            </Select>
          </Box>
        </HStack>
      </Box>

      <Box bg={boxBg} p={4} borderRadius="md" shadow="md" position="relative">
        {error && <Alert status='error' mb={4}><AlertIcon />Error al cargar el registro.</Alert>}

        {loading && auditorias.length === 0 ? (
          <Center h="300px"><Spinner size="xl" color="blue.500" /></Center>
        ) : (
          <Box position="relative">
             {loading && (
                <Box position="absolute" top="0" left="0" right="0" bottom="0" bg={useColorModeValue('whiteAlpha.700', 'blackAlpha.600')} zIndex="2" display="flex" justifyContent="center" pt="10">
                    <Spinner size="lg" color="blue.500" />
                </Box>
            )}

            <Box opacity={loading ? 0.4 : 1} pointerEvents={loading ? "none" : "auto"} transition="opacity 0.2s">
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th>Fecha y Hora</Th>
                      <Th>Usuario</Th>
                      <Th>Acción</Th>
                      <Th>Detalles</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {auditorias.length === 0 ? (
                      <Tr><Td colSpan={4}><Center p={6} color="gray.500">No hay registros de auditoría.</Center></Td></Tr>
                    ) : (
                      auditorias.map((a) => (
                        <Tr key={a.id} borderColor={rowBorder}>
                          <Td color="gray.500" fontSize="sm">{formatFecha(a.fechaHora)}</Td>
                          <Td>
                            <Text fontWeight="bold">{a.usuarioNombre}</Text>
                            <Text fontSize="xs" color="gray.500">{a.usuarioRol}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getColorAccion(a.accion)} variant="subtle">
                              {a.accion}
                            </Badge>
                            <Text fontSize="xs" color="gray.400" mt={1} fontWeight="bold">{a.modulo}</Text>
                          </Td>
                          <Td whiteSpace="normal" maxW="300px">
                            <Text fontSize="sm">{a.descripcion}</Text>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>

              <Pagination 
                currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize}
                onPageChange={cambiarPagina} onPageSizeChange={cambiarTamanio}
              />
          {!filtros.fechaDesde && !filtros.fechaHasta && (
                <Alert status="info" mt={4} borderRadius="md" size="sm" variant="left-accent">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">Mostrando actividad reciente</Text>
                    <Text fontSize="sm">
                      Por motivos de rendimiento, solo se visualizan los movimientos de los <strong>últimos 3 días</strong>. 
                      Utilice los filtros de fecha superiores para inspeccionar el historial completo.
                    </Text>
                  </Box>
                </Alert>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
export default AuditoriaPage;