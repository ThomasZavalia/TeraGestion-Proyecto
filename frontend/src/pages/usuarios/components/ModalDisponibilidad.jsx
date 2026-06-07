import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack, HStack, FormControl, FormLabel, Switch, Input, Button, useToast, SimpleGrid, Text, Box, Spinner, Center
} from '@chakra-ui/react';
import { disponibilidadService } from '../../../services/DisponibilidadService';

const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const ModalDisponibilidad = ({ isOpen, onClose, usuarioActual }) => {
  const [disponibilidad, setDisponibilidad] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && usuarioActual) {
      cargarDisponibilidad();
    }
  }, [isOpen, usuarioActual]);

  const cargarDisponibilidad = async () => {
    setIsLoading(true);
    try {
      const data = await disponibilidadService.getDisponibilidadTerapeuta(usuarioActual.id);
      
      const fullWeek = diasNombres.map((nombre, index) => {
        const diaData = data.find(d => d.diaSemana === index);
        return {
          diaSemana: index,
          diaNombre: nombre, 
          disponible: diaData?.disponible ?? false, 
          horaInicio: diaData?.horaInicio || '', 
          horaFin: diaData?.horaFin || '', 
        };
      });
      setDisponibilidad(fullWeek.sort((a,b) => (a.diaSemana === 0 ? 7 : a.diaSemana) - (b.diaSemana === 0 ? 7 : b.diaSemana) ));
    } catch (error) {
      toast({ title: "Error al cargar disponibilidad", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (diaIndex, field, value) => {
    setDisponibilidad(prev => prev.map((dia, index) => {
      if (index === diaIndex) {
        if (field === 'disponible' && !value) return { ...dia, disponible: false, horaInicio: '', horaFin: '' };
        return { ...dia, [field]: value };
      }
      return dia;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const dtoToSend = disponibilidad.map(dia => ({
      diaSemana: dia.diaSemana,
      disponible: dia.disponible,
      horaInicio: dia.horaInicio || null, 
      horaFin: dia.horaFin || null,
    }));
    
    for (const dia of dtoToSend) {
      if (dia.disponible && (!dia.horaInicio || !dia.horaFin)) {
        toast({ title: `Horas requeridas para ${diasNombres[dia.diaSemana]}`, status: "warning", duration: 4000 });
        setIsSaving(false); return;
      }
      if (dia.horaInicio && dia.horaFin && dia.horaFin <= dia.horaInicio) {
        toast({ title: `Horas inválidas para ${diasNombres[dia.diaSemana]}`, description: "La hora de fin debe ser posterior a la de inicio.", status: "error", duration: 4000 });
        setIsSaving(false); return;
      }
    }

    const result = await disponibilidadService.updateDisponibilidadTerapeuta(usuarioActual.id, dtoToSend);
    setIsSaving(false);

    if (result.success) {
      toast({ title: result.message, status: "success", duration: 3000 });
      onClose();
    } else {
      toast({ title: "Error al guardar", description: result.message, status: "error", duration: 5000 });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Horarios: {usuarioActual?.nombre} {usuarioActual?.apellido}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Center h="200px"><Spinner size="xl" /></Center>
          ) : (
            <VStack spacing={4} align="stretch" maxH="60vh" overflowY="auto" px={2}>
              {disponibilidad.map((dia, index) => (
                <Box key={dia.diaSemana} p={3} borderWidth="1px" borderRadius="md" bg={dia.disponible ? "blue.50" : "transparent"}>
                  <HStack justify="space-between" mb={dia.disponible ? 3 : 0}>
                    <Text fontWeight="bold" color={dia.disponible ? "blue.700" : "gray.500"}>{dia.diaNombre}</Text>
                    <Switch isChecked={dia.disponible} onChange={(e) => handleChange(index, 'disponible', e.target.checked)} colorScheme="blue" />
                  </HStack>
                  
                  {dia.disponible && (
                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl><FormLabel fontSize="xs">Inicio</FormLabel><Input type="time" size="sm" value={dia.horaInicio} onChange={(e) => handleChange(index, 'horaInicio', e.target.value)} bg="white" /></FormControl>
                      <FormControl><FormLabel fontSize="xs">Fin</FormLabel><Input type="time" size="sm" value={dia.horaFin} onChange={(e) => handleChange(index, 'horaFin', e.target.value)} bg="white" /></FormControl>
                    </SimpleGrid>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSaving}>Cancelar</Button>
          <Button colorScheme="blue" onClick={handleSave} isLoading={isSaving}>Guardar Horarios</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalDisponibilidad;