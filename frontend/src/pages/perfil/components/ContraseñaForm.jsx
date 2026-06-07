import { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  FormErrorMessage,
  InputGroup, InputRightElement, IconButton, 
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form'; 
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { usuarioService } from '../../../services/UsuarioService'; 

const ContrasenaForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch, 
    formState: { errors, isSubmitting },
  } = useForm();
  const toast = useToast();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  const newPassword = watch("contraseñaNueva", ""); 

  const onSubmit = async (data) => {
    try {
    
      const result = await usuarioService.changePassword({
          contraseñaActual: data.contraseñaActual,
          contraseñaNueva: data.contraseñaNueva,
          confirmarContraseñaNueva: data.confirmarContraseñaNueva
      });
      if (result.success) {
          toast({ title: result.message || "Contraseña actualizada", status: "success", duration: 3000 });
          reset();
      } else {
           toast({ title: "Error", description: result.message, status: "error", duration: 5000 });
      }
    } catch (error) { 
      toast({ title: "Error", description: "No se pudo cambiar la contraseña.", status: "error", duration: 5000 });
    }
  };

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} spacing={4} align="stretch">
      <FormControl isInvalid={errors.contraseñaActual}>
        <FormLabel htmlFor="contraseñaActual">Contraseña Actual</FormLabel>
        <InputGroup>
          <Input
            id="contraseñaActual"
            type={showCurrent ? 'text' : 'password'}
            {...register('contraseñaActual', { required: 'Contraseña actual requerida' })}
          />
          <InputRightElement>
            <IconButton size="sm" variant="ghost" icon={showCurrent ? <AiOutlineEyeInvisible /> : <AiOutlineEye />} onClick={() => setShowCurrent(!showCurrent)} />
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{errors.contraseñaActual && errors.contraseñaActual.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.contraseñaNueva}>
        <FormLabel htmlFor="contraseñaNueva">Nueva Contraseña</FormLabel>
         <InputGroup>
          <Input
            id="contraseñaNueva"
            type={showNew ? 'text' : 'password'}
            {...register('contraseñaNueva', { 
                required: 'Nueva contraseña requerida',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' } 
            })}
          />
           <InputRightElement>
             <IconButton size="sm" variant="ghost" icon={showNew ? <AiOutlineEyeInvisible /> : <AiOutlineEye />} onClick={() => setShowNew(!showNew)} />
           </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{errors.contraseñaNueva && errors.contraseñaNueva.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.confirmarContraseñaNueva}>
        <FormLabel htmlFor="confirmarContraseñaNueva">Confirmar Nueva Contraseña</FormLabel>
         <InputGroup>
          <Input
            id="confirmarContraseñaNueva"
            type={showConfirm ? 'text' : 'password'}
            {...register('confirmarContraseñaNueva', { 
                required: 'Confirmación requerida',
                validate: value => value === newPassword || "Las contraseñas no coinciden" 
            })}
          />
           <InputRightElement>
             <IconButton size="sm" variant="ghost" icon={showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />} onClick={() => setShowConfirm(!showConfirm)} />
           </InputRightElement>
         </InputGroup>
        <FormErrorMessage>{errors.confirmarContraseñaNueva && errors.confirmarContraseñaNueva.message}</FormErrorMessage>
      </FormControl>

      <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
        Cambiar Contraseña
      </Button>
    </VStack>
  );
};

export default ContrasenaForm;