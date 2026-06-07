import React, { useState } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Alert, AlertIcon, IconButton, HStack, Badge, Icon,
  useDisclosure, useToast, Tooltip, Input, Select, Flex, Text, Switch, FormLabel, FormControl, Spinner, Center
} from '@chakra-ui/react';
import { EditIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { FormularioSesionModal } from './FormularioSesionModal';
import { SesionService } from '../../../services/SesionService/SesionService';
import { useSesionesPaginadas } from '../../../hooks/useSesionesPaginadas'; 
import { useAuth } from '../../../context/AuthContext';
import Pagination from '../../../components/ui/Pagination'; 

export const TabHistorialSesiones = ({ pacienteId }) => { 
  const toast = useToast();
  const { user } = useAuth();
  
  const { 
    items: sesiones, totalItems, totalPages, currentPage, loading, error,
    pagina, setPagina, tamanio, setTamanio, desde, setDesde, hasta, setHasta, asistencia, setAsistencia, terapeutaId, setTerapeutaId, recargar
  } = useSesionesPaginadas(pacienteId);

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [sesionActual, setSesionActual] = useState(null);

  const handleEditar = (sesion) => { setSesionActual(sesion); onEditOpen(); };
  const handleGuardado = () => { onEditClose(); recargar(); };

  const handleToggleMisSesiones = (e) => {
    setTerapeutaId(e.target.checked ? user.id : null);
  };

  const formatFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });

  if (error) {
    return <Alert status="error"><AlertIcon />Error cargando historial: {error.message}</Alert>;
  }

  return (
    <Box p={4}>
     
      <Flex gap={4} mb={4} align="flex-end" wrap="wrap" bg="gray.50" p={4} borderRadius="md" borderWidth="1px">
        <FormControl w={{ base: '100%', md: '150px' }}>
          <FormLabel fontSize="sm" mb={1}>Desde</FormLabel>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} bg="white" size="sm"/>
        </FormControl>

        <FormControl w={{ base: '100%', md: '150px' }}>
          <FormLabel fontSize="sm" mb={1}>Hasta</FormLabel>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} bg="white" size="sm"/>
        </FormControl>

        <FormControl w={{ base: '100%', md: '150px' }}>
          <FormLabel fontSize="sm" mb={1}>Asistencia</FormLabel>
          <Select placeholder="Todas" value={asistencia} onChange={(e) => setAsistencia(e.target.value)} bg="white" size="sm">
            <option value="Presente">Presente</option>
            <option value="Ausente">Ausente</option>
          </Select>
        </FormControl>

        {user?.rol === 'Terapeuta' && (
          <FormControl display="flex" alignItems="center" w="auto" mb={1} ml={{ md: 'auto' }}>
            <Switch id="mis-sesiones" colorScheme="blue" isChecked={terapeutaId === user.id} onChange={handleToggleMisSesiones} />
            <FormLabel htmlFor="mis-sesiones" mb="0" ml={2} fontSize="sm" fontWeight="bold">
              Ver solo mis sesiones
            </FormLabel>
          </FormControl>
        )}
      </Flex>
     

      {loading ? (
        <Center py={10}><Spinner size="xl" /></Center>
      ) : sesiones.length === 0 ? (
        <Alert status="info"><AlertIcon />No se encontraron sesiones con estos filtros.</Alert>
      ) : (
        <>
          <TableContainer bg="white" borderRadius="md" shadow="sm" borderWidth="1px">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Fecha</Th>
                  <Th>Profesional</Th>
                  <Th>Asistencia</Th>
                  <Th>Notas</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sesiones.map((sesion) => {
                  const tieneNotas = sesion.notas && sesion.notas.trim() !== '' && !sesion.notas.includes('🔒');
                  const esCensurado = sesion.notas?.includes('🔒');
                  return (
                    <Tr key={sesion.id}>
                      <Td>{formatFecha(sesion.fecha)}</Td>
                      <Td fontWeight="bold" color="blue.600">{sesion.profesionalNombre || 'Desconocido'}</Td>
                      <Td>
                        <Badge colorScheme={sesion.asistencia === 'Presente' ? 'green' : 'red'}>{sesion.asistencia}</Badge>
                      </Td>
                      <Td>
                        {esCensurado ? (
                           <Badge colorScheme="gray" variant="subtle"><Icon as={WarningIcon} mr={1} />Privado</Badge>
                        ) : tieneNotas ? (
                          <Badge colorScheme="green" variant="subtle"><Icon as={CheckCircleIcon} mr={1} />Completa</Badge>
                        ) : (
                          <Badge colorScheme="yellow" variant="subtle"><Icon as={WarningIcon} mr={1} />Pendiente</Badge>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                            <Tooltip label="Editar Sesion">
                                <IconButton icon={<EditIcon />} size="sm" variant="ghost" onClick={() => handleEditar(sesion)} isDisabled={esCensurado}/>
                            </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
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

      <FormularioSesionModal isOpen={isEditOpen} onClose={onEditClose} onGuardado={handleGuardado} sesionAEditar={sesionActual} />
    </Box>
  );
};