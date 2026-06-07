import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Center,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  useDisclosure,
  useToast,
    TableContainer,
    Tooltip,
    VStack,
    FormErrorMessage,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  useColorModeValue,
  Tag,
  Switch,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiEye, FiEyeOff } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { obraSocialService } from '../../../services/ObraSocialService'; 
import { useAuth } from '../../../context/AuthContext';

const ObrasSocialesCRUD = () => {
  const [obrasSociales, setObrasSociales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOS, setSelectedOS] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);
  const toast = useToast();
  const { user } = useAuth();
  

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef();

  
 const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
      mode: 'onBlur' 
  });

  const headerBg = useColorModeValue('gray.50', 'gray.700'); 
 
  const modalBg = useColorModeValue('white', 'gray.800'); 
  
  const tableBorder = useColorModeValue('gray.200', 'gray.700');
  
  const emptyText = useColorModeValue('gray.500', 'gray.400');
 
  const inputBg = useColorModeValue('white', 'gray.700');


  const cargarDatos = async () => {
    setIsLoading(true);
    const data = await obraSocialService.getObrasSociales();
    setObrasSociales(data);
    setIsLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

 
  const handleCrear = () => {
    setSelectedOS(null);
   reset({ nombre: '', precioTurno: 0, activa: true });
    onModalOpen();
  };

 
  const handleEditar = (os) => {
    setSelectedOS(os); 
    reset(os); 
    onModalOpen();
  };

 
 const handleDesactivar = (os) => { 
    setSelectedOS(os);
    onAlertOpen();
  };

const handleReactivar = async (os) => {
    setIsSubmitting(true);
    const payload = { 
        id: os.id,
        nombre: os.nombre,
        precioTurno: os.precioTurno,
        activa: true 
    }; 
    
    try {
     
      const result = await obraSocialService.updateObraSocial(os.id, payload); 
      if (result.success) {
        toast({ title: 'Obra Social reactivada', status: 'success' });
        await cargarDatos(); 
      } else {
        toast({ title: 'Error', description: result.message, status: 'error' });
      }
    } catch (error) {
      toast({ title: 'Error inesperado', status: 'error' });
    }
    setIsSubmitting(false);
  };


  const onFormSubmit = async (data) => {
    setIsSubmitting(true);
  
    const payload = { ...data, 
        precioTurno: parseFloat(data.precioTurno || 0),
        activa: selectedOS ? data.activa : true};

    try {
      let result;
      if (selectedOS) { 
        
        payload.id = selectedOS.id; 
        result = await obraSocialService.updateObraSocial(selectedOS.id, payload);
      } else { 
        result = await obraSocialService.createObraSocial(payload);
      }

      if (result.success) {
        toast({ title: `Obra Social ${selectedOS ? 'actualizada' : 'creada'}`, status: 'success' });
        onModalClose();
        await cargarDatos(); 
      } else {
        toast({ title: 'Error', description: result.message, status: 'error' });
      }
    } catch (error) {
      toast({ title: 'Error inesperado', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };


 const onConfirmDelete = async () => {
    if (!selectedOS) return;
    setIsSubmitting(true); 
    
  
    const result = await obraSocialService.deleteObraSocial(selectedOS.id); 
    
    if (result.success) {
      toast({ title: 'Obra Social desactivada', status: 'success' });
      onAlertClose();
      await cargarDatos(); 
    } else {
      toast({ title: 'Error', description: result.message, status: 'error' });
    }
    setIsSubmitting(false);
    setSelectedOS(null);
  };
 

  if (isLoading) {
    return <Center h="200px"><Spinner /></Center>;
  }

  return (
    <Box>
      <Box mb={4}>
        <HStack justify="space-between" mb={2}>
          <Text>Gestiona las obras sociales y sus precios.</Text>
          {user?.rol === 'Admin' && (
            <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm" onClick={handleCrear}>
              Nueva Obra Social
            </Button>
          )}
        </HStack>
        <FormControl display="flex" alignItems="center" w="fit-content">
          <Switch
            id="ver-inactivas-os"
            colorScheme="orange"
            isChecked={mostrarInactivas}
            onChange={(e) => setMostrarInactivas(e.target.checked)}
          />
          <FormLabel htmlFor="ver-inactivas-os" mb="0" ml={2} fontSize="sm" fontWeight="bold">
            Ver inactivas
          </FormLabel>
        </FormControl>
      </Box>

    <TableContainer borderWidth="1px" borderRadius="md" borderColor={tableBorder}>
        <Table variant="simple" size="sm">
        
          <Thead bg={headerBg}>
            <Tr>
              <Th>Nombre</Th>
              <Th isNumeric>Precio Turno</Th>
              <Th>Estado</Th>
              {user?.rol === 'Admin' && <Th>Acciones</Th>}
             
            </Tr>
          </Thead>
          <Tbody>
            {obrasSociales.filter(os => mostrarInactivas ? !os.activa : os.activa).length === 0 ? (
              <Tr><Td colSpan={4}><Center p={4} color={emptyText}>{mostrarInactivas ? 'No hay obras sociales inactivas.' : 'No hay obras sociales activas.'}</Center></Td></Tr>
            ) : (
              obrasSociales.filter(os => mostrarInactivas ? !os.activa : os.activa).map((os) => (
               <Tr key={os.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} opacity={os.activa ? 1 : 0.5}> 
                  <Td>{os.nombre}</Td>
                  <Td isNumeric>${os.precioTurno?.toLocaleString('es-AR')}</Td>
                <Td>
                    <Tag size="sm" colorScheme={os.activa ? 'green' : 'red'}>
                      {os.activa ? 'Activa' : 'Inactiva'}
                    </Tag>
                  </Td>
                  {user?.rol === 'Admin' && (
                  <Td>
                    <HStack spacing={1}>
                     <Tooltip label="Editar" fontSize="xs">
                        <IconButton icon={<FiEdit />} size="sm" variant="ghost" onClick={() => handleEditar(os)} />
                      </Tooltip>

                      {os.activa ? (
                        
                        <Tooltip label="Desactivar" fontSize="xs">
                          <IconButton icon={<FiEyeOff />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDesactivar(os)} />
                        </Tooltip>
                      ) : (
                        <Tooltip label="Reactivar" fontSize="xs">
                          <IconButton 
                            icon={<FiEye />} 
                            size="sm" 
                            variant="ghost" 
                            colorScheme="green" 
                            onClick={() => handleReactivar(os)} 
                            isLoading={isSubmitting} 
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </Td>
                  )}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

   
     <Modal isOpen={isModalOpen} onClose={onModalClose} isCentered>
        <ModalOverlay />
       <ModalContent as="form" onSubmit={handleSubmit(onFormSubmit)} bg={modalBg}>
          <ModalHeader>{selectedOS ? 'Editar Obra Social' : 'Nueva Obra Social'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={errors.nombre} isRequired>
                <FormLabel fontSize="sm">Nombre</FormLabel>
                <Input 
                 {...register('nombre', { 
                    required: 'El nombre es requerido',
                    minLength: { value: 3, message: 'Debe tener al menos 3 caracteres' },
                    maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                    validate: (value) => value.trim() !== '' || 'El nombre no puede ser solo espacios'
                  })} 
                />
                <FormErrorMessage>{errors.nombre?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={errors.precioTurno} isRequired>
                <FormLabel fontSize="sm">Precio del Turno</FormLabel>
                <InputGroup>
                  <InputLeftAddon>$</InputLeftAddon>
                 <Input 
                    type="number"
                    step="0.01" 
                    bg={inputBg}
                    {...register('precioTurno', { 
                        required: 'El precio es requerido',
                        valueAsNumber: true, 
                        min: { value: 0, message: 'El precio no puede ser negativo' },
                        validate: (value) => value > 0 || 'El precio debe ser mayor a 0' 
                    })} 
                  />
                </InputGroup>
                <FormErrorMessage>{errors.precioTurno?.message}</FormErrorMessage>
              </FormControl>
              {selectedOS && ( 
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="os-activa" mb="0" fontSize="sm">
                    ¿Activa?
                  </FormLabel>
                  <Switch 
                    id="os-activa" 
                    {...register('activa')} 
                  />
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onModalClose}>Cancelar</Button>
            <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
              {selectedOS ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

   
  <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={modalBg}>
            <AlertDialogHeader>Desactivar Obra Social</AlertDialogHeader>
            <AlertDialogBody>
              ¿Estás seguro? "{selectedOS?.nombre}" ya no aparecerá en los dropdowns para nuevos turnos, pero se mantendrá en los reportes historicos.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>Cancelar</Button>
              <Button colorScheme="red" onClick={onConfirmDelete} ml={3} isLoading={isSubmitting}>
                Desactivar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ObrasSocialesCRUD;