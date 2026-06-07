import React from "react";
import {Box, Heading, Text, VStack, SimpleGrid} from "@chakra-ui/react";


const DatoItem = ({label, valor}) => (
    <Box>
        <Heading size="xs" textTransform="uppercase" color="gray.500">
            {label}
        </Heading>
        <Text fontSize="md" fontWeight="medium">
            {valor || "No especificado"}
        </Text>
    </Box>
);


export const TabDatosPersonales = ({paciente}) => {
    if (!paciente) return null;

    const fechaNac = paciente.fechaNacimiento
        ? new Date(paciente.fechaNacimiento).toLocaleDateString('es-AR')
        : "No especificado";


        return (
    <Box p={4}>
   
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <DatoItem label="Nombre" valor={paciente.nombre} />
        <DatoItem label="Apellido" valor={paciente.apellido} />
        <DatoItem label="DNI" valor={paciente.dni} />
        <DatoItem label="Fecha de Nacimiento" valor={fechaNac} />
        <DatoItem label="Teléfono" valor={paciente.telefono} />
        <DatoItem label="Email" valor={paciente.email} />
        <DatoItem label="Obra Social" valor={paciente.obraSocial?.nombre || 'N/A'} />
      </SimpleGrid>
    </Box>
  );
}