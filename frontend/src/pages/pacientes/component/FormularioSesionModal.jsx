import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl,
  FormLabel, VStack, useToast, Select, Textarea,
} from '@chakra-ui/react';
import { SesionService } from '../../../services/SesionService/SesionService';



export const FormularioSesionModal = ({ isOpen, onClose, onGuardado, sesionAEditar }) => {

  const [asistencia, setAsistencia] = useState('');
  const [notas, setNotas] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  // Cargar datos en el modal cuando 'sesionAEditar' cambia
  useEffect(() => {
    if (sesionAEditar) {
      setAsistencia(sesionAEditar.asistencia || 'Presente');
      setNotas(sesionAEditar.notas || '');
    }
  }, [sesionAEditar]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const sesionData = { asistencia, notas };
      await SesionService.actualizarSesion(sesionAEditar.id, sesionData);

      toast({
        title: 'Sesión actualizada',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onGuardado();
      onClose();
    } catch (error) {
      toast({
        title: 'Error al actualizar',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar Sesión</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Asistencia</FormLabel>
              <Select value={asistencia} onChange={(e) => setAsistencia(e.target.value)}>
                <option value="Presente">Presente</option>
                <option value="Ausente">Ausente</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Notas (Estado)</FormLabel>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Escribe las notas de la sesión aquí..."
                rows={6}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSaving}>
            Cancelar
          </Button>
          <Button colorScheme="teal" onClick={handleSubmit} isLoading={isSaving}>
            Guardar Cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};