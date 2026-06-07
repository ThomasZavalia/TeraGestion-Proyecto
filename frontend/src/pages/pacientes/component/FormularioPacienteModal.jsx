import React, { useEffect,useF } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, VStack, useToast, Select,
 useColorModeValue, FormErrorMessage, InputGroup, InputLeftAddon 
} from "@chakra-ui/react";
import { useForm } from 'react-hook-form';

import { pacienteService } from "../../../services/PacienteService/PacienteService";
import { obraSocialService } from '../../../services/ObraSocialService'; 

export const FormularioPacienteModal = ({ isOpen, onClose, onGuardado, pacienteAEditar }) => {
 
  const [isSaving, setSaving] = React.useState(false); 
  const [obrasSociales, setObrasSociales] = React.useState([]);
  const [isLoadingOS, setIsLoadingOS] = React.useState(false); 
  
  const toast = useToast();
  const modalBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('white', 'gray.700');
  const today = new Date().toISOString().split('T')[0];
  const isEditing = !!pacienteAEditar;

  const { 
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting } 
  } = useForm({
    mode: 'onBlur', 
  });


  useEffect(() => {
    if (isOpen) {
      const cargarObrasSociales = async () => {
        setIsLoadingOS(true);
        try {
         const lista = await obraSocialService.getObrasSocialesActivas(); 
         setObrasSociales(lista);
        } catch (error) { console.error("Error cargando lista de OS", error); } 
        finally { setIsLoadingOS(false); }
      };
      cargarObrasSociales();
    }
  }, [isOpen, toast]);


 useEffect(() => {
    if (isOpen) {
      if (isEditing && pacienteAEditar) { 
        const fechaParaInput = pacienteAEditar.fechaNacimiento ? pacienteAEditar.fechaNacimiento.split('T')[0] : '';
        
        reset({
          nombre: pacienteAEditar.nombre || "",
          apellido: pacienteAEditar.apellido || "",
          dni: pacienteAEditar.dni || "",
          telefono: pacienteAEditar.telefono || "",
          email: pacienteAEditar.email || "",
        
          obraSocialId: pacienteAEditar.obraSocialId || "", 
          fechaNacimiento: fechaParaInput,
        });
      } else {
       
        reset({
          nombre: "", apellido: "", dni: "", telefono: "",
          email: "", obraSocialId: "", fechaNacimiento: "",
        });
      }
    }
    
  }, [pacienteAEditar, isEditing, isOpen, reset, obrasSociales]);


 const onFormSubmit = async (data) => { 
    setSaving(true); 

    const datosParaEnviar = {
      ...data,
     
      obraSocialId: parseInt(data.obraSocialId, 10),
      fechaNacimiento: data.fechaNacimiento || null, 
      telefono: data.telefono || null, 
      email: data.email || null, 
    };

    console.log("Datos (limpios) que se van a enviar:", datosParaEnviar); 

    try {
      if (isEditing) {
        datosParaEnviar.activo = pacienteAEditar.activo ?? true; 
        await pacienteService.actualizarPaciente(pacienteAEditar.id, datosParaEnviar);
      } else {
         datosParaEnviar.activo = true; 
        await pacienteService.crearPaciente(datosParaEnviar);
      }

      toast({
        title: 'Éxito',
        description: `Paciente ${isEditing ? 'actualizado' : 'creado'} correctamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onGuardado(); 
      onClose(); 
    } catch (error) {
      const errorMsg = error.response?.data?.title || error.response?.data?.message || error.message;
      toast({
        title: 'Error',
        description: `No se pudo guardar el paciente: ${errorMsg}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
    <ModalContent bg={modalBg} as="form" onSubmit={handleSubmit(onFormSubmit)}>
        <ModalHeader>{isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
          <FormControl isRequired isInvalid={errors.nombre}>
              <FormLabel>Nombre</FormLabel>
              <Input 
                name="nombre" 
                bg={inputBg}
                {...register('nombre', { 
                  required: 'El nombre es requerido',
                  maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                })}
              />
              <FormErrorMessage>{errors.nombre?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.apellido}>
              <FormLabel>Apellido</FormLabel>
              <Input 
                name="apellido" 
                bg={inputBg}
                {...register('apellido', { 
                  required: 'El apellido es requerido',
                  maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                })}
              />
              <FormErrorMessage>{errors.apellido?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.dni}>
              <FormLabel>DNI</FormLabel>
              <Input 
                name="dni" 
                bg={inputBg}
                {...register('dni', { 
                  required: 'El DNI es requerido',
                  pattern: {
                    value: /^[0-9]{7,8}$/, 
                    message: 'DNI inválido (debe tener 7 u 8 números)'
                  },
                  validate: async (value) => {
       
        if (isEditing && value === pacienteAEditar.dni) return true;

        
        const existe = await pacienteService.checkDniExists(value);
        return existe ? "Este DNI ya está registrado." : true;
      }
            })}
               
              />
              <FormErrorMessage>{errors.dni?.message}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.telefono}>
              <FormLabel>Teléfono (Opcional)</FormLabel>
              <Input 
                name="telefono" 
                bg={inputBg}
                {...register('telefono', {
                  pattern: {
                    value: /^[0-9+() -]{7,20}$/,
                    message: 'Número de teléfono inválido'
                  }
                })}
              />
              <FormErrorMessage>{errors.telefono?.message}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.email}>
              <FormLabel>Email (Opcional)</FormLabel>
              <Input 
                name="email" 
                type="email" 
                bg={inputBg}
                {...register('email', {
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Formato de email inválido'
                  }
                })}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Fecha de Nacimiento (Opcional)</FormLabel>
              <Input 
                name="fechaNacimiento" 
                type="date" 
                max={today} 
                bg={inputBg}
                {...register('fechaNacimiento')} 
              />
            </FormControl>

          <FormControl isRequired isInvalid={errors.obraSocialId}>
              <FormLabel>Obra Social / Cobertura</FormLabel>
              <Select
                name="obraSocialId" 
                placeholder="Seleccione una opción..." 
                isDisabled={isLoadingOS}
                bg={inputBg}
                {...register('obraSocialId', { 
                    required: 'Debe seleccionar una Obra Social o "Particular"' 
                })} 
              >
                {obrasSociales.map((os) => (
                  <option key={os.value} value={os.value}>
                    {os.label}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.obraSocialId?.message}</FormErrorMessage>
            </FormControl>
            
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};