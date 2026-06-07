
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading,
  Text, InputGroup, InputRightElement, IconButton,useColorModeValue,
} from '@chakra-ui/react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useLoginForm } from '../hooks/useLoginForm'; 
import { Link as RouterLink } from 'react-router-dom';
import { Link as ChakraLink } from '@chakra-ui/react';

const LoginPage = () => {
  const {
    username, setUsername,
    password, setPassword,
    showPassword, setShowPassword,
    isLoading, handleSubmit,
  } = useLoginForm(); 

  const pageBg = useColorModeValue('gray.50', 'gray.900');

  const cardBg = useColorModeValue('white', 'gray.800');

  const textColor = useColorModeValue('gray.500', 'gray.400');

  return (
    
   <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={pageBg} 
    >
      <Box
        bg={cardBg}
        p="8"
        borderRadius="lg"
        boxShadow="lg" 
        w="full"
        maxW="md" 
      >
        <VStack spacing="6" align="stretch">
          <Box textAlign="center">
            <Heading size="lg">TeraGestión</Heading>
            <Text color={textColor}>Ingresa a tu cuenta</Text> 
          </Box>
          <form onSubmit={handleSubmit}>
            <VStack spacing="4">
              
              <FormControl isRequired>
                <FormLabel>Nombre de Usuario</FormLabel>
                <Input
                  type="text"
                  placeholder="tu-usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                 
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
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
         <Box textAlign="right" mt={2}>
        <ChakraLink as={RouterLink} to="/forgot-password" color="blue.500" fontSize="sm">
            ¿Olvidaste tu contraseña?
        </ChakraLink>
          </Box>

              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                w="full"
                isLoading={isLoading}
                loadingText="Ingresando..."
              >
                Iniciar Sesión
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPage;