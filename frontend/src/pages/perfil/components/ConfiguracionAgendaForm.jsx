import { useState, useEffect } from 'react';
import { 
    Box, VStack, FormControl, FormLabel, 
    NumberInput, NumberInputField, NumberInputStepper, 
    NumberIncrementStepper, NumberDecrementStepper, 
    Button, useToast, Text 
} from '@chakra-ui/react';
import axiosInstance from '../../../services/axiosInstance'; 

const ConfiguracionAgendaForm = () => {
    const [duracion, setDuracion] = useState(60);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

  
    useEffect(() => {
        axiosInstance.get('/configuracion/duracion')
            .then(res => {
                if(res.data && res.data.duracion) setDuracion(res.data.duracion);
            })
            .catch(err => console.error("Error cargando duración:", err));
    }, []);


    const handleGuardar = async () => {
        setLoading(true);
        try {
         
            await axiosInstance.put('/configuracion/duracion', duracion, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast({ title: 'Configuración guardada', status: 'success', duration: 3000 });
        } catch (error) {
            toast({ title: 'Error al guardar', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <VStack spacing={4} align="start" p={4} borderWidth="1px" borderRadius="lg">
            <Text fontSize="lg" fontWeight="bold">Preferencias de Agenda</Text>
            
            <FormControl>
                <FormLabel>Duración de Sesión (Minutos)</FormLabel>
                <Text fontSize="xs" color="gray.500" mb={2}>
                    Define la duración por defecto para los nuevos turnos y los horarios disponibles en la web pública.
                </Text>
                <NumberInput 
                    value={duracion} 
                    onChange={(valString, valNumber) => setDuracion(valNumber)}
                    min={15} max={180} step={5}
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </FormControl>

            <Button colorScheme="blue" onClick={handleGuardar} isLoading={loading}>
                Guardar Cambios
            </Button>
        </VStack>
    );
};

export default ConfiguracionAgendaForm;