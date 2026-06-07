import React from "react";
import {Box, Heading, Spinner,
    Alert, AlertIcon, Tabs, TabList, TabPanels, Tab, TabPanel, Button
} from "@chakra-ui/react";
import {ArrowBackIcon} from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { usePacienteDetalles } from "../../hooks/usePacienteDetalles";
import { TabDatosPersonales } from "./component/TabDatosPersonales";
import { TabHistorialPagos } from "./component/TabHistorialPagos";
import { TabHistorialSesiones } from "./component/TabHistorialSesiones";

import { useAuth } from "../../context/AuthContext";


export const PacienteDetallePage = () => {

    const navigate = useNavigate();
    const { detalles, loading, error, recargarDetalles } = usePacienteDetalles();

    const { user } = useAuth();

    if(loading){
        return(
            <Box display="flex" justifyContent="center" p={10}>
                <Spinner size="xl" />
            </Box>
        );
    }


    if(error){
        return(
            <Alert status="error" m={4}>
                <AlertIcon />
                Error al cargar los detalles del paciente: {error.message}
            </Alert>
        );
    }


    const paciente = detalles;

const esTerapeuta = user?.rol === 'Terapeuta';

    return(
        <Box p={4}>
            <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate('/pacientes')} mb={4}>
                Volver a la lista de pacientes
            </Button>
            <Box maxWidth="1200px" mx="auto">
            <Heading mb={4}>{paciente?.nombre} {paciente?.apellido}</Heading>

            <Tabs colorScheme="teal">
                <TabList>
                    <Tab>Datos Personales</Tab>
                    {esTerapeuta && <Tab>Historial de Sesiones</Tab>}
                   {!esTerapeuta && <Tab>Historial de Pagos</Tab>}
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <TabDatosPersonales paciente={paciente} />
                    </TabPanel>

                   {esTerapeuta && (
                            <TabPanel>
                                <TabHistorialSesiones pacienteId={paciente?.id} />
                            </TabPanel>
                        )}

                   {!esTerapeuta && (
                            <TabPanel>
                                <TabHistorialPagos 
                                    pacienteId={paciente?.id}
                                    tienePagosPendientes={paciente?.tienePagosPendientes}
                                    cantidadPendientes={paciente?.cantidadTurnosPendientesPago}
                                />
                            </TabPanel>
                        )}
                </TabPanels>
            </Tabs>
            </Box>

        </Box>
    )
}