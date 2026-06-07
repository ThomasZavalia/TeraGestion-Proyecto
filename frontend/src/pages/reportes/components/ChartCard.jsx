import { Box, Heading, Center, Spinner, Text, useColorModeValue } from '@chakra-ui/react'; 

const ChartCard = ({ title, children, isLoading, error = null, isEmpty = false }) => {
 
  const bgColor = useColorModeValue('white', 'gray.800'); 
  const titleColor = useColorModeValue('gray.600', 'gray.300'); 
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400'); 
  const errorTextColor = useColorModeValue('red.500', 'red.300');
 

  return (
   
    <Box bg={bgColor} p={5} borderRadius="lg" shadow="md">
      <Heading size="sm" mb={4} color={titleColor}>
        {title}
      </Heading>
      <Box minH="250px" display="flex" alignItems="center" justifyContent="center">
        {isLoading ? (
          <Spinner size="xl" />
        ) : error ? (
          <Text color={errorTextColor}>Error al cargar datos.</Text>
        ) : isEmpty ? (
           <Text color={emptyTextColor}>No hay datos para mostrar.</Text>
        ) : (
          children 
        )}
      </Box>
    </Box>


);
};

export default ChartCard;