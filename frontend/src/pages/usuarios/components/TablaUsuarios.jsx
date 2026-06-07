import React from 'react';
import {
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  IconButton, Badge, Tooltip, HStack, Text
} from '@chakra-ui/react';
import { FiEdit, FiLock, FiUnlock, FiKey,FiClock, } from 'react-icons/fi';

const TablaUsuarios = ({ usuarios, onEdit, onResetClave, onToggleEstado, onManageHorarios }) => {
  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Empleado</Th>
            <Th>Usuario / Email</Th>
            <Th>Rol</Th>
            <Th>Estado</Th>
            <Th textAlign="center">Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {usuarios.map((u) => (
            <Tr key={u.id}>
              <Td><Text fontWeight="bold">{u.nombre} {u.apellido}</Text></Td>
              <Td>
                <Text>{u.username}</Text>
                <Text fontSize="xs" color="gray.500">{u.email}</Text>
              </Td>
              <Td>
                <Badge colorScheme={u.rol === 'Admin' ? 'red' : u.rol === 'Secretaria' ? 'blue' : 'green'}>
                  {u.rol}
                </Badge>
              </Td>
              <Td>
                <Badge colorScheme={u.activo ? 'green' : 'red'}>
                  {u.activo ? 'Activo' : 'Bloqueado'}
                </Badge>
              </Td>
              <Td textAlign="center">
                <HStack justify="center" spacing={2}>
                  <Tooltip label="Editar datos">
                    <IconButton size="sm" icon={<FiEdit />} onClick={() => onEdit(u)} isDisabled={!u.activo} onFocus={(e) => e.preventDefault()} />
                  </Tooltip>
                  <Tooltip label="Blanquear Clave">
                    <IconButton size="sm" icon={<FiKey />} colorScheme="yellow" onClick={() => onResetClave(u)} isDisabled={!u.activo} />
                  </Tooltip>
                  <Tooltip label={u.activo ? "Bloquear Acceso" : "Desbloquear Acceso"}>
                    <IconButton 
                      size="sm" 
                      icon={u.activo ? <FiLock /> : <FiUnlock />} 
                      colorScheme={u.activo ? 'red' : 'green'} 
                      variant="outline"
                      onClick={() => onToggleEstado(u.id, u.activo)} 
                    />
                  </Tooltip>
                  {u.rol === 'Terapeuta' && (
          <Tooltip label="Gestionar Horarios">
            <IconButton 
              size="sm" 
              icon={<FiClock />} 
              colorScheme="purple" 
              onClick={() => onManageHorarios(u)} 
              isDisabled={!u.activo} 
            />
          </Tooltip>
        )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default TablaUsuarios;