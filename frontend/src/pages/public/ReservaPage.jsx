import { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack,
  Button, Input, FormControl, FormLabel, Select,
  SimpleGrid, useToast, Divider, Card, CardBody,
  FormErrorMessage, Flex, Spacer, Link, Icon,
  useColorModeValue 
} from '@chakra-ui/react';
import { FiCalendar, FiCheckCircle, FiLogIn, FiUser, FiClock,FiCheck,FiMail } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { publicService } from '../../services/PublicService';


const PublicHeader = () => {
  const bg = useColorModeValue('white', 'gray.800');
  return (
    <Flex as="nav" align="center" justify="space-between" wrap="wrap" padding="1.5rem" bg={bg} boxShadow="sm" position="sticky" top="0" zIndex="999">
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={'-.1rem'} color="blue.600">
          TeraGestión
        </Heading>
      </Flex>
      <Spacer />
      <Button 
        as={RouterLink} 
        to="/login" 
        colorScheme="gray" 
        variant="ghost" 
        leftIcon={<FiLogIn />}
        size="sm"
      >
        Soy Profesional
      </Button>
    </Flex>
  );
};


const StepIndicator = ({ currentStep }) => {
    const steps = [
        { num: 1, label: "Fecha" },
        { num: 2, label: "Datos" },
        { num: 3, label: "Confirmación" }
    ];
    return (
        <HStack w="full" justify="center" spacing={4} mb={6}>
            {steps.map((s) => (
                <HStack key={s.num} spacing={2}>
                    <Flex 
                        align="center" justify="center" w="8" h="8" rounded="full" 
                        bg={s.num <= currentStep ? "blue.500" : "gray.200"} 
                        color={s.num <= currentStep ? "white" : "gray.500"}
                        fontWeight="bold" fontSize="sm"
                    >
                        {s.num < currentStep ? <FiCheck /> : s.num}
                    </Flex>
                    <Text fontSize="sm" fontWeight={s.num === currentStep ? "bold" : "normal"} display={{ base: 'none', md: 'block' }}>
                        {s.label}
                    </Text>
                    {s.num < 3 && <Box w="10" h="2px" bg={s.num < currentStep ? "blue.500" : "gray.200"} display={{ base: 'none', md: 'block' }} />}
                </HStack>
            ))}
        </HStack>
    );
};

