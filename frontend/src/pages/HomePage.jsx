import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Center,
  Text,
  List,
  ListItem,
  ListIcon,
  Icon,
  VStack,
  Divider,
  Button, 
  HStack, 
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiDollarSign, FiPlusCircle, FiUserPlus, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; 
import { turnoService } from '../services/TurnoService'; 
import { useAuth } from '../context/AuthContext'; 

import { format } from 'date-fns';
import { es } from 'date-fns/locale';


const StatCard = ({ title, stat, helpText, icon }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Stat
      px={{ base: 4, md: 8 }}
      py={'5'}
      shadow={'md'}
      border={'1px solid'}
      borderColor={borderColor}
      rounded={'lg'}
      bg={bgColor}
    >
      <StatLabel fontWeight={'medium'} isTruncated color="gray.500">
        {title}
      </StatLabel>
      
      <StatNumber fontSize={'2xl'} fontWeight={'medium'} color={textColor}> 
        {stat}
      </StatNumber>
     
      {helpText && (
        <StatHelpText>
          {icon && <Icon as={icon} mr={1} w={4} h={4} />}
          {helpText}
        </StatHelpText>
      )}
    </Stat>
  );
}

const TurnosHoyLista = ({ turnos }) => {
  const navigate = useNavigate();

  const itemBg = useColorModeValue('white', 'gray.700');
  const itemHoverBg = useColorModeValue('gray.100', 'gray.600');
  const textColorPrimary = useColorModeValue('gray.800', 'whiteAlpha.900');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  if (turnos.length === 0) {
    return <Text color="gray.500" fontSize="sm">No hay turnos programados para hoy.</Text>;
  }

  const getFechaValida = (t) => {
      const rawDate = t.fecha || t.fechaHora || t.start || t.Start;
      if (!rawDate) return null;
      const dateObj = new Date(rawDate);
      return isNaN(dateObj.getTime()) ? null : dateObj;
  };

  const turnosOrdenados = [...turnos].sort((a, b) => {
      const dateA = getFechaValida(a) || new Date(0);
      const dateB = getFechaValida(b) || new Date(0);
      return dateA - dateB;
  });

  const MAX_TURNOS = 5;
  const turnosAMostrar = turnosOrdenados.slice(0, MAX_TURNOS);
  const turnosOcultos = turnosOrdenados.length - MAX_TURNOS;

  const handleTurnoClick = (turno) => {
    navigate('/turnos'); 
  };

  return (
    <Box>
        <List spacing={3}>
          {turnosAMostrar.map((turno) => {
            const fechaObj = getFechaValida(turno);
            const horaLegible = fechaObj 
                ? format(fechaObj, 'HH:mm', { locale: es }) 
                : '--:--';

            return (
              <ListItem
                key={turno.id}
                p={3}
                bg={itemBg} 
                shadow="sm"
                borderRadius="md"
                borderLeft="4px solid"
                borderColor={turno.estaPagado ? 'green.400' : 'blue.400'}
                onClick={() => handleTurnoClick(turno)}
                cursor="pointer"
                _hover={{ bg: itemHoverBg, shadow: 'md' }} 
                transition="all 0.2s ease"
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Text fontWeight="bold" fontSize="sm" color={textColorPrimary}>
                            {`${turno.pacienteNombre || ''} ${turno.pacienteApellido || ''}`}
                        </Text>
                        <Text fontSize="xs" color={textColorSecondary}> 
                            <ListIcon as={FiClock} color="gray.500" />
                            {horaLegible} hs 
                        </Text>
                    </Box>
              
                    <Text fontSize="xs" color={turno.estaPagado ? 'green.500' : 'orange.500'} fontWeight="medium">
                      {turno.estado} {turno.estaPagado ? '(✔ Pagado)' : '(⏳ Debe)'}
                    </Text>
                </Box>
              </ListItem>
            );
          })}
        </List>

        {turnosOcultos > 0 && (
            <Button
                mt={4}
                w="full"
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={() => navigate('/turnos')}
            >
                Y {turnosOcultos} turnos más... (Ir al Calendario)
            </Button>
        )}
    </Box>
  );
};


