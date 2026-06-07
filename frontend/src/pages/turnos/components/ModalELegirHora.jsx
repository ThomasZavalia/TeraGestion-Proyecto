import { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, VStack, Heading, Text, Spinner, Center, Wrap
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { turnoService } from '../../../services/TurnoService';

const ModalElegirHora = ({ isOpen, onClose, selectedDay, onTimeSelect, preselectedTime, terapeutaId }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
   
    if (!terapeutaId) {
        setIsLoading(false);
        setAvailableSlots([]);
        return; 
    }

    if (selectedDay) {
      setIsLoading(true);
      const fetchSlots = async () => {
        try {
            const slots = await turnoService.getDisponibilidad(selectedDay, terapeutaId);
            setAvailableSlots(slots);

            if (preselectedTime && slots.includes(preselectedTime)) {
                onTimeSelect(preselectedTime); 
                onClose(); 
            }
        } catch (error) {
            console.error("Error buscando slots:", error);
        } finally {
            setIsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDay, preselectedTime, terapeutaId]);

  const handleTimeClick = (time) => {
    onTimeSelect(time); 
    onClose();
  };

  return (
  <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">Horarios Disponibles</Heading>
          <Text fontSize="sm" color="gray.500" fontWeight="normal">
            {selectedDay ? format(selectedDay, "eeee dd 'de' MMMM, yyyy", { locale: es }) : ''}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Center h="100px">
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Center>
          ) : (
            <Wrap spacing="3" justify="center">
              {availableSlots.length > 0 ? (
                availableSlots.map((time) => {
               
                  const isPreselected = time === preselectedTime;
                  
                  return (
                    <Button
                      key={time}
                      colorScheme={isPreselected ? "green" : "blue"} 
                      variant={isPreselected ? "solid" : "outline"}
                      onClick={() => handleTimeClick(time)}
                      w="80px"
                    >
                      {time}
                    </Button>
                  );
                })
              ) : (
                <VStack spacing={3}>
                    <Text>No hay horarios disponibles para este día.</Text>
                </VStack>
              )}
            </Wrap>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalElegirHora;