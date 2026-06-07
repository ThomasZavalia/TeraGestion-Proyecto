
import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Select, Button, HStack, Alert, AlertIcon, Text,InputGroup,InputRightAddon, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Box
} from '@chakra-ui/react';

const InfoRol = ({ rol }) => {
  if (!rol) return null;
  const info = {
    'Admin': { text: 'Poder absoluto. Puede ver auditoría, modificar sistema y gestionar usuarios.' },
    'Secretaria': { text: 'Gestión diaria. Puede cobrar, anular pagos, crear pacientes y ver calendario.' },
   'Terapeuta': { text: 'Atención clínica. Solo ve sus propios turnos y su rendimiento. Cobra por porcentaje de comisión.' }
  };
  return (
    <Alert status="info" mt={2} borderRadius="md" size="sm" py={2}>
      <AlertIcon />
      <Text fontSize="xs"><strong>{rol}</strong>: {info[rol].text}</Text>
    </Alert>
  );
};

const ModalUsuarioABM = ({ isOpen, onClose, usuarioActual, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', username: '', email: '', rol: '', passwordHash: '',
    porcentajeGanancia: 70, titulo: '', especialidad: ''
  });

  useEffect(() => {
    if (usuarioActual) {
      setFormData({
        nombre: usuarioActual.nombre || '', apellido: usuarioActual.apellido || '',
        username: usuarioActual.username, email: usuarioActual.email, 
        rol: usuarioActual.rol, passwordHash: '',
        porcentajeGanancia: usuarioActual.porcentajeGanancia !== undefined ? usuarioActual.porcentajeGanancia : 70,
        titulo: usuarioActual.titulo || '',             
        especialidad: usuarioActual.especialidad || ''
      });
    } else {
     setFormData({ 
          nombre: '', apellido: '', username: '', email: '', rol: '', passwordHash: '', porcentajeGanancia: 70,
          titulo: '', especialidad: ''
      });
    }
  }, [usuarioActual, isOpen]);

 const handleSubmit = () => {
   
    const datosGuardar = {
        ...formData,
        porcentajeGanancia: formData.rol === 'Terapeuta' ? formData.porcentajeGanancia : 0,
        especialidad: formData.rol === 'Terapeuta' ? formData.especialidad : ''
    };
    onSave(datosGuardar); 
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{usuarioActual ? 'Editar Usuario' : 'Nuevo Usuario'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack spacing={4} mb={3} align="flex-end">
            <FormControl w="120px">
                <FormLabel>Título</FormLabel>
                <Select placeholder="Ninguno" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})}>
                    <option value="Lic.">Lic.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Dra.">Dra.</option>
                    <option value="Mg.">Mg.</option>
                </Select>
            </FormControl>
            <FormControl isRequired><FormLabel>Nombre</FormLabel><Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} /></FormControl>
            <FormControl isRequired><FormLabel>Apellido</FormLabel><Input value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} /></FormControl>
          </HStack>
          <FormControl mb={3} isRequired><FormLabel>Email</FormLabel><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></FormControl>
          <FormControl mb={3} isRequired><FormLabel>Nombre de Usuario (Login)</FormLabel><Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} isDisabled={!!usuarioActual} /></FormControl>
          
          {!usuarioActual && (
            <FormControl mb={3} isRequired><FormLabel>Contraseña Inicial</FormLabel><Input type="password" value={formData.passwordHash} onChange={e => setFormData({...formData, passwordHash: e.target.value})} /></FormControl>
          )}

          <FormControl isRequired>
            <FormLabel>Rol en el Sistema</FormLabel>
            <Select placeholder="Seleccionar Rol" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
              <option value="Admin">Administrador</option>
              <option value="Secretaria">Secretaria</option>
              <option value="Terapeuta">Terapeuta</option>
            </Select>
            <InfoRol rol={formData.rol} />
          </FormControl>

         {formData.rol === 'Terapeuta' && (
             <Box p={3} borderWidth="1px" borderRadius="md" bg="blue.50" borderColor="blue.100">
              
                <FormControl mb={4}>
                    <FormLabel fontWeight="bold" color="blue.700">Especialidad Clínica</FormLabel>
                    <Input 
                        bg="white" 
                        placeholder="Ej: Psicólogo Clínico, Psiquiatra, Nutricionista..." 
                        value={formData.especialidad} 
                        onChange={e => setFormData({...formData, especialidad: e.target.value})} 
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel fontWeight="bold" color="blue.700">Porcentaje de Ganancia</FormLabel>
                    <InputGroup size="md">
                        <NumberInput 
                            value={formData.porcentajeGanancia} 
                            onChange={(valueString) => setFormData({...formData, porcentajeGanancia: Number(valueString)})} 
                            min={0} 
                            max={100}
                            w="full"
                            bg="white"
                        >
                            <NumberInputField borderRadius="md" borderRightRadius={0} />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        <InputRightAddon children="%" borderLeftRadius={0} bg="blue.100" color="blue.700" fontWeight="bold" />
                    </InputGroup>
                    <Text fontSize="xs" color="gray.600" mt={1}>
                        Ejemplo: 70 significa que el profesional cobra el 70% de la sesión y la clínica retiene el 30%.
                    </Text>
                </FormControl>
             </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>Cancelar</Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Guardar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalUsuarioABM;