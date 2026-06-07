import React, { useState } from "react";
import {
    Table, Thead, Tbody, Tr, Th, Td, 
    TableContainer, IconButton, HStack, Tooltip,Center,
    
    useColorModeValue, Tag 
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";

import { FiEdit, FiEye, FiEyeOff } from "react-icons/fi"; 
import { useNavigate } from "react-router-dom";


export const TablaPacientes = ({ pacientes, onEditar, onEliminar, onReactivar }) => {
    


    const navigate = useNavigate();

    const headerBg = useColorModeValue('gray.50', 'gray.700');
    const tableBorder = useColorModeValue('gray.200', 'gray.700');
    const rowHoverBg = useColorModeValue('gray.50', 'gray.700');
    const emptyText = useColorModeValue('gray.500', 'gray.400');

    const formatFecha = (fechaString) => {
        try {
            
            const fecha = new Date(fechaString); 
           
            if (isNaN(fecha.getTime())) return 'N/A';
            
            
            const localFecha = new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
            return localFecha.toLocaleDateString('es-AR', { timeZone: 'UTC' }); 
        } catch (e) {
            return 'N/A';
        }
    }



    return (
        <TableContainer>
            <Table>
              <Thead bg={headerBg}>
                    <Tr>
                        <Th>Nombre</Th>
                        <Th>Dni</Th>
                        <Th>Telefono</Th>
                        <Th>Obra Social</Th>
                        <Th>Estado</Th> 
                        <Th>Acciones</Th>
                    </Tr>
                </Thead>
               <Tbody>
                    {pacientes.length === 0 ? (
                        <Tr><Td colSpan={6}><Center p={4} color={emptyText}>No se encontraron pacientes.</Center></Td></Tr>
                    ) : (
                        pacientes.map((paciente) => (
                            
                            <Tr 
                              key={paciente.id} 
                              _hover={{ bg: rowHoverBg }} 
                              opacity={paciente.activo ? 1 : 0.5} 
                            >
                                <Td>{paciente.nombre} {paciente.apellido}</Td>
                                <Td>{paciente.dni}</Td>
                                <Td>{paciente.telefono || 'N/A'}</Td> 
                                <Td>{paciente.obraSocial ? paciente.obraSocial.nombre : "Particular"}</Td>
                                
                              
                                <Td>
                                    <Tag size="sm" colorScheme={paciente.activo ? 'green' : 'red'}>
                                        {paciente.activo ? 'Activo' : 'Inactivo'}
                                    </Tag>
                                </Td>

                                <Td>
                                    <HStack spacing={1}> 
                                        
                                      
                                       <Tooltip label="Editar Paciente" fontSize="xs">
                                            <IconButton 
                                                icon={<FiEdit />} 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => onEditar(paciente)}
                                            
                                                onFocus={(e) => e.preventDefault()}
                                            />
                                        </Tooltip>

                                        <Tooltip label="Ver Ficha Completa" fontSize="xs">
                                            <IconButton 
                                                icon={<ViewIcon />} 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => navigate(`/pacientes/${paciente.id}`)} 
                                                
                                                onFocus={(e) => e.preventDefault()}
                                            />
                                        </Tooltip>

                                        {paciente.activo ? (
                                            <Tooltip label="Desactivar Paciente" fontSize="xs">
                                                <IconButton 
                                                    icon={<FiEyeOff />} 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    colorScheme="red" 
                                                    onClick={() => onEliminar(paciente)} 
                                                    
                                                    onFocus={(e) => e.preventDefault()}
                                                />
                                            </Tooltip>
                                        ) : (
                                            <Tooltip label="Reactivar Paciente" fontSize="xs">
                                                <IconButton 
                                                    icon={<FiEye />} 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    colorScheme="green" 
                                                    onClick={() => onReactivar(paciente)} 
                                                  
                                                    onFocus={(e) => e.preventDefault()}
                                                />
                                            </Tooltip>
                                        )}
                                       
                                    </HStack>
                            </Td>
                      </Tr>
                        ))
                    )}
                </Tbody>
            </Table>
        </TableContainer>
    )
}