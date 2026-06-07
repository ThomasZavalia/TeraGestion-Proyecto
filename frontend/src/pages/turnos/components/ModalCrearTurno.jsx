import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Radio, RadioGroup, Stack, Input, Switch, Select,
  InputGroup, InputLeftAddon, VStack, Heading, Text,FormErrorMessage, useColorModeValue,
} from '@chakra-ui/react';
import { AsyncSelect } from 'chakra-react-select'; 
import { format } from 'date-fns'; 
import { es } from 'date-fns/locale'; 
import { useTurnoForm } from '../../../hooks/useTurnoForm';

const ModalCrearTurno = ({ isOpen, onClose, config, isEditingMode }) => {
  const modalBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('white', 'gray.700');

const {
    pacienteTipo, setPacienteTipo,
    pacienteSeleccionado, setPacienteSeleccionado,
    nombrePaciente, setNombrePaciente,
    apellidoPaciente, setApellidoPaciente,
    dni, setDni,
    
    obraSocialId, setObraSocialId,
    precio, setPrecio,
    obrasSocialesList,
    isSubmitting,
    isLoadingPrecio, 
    loadPacientes,
    handleSubmit,
    dniError,
    validateDni,
    terapeutaId, setTerapeutaId, 
    terapeutasList,
  } = useTurnoForm(config);
 return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <ModalHeader>
        
          <Heading size="md">{isEditingMode ? 'Editar Turno' : 'Crear Nuevo Turno'}</Heading>
        
          {!isEditingMode && config.selectedDate && ( 
             <Text fontSize="sm" color="gray.500" fontWeight="normal">
               {format(config.selectedDate, "eeee dd 'de' MMMM, yyyy 'a las' HH:mm 'hs'", { locale: es })}
             </Text>
          )}
        </ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        
        <ModalBody>
          <VStack spacing={4}>
          {!isEditingMode && (
              <FormControl isRequired>
                <FormLabel>Profesional Asignado</FormLabel>
                <Select
                  value={terapeutaId}
                  isDisabled={true} 
                  bg={useColorModeValue('gray.100', 'gray.600')} 
                >
                  {terapeutasList.map(t => (
                    <option key={t.id} value={t.id}>
        {t.nombreCompletoProfesional || t.nombreCompleto} {t.especialidad ? `- ${t.especialidad}` : ''}
     </option>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl isDisabled={isEditingMode}>
              <FormLabel>Paciente</FormLabel>
              <RadioGroup value={pacienteTipo} onChange={setPacienteTipo}>
                <Stack direction="row" spacing={5}>
                  <Radio value="existente">Paciente Existente</Radio>
                
                  {!isEditingMode && <Radio value="nuevo">Paciente Nuevo</Radio>} 
                </Stack>
              </RadioGroup>
            </FormControl>

            
            {pacienteTipo === 'existente' && (
              <FormControl isRequired isDisabled={isEditingMode}> 
                <FormLabel>Paciente</FormLabel> 
                <AsyncSelect
                  key={isEditingMode ? `edit-${pacienteSeleccionado?.value}` : 'create-select'} 
                  value={pacienteSeleccionado} 
                  placeholder={isEditingMode ? (pacienteSeleccionado?.label || 'Cargando...') : "Escribe un nombre..."} 
                  loadOptions={loadPacientes}
                  onChange={setPacienteSeleccionado}
                  isClearable={!isEditingMode} 
                  cacheOptions={!isEditingMode} 
                  defaultOptions={!isEditingMode} 
                  isDisabled={isEditingMode} 
                />
              </FormControl>
            )}
            
           {pacienteTipo === 'nuevo' && !isEditingMode && ( 
  <VStack spacing={4} w="full" as="fieldset" border="1px" borderColor="gray.200" p={4} borderRadius="md">

  
    <FormControl isRequired>
      <FormLabel>Nombre</FormLabel>
      <Input 
        value={nombrePaciente} 
        onChange={(e) => setNombrePaciente(e.target.value)} 
        placeholder="Nombre del paciente" 
        
      />
    </FormControl>

    <FormControl isRequired>
      <FormLabel>Apellido</FormLabel>
      <Input 
        value={apellidoPaciente} 
        onChange={(e) => setApellidoPaciente(e.target.value)} 
        placeholder="Apellido del paciente" 
      />
    </FormControl>

   <FormControl isInvalid={!!dniError}> 
          <FormLabel>DNI</FormLabel>
          <Input 
            value={dni} 
            onChange={(e) => setDni(e.target.value)} 
            placeholder="DNI (sin puntos)"
           
            onBlur={(e) => validateDni(e.target.value)} 
          />
      
          {dniError && <FormErrorMessage>{dniError}</FormErrorMessage>}
        </FormControl>
   

  </VStack>
  )}

             
           <FormControl isRequired>
              <FormLabel>Cobertura / Obra Social</FormLabel>
              <Select
                placeholder="Seleccione..."
               
                value={obraSocialId ? String(obraSocialId) : ''}
                onChange={(e) => setObraSocialId(e.target.value ? parseInt(e.target.value) : null)}
                isDisabled={isLoadingPrecio}
                bg={inputBg}
              >
                {obrasSocialesList.map(os => (
                  <option key={os.value} value={os.value}>{os.label}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Precio {isEditingMode ? '(Actual)' : '(Automático)'}</FormLabel>
              <InputGroup>
                <InputLeftAddon>$</InputLeftAddon>
                <Input 
                    value={precio} 
                
                    isDisabled={true} 
                    bg={inputBg} 
                /> 
              </InputGroup>
            </FormControl>
            
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}> Cancelar </Button>
          <Button 
            colorScheme="blue" 
            type="submit"
            isLoading={isSubmitting}
            loadingText={isEditingMode ? "Actualizando..." : "Guardando..."}
          >
            {isEditingMode ? 'Actualizar Turno' : 'Guardar Turno'} 
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalCrearTurno;