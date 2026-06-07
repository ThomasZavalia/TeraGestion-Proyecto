import {
  Box,
  Flex,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Text,
  useColorMode,
  useBreakpointValue, 
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMenu, FiSearch, FiSun, FiMoon } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { AsyncSelect } from 'chakra-react-select';
import { pacienteService } from '../services/PacienteService';
import NotificationMenu from '../components/ui/NotificationMenu';

const Navbar = ({ onToggleSidebar, isDesktop }) => { 
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { colorMode, toggleColorMode } = useColorMode();

  const navBg = useColorModeValue('white', 'gray.800');
  const navBorderColor = useColorModeValue('gray.200', 'gray.700');
 
  const selectBg = useColorModeValue('gray.50', 'gray.700');
  const selectBorderColor = useColorModeValue('gray.200', 'gray.600');

const handleLogout = () => {
    logout(); 
   
    window.location.href = '/login'; 
  };

  const loadPacienteOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 3) return []; 
    
   
    return pacienteService.buscarPacientes(inputValue); 
  };

  const handlePacienteChange = (selectedOption) => {
    if (selectedOption) {
      console.log("Navegando a paciente:", selectedOption.value);
    
      navigate(`/pacientes/${selectedOption.value}`);
      
    
    }
  };

const selectStyles = {
    control: (provided) => ({
      ...provided,
      bg: selectBg,
      borderRadius: 'md',
      borderColor: selectBorderColor, 
      _hover: {
          borderColor: useColorModeValue('gray.300', 'gray.500')
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: 'sm',
      color: useColorModeValue('gray.400', 'gray.500') 
    }),
    input: (provided) => ({
      ...provided,
      fontSize: 'sm',
      
    }),
  
    menu: (provided) => ({
        ...provided,
        bg: navBg, 
        zIndex: 20 
    }),
    option: (provided, state) => ({
        ...provided,
        bg: state.isFocused ? useColorModeValue('gray.100', 'gray.600') : 'transparent',
    })
  };

  return (
   <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      px="4"
      bg={navBg} 
      borderBottomWidth="1px"
      borderColor={navBorderColor} 
      h="14" 
    >
      
     <IconButton
        aria-label="Toggle Sidebar"
        icon={<FiMenu />}
        variant="ghost"
        onClick={onToggleSidebar} 
      />

    <Box 
        w={{ base: 'full', md: 'md' }} 
        mx="4" 
        display={{ base: 'none', md: 'block' }} 
      >
        <AsyncSelect
          placeholder="Buscar paciente por nombre, apellido o DNI..."
          loadOptions={loadPacienteOptions} 
          onChange={handlePacienteChange}
          chakraStyles={selectStyles} 
          noOptionsMessage={({ inputValue }) => 
             inputValue.length < 3 ? 'Escribe al menos 3 letras...' : 'No se encontraron pacientes'
          }
          loadingMessage={() => 'Buscando...'}
        />
      </Box>
<HStack spacing={{ base: '2', md: '4' }}>

      
        <IconButton
          aria-label="Cambiar modo de color"
          variant="ghost"
         
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
          onClick={toggleColorMode} 
        />
      
      
       
       <NotificationMenu />
       
       
     <Menu>
          <MenuButton as={Box} cursor="pointer">
            <Avatar size={'sm'} name={user?.username || '?'} /> 
            <Text fontSize="sm" display={{ base: 'none', md: 'inline' }} ml={2}>
              {user?.username}
            </Text>
          </MenuButton>
          <MenuList>
            
            {user?.rol === 'Admin' && (
               <MenuItem onClick={() => navigate('/configuracion')}>
                 Configuración
               </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              Cerrar Sesión
            </MenuItem>
          </MenuList>
        </Menu>
        
      </HStack>

    </Flex>
  );
};

export default Navbar;