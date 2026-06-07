
import React, { useState } from 'react';
import {
  Box, Heading, Button, useDisclosure, useToast, HStack, Center, Spinner, useColorModeValue,
  Input, Switch, FormControl, FormLabel
} from '@chakra-ui/react';
import { FiUserPlus } from 'react-icons/fi';

import { useUsuarios } from '../../hooks/useUsuarios';
import { usuarioService } from '../../services/UsuarioService';
import TablaUsuarios from './components/TablaUsuarios';
import ModalUsuarioABM from './components/ModalUsuarioABM';
import ModalResetClave from './components/ModalResetClave';
import ModalDisponibilidad from './components/ModalDisponibilidad';
import Pagination from '../../components/ui/Pagination';

const UsuariosPage = () => {
const { 
    usuarios, loading, currentPage, totalPages, totalItems, pageSize, filtros,
    cambiarPagina, aplicarFiltros, cambiarTamanio, recargarUsuarios
  } = useUsuarios();
 const toast = useToast();
  const boxBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('white', 'gray.700');

  const { isOpen: isABMOpen, onOpen: onABMOpen, onClose: onABMClose } = useDisclosure();
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const { isOpen: isHorariosOpen, onOpen: onHorariosOpen, onClose: onHorariosClose } = useDisclosure();
  
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const abrirModalCrear = () => {
    setUsuarioActual(null);
    onABMOpen();
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioActual(usuario);
    onABMOpen();
  };

  const handleGuardarUsuario = async (formData) => {
    setIsSubmitting(true);
    try {
      if (usuarioActual) {
        await usuarioService.actualizarUsuario(usuarioActual.id, formData);
        toast({ title: 'Usuario actualizado', status: 'success' });
      } else {
        await usuarioService.crearUsuario(formData);
        toast({ title: 'Usuario creado', status: 'success' });
      }
      recargarUsuarios();
      onABMClose();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Verifique los datos', status: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      await usuarioService.toggleEstadoUsuario(id);
      toast({ 
        title: estadoActual ? 'Usuario Bloqueado' : 'Usuario Desbloqueado', 
        status: estadoActual ? 'warning' : 'success' 
      });
      recargarUsuarios();
    } catch (error) {
      toast({ title: 'Error al cambiar estado', status: 'error' });
    }
  };

  const handleResetClave = async (nuevaClave) => {
    setIsSubmitting(true);
    try {
      await usuarioService.blanquearClave(usuarioActual.id, nuevaClave);
      toast({ title: 'Contraseña reseteada con éxito', status: 'success' });
      onResetClose();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo resetear la clave', status: 'error' });
    }
    setIsSubmitting(false);
  };



  return (
    <Box>
      <Heading mb={6}>Gestión de Personal</Heading>

       <Box bg={boxBg} p={4} borderRadius="md" shadow="sm" mb={6}>
        <HStack spacing={4} wrap="wrap" align="flex-end" justify="space-between">
          <HStack spacing={4} flex="1">
            <FormControl flex="1" minW="200px" maxW="400px">
              <FormLabel fontSize="sm">Buscar Usuario</FormLabel>
              <Input
                placeholder="Nombre, apellido, usuario o email..."
                value={filtros.busqueda}
                onChange={(e) => aplicarFiltros({ busqueda: e.target.value })}
                bg={inputBg}
                size="sm"
              />
            </FormControl>
          </HStack>
          
          <Button leftIcon={<FiUserPlus />} colorScheme="blue" size="sm" onClick={abrirModalCrear}>
            Nuevo Usuario
          </Button>
        </HStack>

        <HStack mt={4}>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="mostrar-inactivos" mb="0" fontSize="sm" cursor="pointer">
              Mostrar Inactivos (Bloqueados)
            </FormLabel>
            <Switch
              id="mostrar-inactivos"
              colorScheme="red"
              isChecked={filtros.mostrarInactivos}
              onChange={(e) => aplicarFiltros({ mostrarInactivos: e.target.checked })}
            />
          </FormControl>
        </HStack>
      </Box>

      <Box bg={boxBg} p={4} borderRadius="md" shadow="md" position="relative">
        {loading && usuarios.length === 0 ? (
          <Center h="200px">
            <Spinner size="xl" />
          </Center>
        ) : (
          <Box position="relative">
            {loading && (
              <Box position="absolute" top="0" left="0" right="0" bottom="0" bg={useColorModeValue('whiteAlpha.700', 'blackAlpha.600')} zIndex="2" display="flex" justifyContent="center" pt="10">
                <Spinner size="lg" color="blue.500" />
              </Box>
            )}

            <Box opacity={loading ? 0.4 : 1} pointerEvents={loading ? "none" : "auto"} transition="opacity 0.2s">
              <TablaUsuarios 
                usuarios={usuarios} 
                onEdit={abrirModalEditar} 
                onResetClave={(u) => { setUsuarioActual(u); onResetOpen(); }} 
                onToggleEstado={handleToggleEstado} 
                onManageHorarios={(u) => { setUsuarioActual(u); onHorariosOpen(); }}
              />
              
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={cambiarPagina}
                onPageSizeChange={cambiarTamanio}
              />
            </Box>
          </Box>
        )}
      </Box>

      <ModalUsuarioABM isOpen={isABMOpen} onClose={onABMClose} usuarioActual={usuarioActual} onSave={handleGuardarUsuario} isSubmitting={isSubmitting} />
      <ModalResetClave isOpen={isResetOpen} onClose={onResetClose} usuarioActual={usuarioActual} onConfirm={handleResetClave} isSubmitting={isSubmitting} />
      <ModalDisponibilidad isOpen={isHorariosOpen} onClose={onHorariosClose} usuarioActual={usuarioActual} />
    </Box>
  );
};
export default UsuariosPage;