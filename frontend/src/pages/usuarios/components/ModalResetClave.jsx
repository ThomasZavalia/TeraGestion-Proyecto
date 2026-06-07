import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Button, Text
} from '@chakra-ui/react';

const ModalResetClave = ({ isOpen, onClose, usuarioActual, onConfirm, isSubmitting }) => {
  const [nuevaClave, setNuevaClave] = useState('');

  useEffect(() => {
    if (isOpen) setNuevaClave('');
  }, [isOpen]);

  const handleSubmit = () => {
    onConfirm(nuevaClave);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Blanquear Contraseña</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>Ingresa la nueva contraseña temporal para <strong>{usuarioActual?.username}</strong>.</Text>
          <FormControl isRequired>
            <FormLabel>Nueva Contraseña</FormLabel>
            <Input type="text" value={nuevaClave} onChange={e => setNuevaClave(e.target.value)} placeholder="Ej: temporal123" />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>Cancelar</Button>
          <Button colorScheme="red" onClick={handleSubmit} isLoading={isSubmitting}>Forzar Cambio</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalResetClave;