import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Textarea, VStack, useToast, Text, Alert, AlertIcon
} from '@chakra-ui/react';
import { ausenciaService } from '../../../services/AusenciaService';

const ModalRegistrarAusencia = ({ isOpen, onClose, onAusenciaCreada }) => {
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fecha || !motivo) {
        toast({ title: 'Complete todos los campos', status: 'warning' });
        return;
    }

    setIsSubmitting(true);
    const result = await ausenciaService.crearAusencia({ fecha, motivo });
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'Día bloqueado correctamente', description: 'Se han notificado a los pacientes afectados.', status: 'success', duration: 5000 });
      onAusenciaCreada(); 
      onClose();
      setFecha(''); setMotivo(''); 
    } else {
      toast({ title: 'Error', description: result.message, status: 'error' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Bloquear Día (Ausencia)</ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        
        <ModalBody>
          <VStack spacing={4}>
            <Alert status='warning' borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                    Al bloquear este día, <strong>se cancelarán automáticamente</strong> todos los turnos pendientes y se enviará un email de aviso a los pacientes.
                </Text>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Fecha</FormLabel>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Motivo</FormLabel>
              <Textarea 
                placeholder="Ej: Enfermedad, Viaje, Trámite personal..." 
                value={motivo} 
                onChange={(e) => setMotivo(e.target.value)} 
              />
              <Text fontSize="xs" color="gray.500">Este motivo se incluirá en el email al paciente.</Text>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>Cancelar</Button>
          <Button colorScheme="red" type="submit" isLoading={isSubmitting} loadingText="Procesando...">
            Confirmar y Bloquear
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalRegistrarAusencia;