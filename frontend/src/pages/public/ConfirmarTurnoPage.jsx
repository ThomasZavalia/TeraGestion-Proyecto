import { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Heading, Text, VStack, Spinner, Icon, Button, Center } from '@chakra-ui/react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import axios from 'axios'; 

const ConfirmarTurnoPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const confirmar = async () => {
      const token = searchParams.get('token');
      const id = searchParams.get('id');

      if (!token || !id) {
        setStatus('error');
        return;
      }

      try {
      
        await axios.post(`https://api-teragestion-tz-cpcch8dseddre2a2.centralus-01.azurewebsites.net/api/public/turnos/confirmar?id=${id}&token=${token}`);
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };

    confirmar();
  }, [searchParams]);

  return (
    <Container maxW="md" py={20}>
      <Box bg="white" p={8} borderRadius="xl" shadow="lg" textAlign="center">
        {status === 'loading' && (
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Verificando tu turno...</Text>
          </VStack>
        )}

        {status === 'success' && (
          <VStack spacing={4}>
            <Icon as={FiCheckCircle} w={16} h={16} color="green.500" />
            <Heading size="lg">¡Turno Confirmado!</Heading>
            <Text color="gray.600">Te esperamos en el consultorio.</Text>
            <Button as={RouterLink} to="/reservar" colorScheme="blue" variant="outline">
              Volver al inicio
            </Button>
          </VStack>
        )}

        {status === 'error' && (
          <VStack spacing={4}>
            <Icon as={FiXCircle} w={16} h={16} color="red.500" />
            <Heading size="lg">Algo salió mal</Heading>
            <Text color="gray.600">
              El enlace no es válido o el turno ya fue confirmado.
            </Text>
            <Button as={RouterLink} to="/reservar" colorScheme="gray">
              Intentar reservar de nuevo
            </Button>
          </VStack>
        )}
      </Box>
    </Container>
  );
};

export default ConfirmarTurnoPage;