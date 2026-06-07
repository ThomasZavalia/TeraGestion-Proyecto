import { Box, VStack, Heading, Text, Link } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiSettings,
  FiBarChart2,
  FiBriefcase,
  FiShield,
  FiUserCheck,
} from 'react-icons/fi';

const NavItem = ({ icon, children, to, isOpen, onClose, isDesktop }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
   
    if (!isDesktop && isOpen) {
      onClose(); 
    }
    
  };

  return (
    <Link
      as={RouterLink}
      to={to}
      _hover={{ textDecoration: 'none' }}
      w="full"
      onClick={handleClick}
    >
      <Box
        display="flex"
        alignItems="center"
        p="3"
        mx="2"
        borderRadius="lg"
        bg={isActive ? 'blue.500' : 'transparent'}
        color={isActive ? 'white' : 'gray.300'}
        _hover={{
          bg: 'gray.700',
          color: 'white',
        }}
        transition="background 0.2s ease"
      >
     
        <Box as={icon} fontSize="20" />
        
       
        {isOpen && (
          <Text ml="4" fontSize="sm" fontWeight="medium">
            {children}
          </Text>
        )}
      </Box>
    </Link>
  );
};


const Sidebar = ({ width, isOpen, display, onClose, isDesktop }) => {
  
  const { user } = useAuth();

  console.log("Usuario en el SideBar:", user);
  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      h="100vh"
      w={width}
      bg="gray.800"
      color="white"
      display={display} 
      transition="width 0.2s ease-in-out" 
      zIndex="sticky" 
      overflowY="auto"
    >
      <VStack align="stretch" h="full">
       
        <Heading
          size="md"
          textAlign="center"
          py="5"
          borderBottomWidth="1px"
          borderColor="gray.700"
        >
          {isOpen ? 'TeraGestión' : 'TG'}
        </Heading>

       <VStack spacing="2" align="stretch" mt="4" as="nav" flex="1">
          <NavItem to="/" icon={FiHome} isOpen={isOpen} onClose={onClose} isDesktop={isDesktop}>
            Dashboard
          </NavItem>
          <NavItem to="/turnos" icon={FiCalendar} isOpen={isOpen} onClose={onClose} isDesktop={isDesktop}>
            Turnos
          </NavItem>
          <NavItem to="/pacientes" icon={FiUsers} isOpen={isOpen} onClose={onClose} isDesktop={isDesktop}>
            Pacientes
          </NavItem>

          {(user?.rol === 'Admin' || user?.rol === 'Secretaria') && (
              <NavItem to="/obras-sociales" icon={FiBriefcase} isOpen={isOpen} onClose={onClose} isDesktop={isDesktop}>
                Obras Sociales
              </NavItem>
          )}
       {(user?.rol === 'Admin' || user?.rol === 'Secretaria') && (
              <NavItem to="/pagos" icon={FiDollarSign} isOpen={isOpen} onClose={onClose} isDesktop={isDesktop}>
                Pagos
              </NavItem>
          )}
            {(user?.rol === 'Admin' || user?.rol === 'Terapeuta') && (
              <NavItem to="/reportes" icon={FiBarChart2} isOpen={isOpen} onClose={onClose} isDesktop={isDesktop}>
                {user?.rol === 'Admin' ? 'Reportes' : 'Mi Rendimiento'}
              </NavItem>
          )}
        </VStack>

     
  
        <VStack spacing="2" align="stretch" mb="4" as="nav">
            
            {/* Todos pueden entrar a Configuración */}
            <NavItem to="/configuracion" icon={FiSettings} isOpen={isOpen} onClose={onClose} isDesktop={isDesktop}>
              Configuración
            </NavItem>

            {user?.rol === 'Admin' && (
              <>
                <NavItem to="/auditoria" icon={FiShield} isOpen={isOpen} onClose={onClose} isDesktop={isDesktop}>
                  Auditoría
                </NavItem>
                 <NavItem to="/usuarios" icon={FiUserCheck} isOpen={isOpen} onClose={onClose} isDesktop={isDesktop}>
                  Usuarios
                </NavItem>
              </>
            )}
            
        </VStack>
        
      </VStack>
    </Box>
  );
};


export default Sidebar;