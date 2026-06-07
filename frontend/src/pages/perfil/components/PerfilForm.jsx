import { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form'; 
import { usuarioService } from '../../../services/UsuarioService'; 

const PerfilForm = ({ initialData }) => {
  const {
    register,
    handleSubmit,
    reset, 
    formState: { errors, isSubmitting, isDirty }, 
  } = useForm({
    defaultValues: initialData || { username: '', email: '' } 
  });
  const toast = useToast();

  
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = async (data) => {
    try {
      await usuarioService.updateMyProfile(data);
      toast({ title: "Perfil actualizado", status: "success", duration: 3000 });
      reset(data);
    } catch (error) {
      toast({ 
        title: "Error al actualizar", 
        description: error.response?.data?.error || error.message || "Error desconocido", 
        status: "error", 
        duration: 5000 
      });
    }
  };

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} spacing={4} align="stretch">
      <FormControl isInvalid={errors.username}>
        <FormLabel htmlFor="username">Nombre de Usuario</FormLabel>
        <Input
          id="username"
          {...register('username', { 
              required: 'El nombre de usuario es requerido',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' } 
          })}
        />
        <FormErrorMessage>{errors.username && errors.username.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.email}>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input
          id="email"
          type="email"
          {...register('email', { 
              required: 'El email es requerido',
              pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' }
          })}
        />
        <FormErrorMessage>{errors.email && errors.email.message}</FormErrorMessage>
      </FormControl>

      <Button 
        type="submit" 
        colorScheme="blue" 
        isLoading={isSubmitting}
        // Deshabilita si no hay cambios
        isDisabled={!isDirty || isSubmitting} 
      >
        Guardar Cambios de Perfil
      </Button>
    </VStack>
  );
};

export default PerfilForm;