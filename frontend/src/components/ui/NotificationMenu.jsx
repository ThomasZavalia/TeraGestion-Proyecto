import {
  IconButton, Menu, MenuButton, MenuList, MenuItem, 
  Box, Text, Badge, VStack, Divider, Center
} from '@chakra-ui/react';
import { FiBell } from 'react-icons/fi';
import { useSignalR } from '../../context/SignalRContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const NotificationMenu = () => {
  const { notificaciones, unreadCount, marcarLeida } = useSignalR();
  const navigate = useNavigate();

  const handleNotificationClick = (notif) => {
    
      marcarLeida(notif.id);
      
    
      navigate('/turnos'); 
  };

  return (
    <Menu isLazy>
    <MenuButton 
        as={IconButton} 
        aria-label="Notificaciones" 
        icon={
          <Box position="relative">
            <FiBell size={22} /> 
            {unreadCount > 0 && (
              <Badge 
                position="absolute" 
                top="-2px" 
                right="-2px" 
                bg="red.500" 
                color="white"
                borderRadius="full" 
                boxSize="18px" 
                border="2px solid white"
                textAlign="center"
                fontSize="xs"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="base"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Box>
        }
        variant="ghost"
        _hover={{ bg: 'gray.100' }}
      />
      <MenuList p={0} maxH="400px" overflowY="auto" w="350px" shadow="lg">
        <Box p={3} bg="gray.50">
          <Text fontWeight="bold" fontSize="sm">Notificaciones</Text>
        </Box>
        <Divider />
        
        {notificaciones.length === 0 ? (
          <Center p={6}>
            <Text color="gray.500" fontSize="sm">No tienes notificaciones.</Text>
          </Center>
        ) : (
          notificaciones.map((notif) => (
            <MenuItem 
              key={notif.id} 
             onClick={() => handleNotificationClick(notif)}
              bg={notif.leida ? 'white' : 'blue.50'}
              _hover={{ bg: 'gray.100' }}
              p={3}
            >
              <VStack align="start" spacing={1} w="100%">
                <Text fontWeight={notif.leida ? "normal" : "bold"} fontSize="sm">
                  {notif.titulo}
                </Text>
                <Text fontSize="xs" color="gray.600" noOfLines={2}>
                  {notif.mensaje}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {notif.fecha ? format(new Date(notif.fecha), 'dd MMM HH:mm', { locale: es }) : 'Reciente'}
                </Text>
              </VStack>
            </MenuItem>
          ))
        )}
      </MenuList>
    </Menu>
  );
};

export default NotificationMenu;