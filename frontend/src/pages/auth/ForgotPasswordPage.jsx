import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading,
  Text, useColorModeValue, useToast, Link as ChakraLink
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import authService from '../../services/AuthService'; 

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.500', 'gray.400');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      
      toast({
        title: 'Correo enviado.',
        description: "Si el correo existe, recibirás instrucciones para resetear tu clave.",
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
      
    } catch (error) {
     
      toast({
        title: 'Error.',
        description: error.response?.data || "Ocurrió un error al procesar la solicitud.",
        status: 'error',
        duration: 4000,
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
            <Heading size="lg">Recuperar Cuenta</Heading>
            <Text color={textColor} mt={2}>
              Ingresa tu email y te enviaremos un enlace.
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing="4">
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                w="full"
                isLoading={isLoading}
                loadingText="Enviando..."
              >
                Enviar enlace de recuperación
              </Button>
            </VStack>
          </form>

          <Box textAlign="center">
            <ChakraLink as={RouterLink} to="/login" color="blue.500">
              Volver al inicio de sesión
            </ChakraLink>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;