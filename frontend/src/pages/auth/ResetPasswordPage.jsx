import React, { useState, useEffect } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading,
  Text, InputGroup, InputRightElement, IconButton, useColorModeValue, useToast
} from '@chakra-ui/react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../../services/AuthService';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Token inválido',
        description: "No se encontró un token de seguridad. Vuelve a solicitar el correo.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/forgot-password');
    }
  }, [token, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: "Las contraseñas no coinciden.",
        status: 'warning',
        duration: 3000,
        position: 'top'
      });
      return;
    }

    if (password.length < 6) {
        toast({
          title: 'Error',
          description: "La contraseña debe tener al menos 6 caracteres.",
          status: 'warning',
          duration: 3000,
          position: 'top'
        });
        return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, password);
      
      toast({
        title: 'Contraseña restablecida',
        description: "Ya puedes iniciar sesión con tu nueva contraseña.",
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
      
      navigate('/login');

    } catch (error) {
  console.error("Error al resetear:", error); 

  let mensajeError = "Ocurrió un error al intentar cambiar la contraseña.";

  if (error.response && error.response.data) {
     const data = error.response.data;
     
     if (typeof data === 'string') {
        mensajeError = data;
     } 
     else if (typeof data === 'object') {
        
        if (data.errors) {
            
            mensajeError = Object.values(data.errors).flat().join(", ");
        } else if (data.title) {
            mensajeError = data.title;
        }
     }
  }

  toast({
    title: 'Error',
    description: mensajeError, 
    status: 'error',
    duration: 5000,
    isClosable: true,
    position: 'top'
  });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={pageBg}>
      <Box bg={cardBg} p="8" borderRadius="lg" boxShadow="lg" w="full" maxW="md">
        <VStack spacing="6" align="stretch">
          <Box textAlign="center">
            <Heading size="lg">Nueva Contraseña</Heading>
            <Text color={textColor}>Introduce tu nueva clave.</Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing="4">
              
              <FormControl isRequired>
                <FormLabel>Nueva Contraseña</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirmar Contraseña</FormLabel>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                w="full"
                isLoading={isLoading}
                loadingText="Restableciendo..."
              >
                Cambiar Contraseña
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;