const ReservaPage = () => {
  const [step, setStep] = useState(1);
  const [fecha, setFecha] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [obrasSociales, setObrasSociales] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dni: '', email: '', telefono: '', obraSocialId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const bgPage = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    publicService.getObrasSociales().then(setObrasSociales);
    
    publicService.getTerapeutas().then(setTerapeutas);
  }, []);

  const handleFechaChange = async (e) => {
    const nuevaFecha = e.target.value;
    setFecha(nuevaFecha);
    setHorarios([]);
    setHoraSeleccionada(null);
    if (!terapeutaSeleccionado) {
        toast({ title: "Selecciona un profesional primero", status: "warning" });
        return;
    }
    if (nuevaFecha) {
      setLoading(true);
      try {
        const dateObj = new Date(nuevaFecha);
        const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
       const slots = await publicService.getDisponibilidad(adjustedDate, terapeutaSeleccionado);
        setHorarios(slots);
      } catch (error) {
        toast({ title: "Error al cargar horarios", status: "error" });
      } finally { setLoading(false); }
    }
  };

  const handleHoraClick = (hora) => {
    setHoraSeleccionada(hora);
    setErrors({});
    setStep(2);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.nombre.trim()) nuevosErrores.nombre = "Requerido";
    if (!formData.apellido.trim()) nuevosErrores.apellido = "Requerido";
    if (!formData.dni) nuevosErrores.dni = "Requerido";
    else if (!/^[0-9]{7,8}$/.test(formData.dni)) nuevosErrores.dni = "DNI inválido (7-8 números)";
    if (!formData.email) nuevosErrores.email = "Requerido";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) nuevosErrores.email = "Email inválido";
    if (!formData.obraSocialId) nuevosErrores.obraSocialId = "Seleccione una opción";
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
        toast({ title: "Datos incompletos", status: "warning" });
        return;
    }

    setLoading(true);
    try {
    
      let token = "";
      if (executeRecaptcha) {
          token = await executeRecaptcha('reserva_turno');
      } else {
          console.warn("Recaptcha no disponible aún.");
          
      }
    

      const fechaCompleta = `${fecha}T${horaSeleccionada}:00`;
      const payload = {
        fechaHora: new Date(fechaCompleta).toISOString(),
        ...formData,
        obraSocialId: formData.obraSocialId ? parseInt(formData.obraSocialId) : null,
        terapeutaId: parseInt(terapeutaSeleccionado),
        recaptchaToken: token 
      };
      
      await publicService.reservar(payload);
      setStep(3);
    } catch (error) {
      const mensajeBackend = error.response?.data?.error || "Ocurrió un error al reservar.";
      toast({ title: "No se pudo reservar", description: mensajeBackend, status: "error", duration: 5000, isClosable: true });
    } finally { setLoading(false); }
  };
  return (
    <Box bg={bgPage} minH="100vh">
      
      <PublicHeader />

      <Container maxW="lg" py={10}>
        <Card shadow="xl" borderRadius="xl" overflow="hidden">
          
           <Box h="2" bg="blue.500" w="full" />
           
          <CardBody p={{ base: 4, md: 8 }}>
            <VStack spacing={6}>
              
              <VStack spacing={1}>
                  <Heading size="lg" textAlign="center">Reserva tu Turno</Heading>
                  <Text color="gray.500" textAlign="center">Selecciona el día y horario que prefieras.</Text>
              </VStack>

              
              <StepIndicator currentStep={step} />
              
             
            {step === 1 && (
                <VStack w="full" spacing={6} align="stretch">
                  
                  {/* ⭐ NUEVO SELECT DE PROFESIONAL ⭐ */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">1. ¿Con qué profesional te atenderás?</FormLabel>
                    <Select 
                        placeholder="Selecciona un profesional..." 
                        size="lg"
                        value={terapeutaSeleccionado}
                        onChange={(e) => {
                            setTerapeutaSeleccionado(e.target.value);
                            setFecha(''); // Limpiamos fecha si cambia de médico
                            setHorarios([]);
                        }}
                    >
                        {terapeutas.map(t => (
                            <option key={t.id} value={t.id}>{t.nombreCompleto}</option>
                        ))}
                    </Select>
                  </FormControl>

                  <FormControl isDisabled={!terapeutaSeleccionado}>
                    <FormLabel fontWeight="bold">2. ¿Qué día quieres venir?</FormLabel>
                    <Input type="date" size="lg" value={fecha} min={new Date().toISOString().split('T')[0]} onChange={handleFechaChange} />
                  </FormControl>

                  {fecha && terapeutaSeleccionado && (
                      <Box>
                        <Text fontWeight="bold" mb={3}>3. Horarios disponibles para el {fecha}:</Text>
                        {loading ? <Text>Cargando horarios...</Text> : null}
                        {!loading && horarios.length === 0 && <Text color="red.500">No hay turnos disponibles para este profesional hoy.</Text>}
                        
                        <SimpleGrid columns={3} spacing={3}>
                        {horarios.map(hora => (
                            <Button key={hora} colorScheme="blue" variant="outline" onClick={() => handleHoraClick(hora)} leftIcon={<FiClock />}>
                            {hora}
                            </Button>
                        ))}
                        </SimpleGrid>
                      </Box>
                  )}
                </VStack>
              )}

              
              {step === 2 && (
                <VStack w="full" spacing={4}>
                  <Box bg="blue.50" p={3} borderRadius="md" w="full" textAlign="center">
                    <Text fontSize="sm" color="blue.700">
                        Reservando para el <b>{fecha}</b> a las <b>{horaSeleccionada} hs</b>.
                    </Text>
                  </Box>
                  
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl isRequired isInvalid={!!errors.nombre}>
                        <FormLabel fontSize="sm">Nombre</FormLabel>
                        <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        <FormErrorMessage>{errors.nombre}</FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired isInvalid={!!errors.apellido}>
                        <FormLabel fontSize="sm">Apellido</FormLabel>
                        <Input value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                         <FormErrorMessage>{errors.apellido}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired isInvalid={!!errors.dni}>
                      <FormLabel fontSize="sm">DNI</FormLabel>
                      <Input type="number" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
                      <FormErrorMessage>{errors.dni}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.email}>
                      <FormLabel fontSize="sm">Email (Te enviaremos la confirmación)</FormLabel>
                      <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl>
                        <FormLabel fontSize="sm">Teléfono (Opcional)</FormLabel>
                        <Input type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                   </FormControl>

                  <FormControl isRequired isInvalid={!!errors.obraSocialId}>
                      <FormLabel fontSize="sm">Obra Social / Cobertura</FormLabel>
                      <Select placeholder="Seleccione..." onChange={e => setFormData({...formData, obraSocialId: e.target.value})}>
                          {obrasSociales.map(os => (<option key={os.id} value={os.id}>{os.nombre}</option>))}
                      </Select>
                      <FormErrorMessage>{errors.obraSocialId}</FormErrorMessage>
                      <Text fontSize="xs" color="gray.500" mt={1}>Si no tiene obra social, seleccione la opción "Particular".</Text>
                  </FormControl>

                  <HStack w="full" pt={4}>
                      <Button variant="ghost" onClick={() => setStep(1)}>Volver</Button>
                      <Button colorScheme="blue" w="full" onClick={handleSubmit} isLoading={loading} size="lg">
                          Confirmar Reserva
                      </Button>
                  </HStack>
                </VStack>
              )}

             
              {step === 3 && (
               <VStack spacing={6} py={10} textAlign="center">
                    
                    <Icon as={FiMail} w={20} h={20} color="blue.500" />
                    
                    <Box>
                        <Heading size="lg" mb={4}>¡Casi listo!</Heading>
                        
                        <Text fontSize="lg" mb={2}>
                            Hemos enviado un enlace de confirmación a:
                        </Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.600" mb={4}>
                            {formData.email}
                        </Text>
                        
                        <Text color="gray.600" fontSize="sm">
                            Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para <b>confirmar tu turno</b>.
                        </Text>
                        <Text color="gray.500" fontSize="xs" mt={2}>
                            El turno no se reservará hasta que lo confirmes.
                        </Text>
                    </Box>
                    
                    <Divider />
                    
                    <Button colorScheme="gray" variant="outline" onClick={() => window.location.reload()}>
                        Volver al inicio
                    </Button>
                </VStack>
              )}

            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default ReservaPage;