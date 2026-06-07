import { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Table, Thead, Tbody, Tr, Th, Td, Center, Spinner, Text, useColorModeValue, Badge, Box
} from '@chakra-ui/react';
import { disponibilidadService } from '../../../services/DisponibilidadService';

const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const ModalVerHorarios = ({ isOpen, onClose, terapeutaId, nombreTerapeuta }) => {
  const [horarios, setHorarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const modalBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (isOpen && terapeutaId) {
      const fetchHorarios = async () => {
        setIsLoading(true);
        try {
          const data = await disponibilidadService.getDisponibilidadTerapeuta(terapeutaId);
          setHorarios(data);
        } catch (error) {
          console.error("Error cargando horarios:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHorarios();
    }
  }, [isOpen, terapeutaId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent bg={modalBg}>
        <ModalHeader pb={2}>Horarios de Atención</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontWeight="bold" color="blue.500" mb={4}>{nombreTerapeuta}</Text>

          {isLoading ? (
            <Center h="150px"><Spinner /></Center>
          ) : (
            <Box borderWidth="1px" borderRadius="md" overflow="hidden">
              <Table variant="simple" size="sm">
                <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Tr>
                    <Th>Día</Th>
                    <Th>Horario</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {horarios.map((dia) => (
                    <Tr key={dia.diaSemana} opacity={dia.disponible ? 1 : 0.5}>
                      <Td fontWeight={dia.disponible ? "bold" : "normal"}>
                        {diasSemana[dia.diaSemana]}
                      </Td>
                      <Td>
                        {dia.disponible ? (
                          `${dia.horaInicio?.slice(0, 5)} a ${dia.horaFin?.slice(0, 5)} hs`
                        ) : (
                          <Badge colorScheme="red" variant="subtle">No atiende</Badge>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" size="sm" onClick={onClose}>Entendido</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalVerHorarios;