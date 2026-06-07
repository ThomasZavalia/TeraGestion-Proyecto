import React, { useState, useRef,useEffect } from 'react'; 
import {
  Box,
  Heading,
  Button,
  IconButton, 
  HStack,
  VStack,
  Select, 
  FormControl,
  FormLabel,
  Spinner,
  Center,
  Text,
  useToast,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure, 
  Tooltip,
  Alert,AlertIcon,
  Input,
  useColorModeValue,
  Tag,
} from '@chakra-ui/react';
import { AddIcon} from "@chakra-ui/icons"; 
import { FiFilter } from "react-icons/fi";
import { useLocation,useNavigate } from 'react-router-dom';
import { usePacientes } from '../../hooks/usePacientes';
import { TablaPacientes } from './component/TablaPacientes';
import { FormularioPacienteModal } from './component/FormularioPacienteModal';
import { ComfirmarEliminarModal } from './component/ComfirmarEliminarModal';
import { pacienteService } from '../../services/PacienteService/PacienteService';
import { obraSocialService } from '../../services/ObraSocialService';
import { usePacientesPaginados } from '../../hooks/usePacientesPaginados';
import Pagination from '../../components/ui/Pagination';

const PacientesPage = () => {

const { 
      pacientes, loading, error, currentPage, totalPages, totalItems, pageSize, filtros,
      cambiarPagina, aplicarFiltros, cambiarTamanio, eliminarPaciente, reactivarPaciente, recargarPacientes 
  } = usePacientesPaginados();
  const toast = useToast();

  const [busqueda, setBusqueda] = useState('');
 
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const [pacienteActual, setPacienteActual] = useState(null);
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
  const [isEliminando, setIsEliminando] = useState(false);
  const cancelRef = useRef();

  const location = useLocation(); 
  const navigate = useNavigate();

  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
 const [filtrosLocales, setFiltrosLocales] = useState({ obraSocialId: '', activo: 'true', tienePagosPendientes: '' });
  const [obrasSociales, setObrasSociales] = useState([]);
  const [isLoadingOS, setIsLoadingOS] = useState(false);


  useEffect(() => {
    const cargarObrasSociales = async () => {
        setIsLoadingOS(true);
        const data = await obraSocialService.getObrasSociales();
        setObrasSociales(data);
        setIsLoadingOS(false);
    };
    cargarObrasSociales();
  }, []);

  useEffect(() => {

  if (isFilterOpen) {
    setFiltrosLocales({
      obraSocialId: filtros.obraSocialId || '',
      activo: filtros.activo || 'true',
      tienePagosPendientes: filtros.tienePagosPendientes || ''
    });
  }
}, [isFilterOpen, filtros]);

  useEffect(() => {
    
    if (location.state?.abrirModalNuevo) {
      console.log("Detectado 'abrirModalNuevo' desde el Home.");
      handleNuevo(); 
      
   
      navigate(location.pathname, { replace: true, state: {} }); 
    }
  }, [location.state]);

  const handleNuevo = () => {
    setPacienteActual(null);
    onFormOpen(); 
  };

  const handleEditar = (paciente) => {
    setPacienteActual(paciente);
    onFormOpen(); 
  };

  const handleGuardado = () => {
    onFormClose(); 
    recargarPacientes(filtros);
  };

  

  
  const handleEliminar = (paciente) => {
    setPacienteAEliminar(paciente); 
    onAlertOpen(); 
  };

  const handleReactivarClick = async (paciente) => {
      try {
          await reactivarPaciente(paciente);
          toast({ title: "Paciente Reactivado", status: "success", duration: 3000 });
      } catch (error) {
          toast({ title: "Error al reactivar", status: "error" });
      }
  };

 const confirmarEliminar = async () => {
    setIsEliminando(true);
    try {
      
      await eliminarPaciente(pacienteAEliminar.id); 
      toast({
        title: "Paciente Desactivado", 
        status: "warning", 
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error al eliminar el paciente",
        description: error.message, 
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsEliminando(false);
      onAlertClose();
      setPacienteAEliminar(null);
    }
  };

  const handleFiltroLocalChange = (e) => {
    const { name, value } = e.target;
    setFiltrosLocales(prev => ({ ...prev, [name]: value }));
  };

 const handleAplicarFiltros = () => {
    aplicarFiltros(filtrosLocales); 
    onFilterClose(); 
  };

const handleLimpiarFiltros = () => {
      const filtrosLimpios = { obraSocialId: '', activo: 'true', tienePagosPendientes: '' };
      setFiltrosLocales(filtrosLimpios); 
      aplicarFiltros(filtrosLimpios); 
      onFilterClose();
  };

    const boxBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('white', 'gray.700');

  const pacientesFiltrados = pacientes.filter((paciente) => {
      const termino = busqueda.toLowerCase();
      return (
          paciente.nombre.toLowerCase().includes(termino) ||
          paciente.apellido.toLowerCase().includes(termino) ||
          paciente.dni.toLowerCase().includes(termino)
      );
  });

  const contenido = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={10}>
          <Spinner size="xl" />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert status='error'>
          <AlertIcon />
          Error al cargar los pacientes.
        </Alert>
      );
    }

  return <TablaPacientes pacientes={pacientesFiltrados} onEditar={handleEditar} onEliminar={handleEliminar} onReactivar={handleReactivar} />;
  };

 return (
    <Box p={4}>
      <HStack justifyContent="space-between" mb={10}>
        <Heading>Pacientes</Heading>
        <HStack>
        
          <Tooltip label="Filtrar Pacientes" aria-label="Filtrar Pacientes">
            <IconButton
              icon={<FiFilter />}
              aria-label="Filtrar Pacientes"
              variant="outline"
              onClick={onFilterOpen} 
               onFocus={(e) => e.preventDefault()}
            />
          </Tooltip>
         
          <Tooltip label="Agregar Paciente" aria-label="Agregar Paciente">
            <Button leftIcon={<AddIcon />} colorScheme='teal' onClick={handleNuevo}  onFocus={(e) => e.preventDefault()}>
              Agregar Paciente
            </Button>
          </Tooltip>
        </HStack>
      </HStack>

     <Input 
          placeholder="Buscar en el servidor por nombre, apellido o DNI..." 
          value={filtros.busqueda}
          onChange={(e) => aplicarFiltros({ busqueda: e.target.value })}
          mb={4}
          bg={inputBg}
      />

      {(filtros.obraSocialId || filtros.tienePagosPendientes || filtros.activo !== 'true') && (
  <Box mb={4} p={3} bg="blue.50" borderRadius="md" borderLeftWidth="4px" borderLeftColor="blue.500">
    <HStack justify="space-between" align="start">
      <VStack align="start" spacing={1}>
        <Text fontSize="sm" fontWeight="bold" color="blue.700">
          Filtros Activos:
        </Text>
        
        {filtros.obraSocialId && (
          <Tag size="sm" colorScheme="blue">
            Obra Social: {obrasSociales.find(os => os.value === filtros.obraSocialId)?.label}
          </Tag>
        )}
        
        {filtros.activo === 'false' && (
          <Tag size="sm" colorScheme="blue">
            Inactivos
          </Tag>
        )}
        
        {filtros.tienePagosPendientes === 'true' && (
          <Tag size="sm" colorScheme="blue">
            Con Pagos Pendientes
          </Tag>
        )}
      </VStack>
      
      <Button 
        size="xs" 
        variant="ghost" 
        colorScheme="blue"
        onClick={() => {
          const filtrosLimpios = { busqueda: '', obraSocialId: '', activo: 'true', tienePagosPendientes: '' };
          aplicarFiltros(filtrosLimpios);
          setFiltrosLocales(filtrosLimpios);
        }}
      >
        Limpiar Todos
      </Button>
    </HStack>
  </Box>
)}
      

     <Box bg={boxBg} p={4} borderRadius="md" shadow="md"> 
        {error && <Alert status='error' mb={4}><AlertIcon />Error al cargar los pacientes.</Alert>}
        
       {loading && pacientes.length === 0 ? (
            <Center p={10}><Spinner size="xl" /></Center>
        ) : (
            <Box position="relative">
                {loading && (
                    <Box 
                        position="absolute" top="0" left="0" right="0" bottom="0" 
                        bg={useColorModeValue('whiteAlpha.700', 'blackAlpha.600')} 
                        zIndex="2" display="flex" justifyContent="center" pt="10"
                    >
                        <Spinner size="lg" color="blue.500" />
                    </Box>
                )}
                
                <Box opacity={loading ? 0.4 : 1} pointerEvents={loading ? "none" : "auto"} transition="opacity 0.2s">
                    <TablaPacientes 
                        pacientes={pacientes} 
                        onEditar={handleEditar} 
                        onEliminar={handleEliminar} 
                        onReactivar={handleReactivarClick} 
                    />
                    
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={cambiarPagina}
                        onPageSizeChange={cambiarTamanio}
                    />
                </Box>
            </Box>
        )}
      </Box>

      
     <FormularioPacienteModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        onGuardado={handleGuardado}
        pacienteAEditar={pacienteActual}
      />

     <ComfirmarEliminarModal
        isOpen={isAlertOpen}
        onClose={onAlertClose}
        onConfirm={confirmarEliminar}
        isLoading={isEliminando}
        leastDestructiveRef={cancelRef} 
        title="Desactivar Paciente" 
      >

      ¿Estás seguro? El paciente **{pacienteAEliminar?.nombre} {pacienteAEliminar?.apellido}** se marcará como "Inactivo" y no aparecerá en las búsquedas.
      </ComfirmarEliminarModal>


<Drawer isOpen={isFilterOpen} placement="right" onClose={onFilterClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Filtrar Pacientes</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Obra Social</FormLabel>
                <Select name="obraSocialId" value={filtrosLocales.obraSocialId} onChange={handleFiltroLocalChange} placeholder={isLoadingOS ? "Cargando..." : "Todas"}>
                  {!isLoadingOS && obrasSociales.map(os => (<option key={os.value} value={os.value}>{os.label}</option>))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Estado</FormLabel>
                <Select name="activo" value={filtrosLocales.activo} onChange={handleFiltroLocalChange} placeholder="Todos">
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Pagos</FormLabel>
                <Select name="tienePagosPendientes" value={filtrosLocales.tienePagosPendientes} onChange={handleFiltroLocalChange} placeholder="Todos">
                    <option value="true">Con pagos pendientes</option>
                    <option value="false">Sin pagos pendientes</option>
                </Select>
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={handleLimpiarFiltros} size="sm">Limpiar</Button>
            <Button colorScheme="blue" onClick={handleAplicarFiltros} size="sm">Aplicar Filtros</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default PacientesPage;