const HomePage = () => {
  const [turnosHoy, setTurnosHoy] = useState([]);
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
      ingresosHoy: 0, 
    
     turnosPendientesHoy: 0,
  }); 
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      setLoadingTurnos(true);
      setLoadingStats(true); 

      try {
       
        let turnos = await turnoService.getTurnosDeHoy(); 
       if (user?.rol === 'Terapeuta') {
           
            turnos = turnos.filter(t => String(t.terapeutaId) === String(user.id));
        }
        setTurnosHoy(turnos);

        
     const ingresos = turnos
            .filter(t => t.estaPagado === true)
            .reduce((sum, t) => sum + (t.precio || 0), 0);
            
       
        const pendientes = turnos
            .filter(t => t.estado?.toLowerCase() === 'reservado' && !t.estaPagado)
            .length;
      
      setStats({ 
            ingresosHoy: ingresos, 
            turnosPendientesHoy: pendientes,
           
        });
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoadingTurnos(false);
        setLoadingStats(false);
      }
    };
    cargarDatos();
  }, [user]);

  const handleNuevoPacienteClick = () => {
    navigate('/pacientes', { state: { abrirModalNuevo: true } });
  };

  const boxBg = useColorModeValue('gray.50', 'gray.700'); 
  const headingColor = useColorModeValue('gray.700', 'gray.200'); 

  
  return (
    <Box>
      <Heading mb={6}>Inicio</Heading>

      
    <SimpleGrid columns={{ base: 1, md: 2, lg: user?.rol === 'Terapeuta' ? 2 : 3 }} spacing={6} mb={8}>
        <StatCard
          title={'Turnos de Hoy'}
          stat={loadingTurnos ? <Spinner size="sm"/> : turnosHoy.length}
          helpText={format(new Date(), "eeee, dd MMMM", { locale: es })}
          icon={FiCalendar}
        />
        {user?.rol !== 'Terapeuta' && (
            <StatCard
              title={'Ingresos del Día'}
              stat={loadingStats ? <Spinner size="sm"/> : `$ ${stats.ingresosHoy.toLocaleString('es-AR')}`}
              helpText="Solo turnos pagados hoy"
              icon={FiDollarSign}
            />
        )}
        <StatCard 
          title={'Turnos Pendientes (Hoy)'} 
          stat={loadingStats ? <Spinner size="sm"/> : stats.turnosPendientesHoy}
          helpText="Turnos por cobrar hoy"
          icon={FiAlertCircle} 
        />
      </SimpleGrid>

      <Divider my={8} />

  
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      
   
       <Box bg={boxBg} p={5} borderRadius="lg" shadow="sm" maxH="400px" overflowY="auto">
          <Heading size="md" mb={4} color={headingColor}>Próximos Turnos del Día</Heading>
          {loadingTurnos ? (
            <Center h="150px"><Spinner /></Center>
          ) : (
            <TurnosHoyLista turnos={turnosHoy} />
          )}
        </Box>

       
       <Box bg={boxBg} p={5} borderRadius="lg" shadow="sm">
           <Heading size="md" mb={4} color={headingColor}>Acciones Frecuentes</Heading>
           <VStack spacing={4} align="stretch">
             <Button
               leftIcon={<FiUserPlus />}
               colorScheme="blue" 
               variant="outline" 
               onClick={handleNuevoPacienteClick} 
               size="lg"
             >
               Registrar Nuevo Paciente
             </Button>
             <Button
               leftIcon={<FiPlusCircle />}
               colorScheme="teal" 
               variant="outline"
               onClick={() => navigate('/turnos')} 
               size="lg"
             >
               Agendar Nuevo Turno
             </Button>
           </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default HomePage;