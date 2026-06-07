import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Text, VStack, HStack, Tag, useToast, Box, Divider, IconButton,
  Heading, 
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useDisclosure, Select, FormControl,
   FormLabel,  ButtonGroup,Flex,Tooltip,Spinner,Center,
   useColorModeValue,Textarea,
   Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon
} from '@chakra-ui/react';
import { useState,useRef,useEffect } from 'react';
import { format, parseISO,isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiEdit, FiTrash2, FiCheckCircle, FiCheck, FiX,FiClock,FiSave,FiRefreshCcw } from 'react-icons/fi';
import { turnoService } from '../../../services/TurnoService';
import { sesionService } from '../../../services/SesionService';
import { useAuth } from '../../../context/AuthContext';

const ModalVerTurno = ({ isOpen, onClose, turno, onTurnoUpdate, onEdit, onDelete,onReprogramar }) => { 
  const toast = useToast();

const [detalle, setDetalle] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  const [isPaying, setIsPaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isSavingAsistencia, setIsSavingAsistencia] = useState(false); 

  const [notas, setNotas] = useState('');
  const [isSavingNotas, setIsSavingNotas] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const { user } = useAuth();
 

  const [metodoPago, setMetodoPago] = useState('Efectivo'); 

 
 const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef(); 

  const modalBg = useColorModeValue('white', 'gray.800');
  const modalBorder = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const subHeadingColor = useColorModeValue('gray.600', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');
  const accordionBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    
    if (isOpen && turno) {
      const fetchDetalle = async () => {
        setIsLoading(true);
        try {
          
          const turnoId = turno.extendedProps.id;
          
          const data = await turnoService.getTurnoDetalle(turnoId);
          
          setDetalle(data); 
          setNotas(data.notasSesion || '');
        } catch (error) {
          console.error("Error al cargar detalle del turno", error);
          toast({ title: 'Error', description: 'No se pudo cargar el detalle del turno.', status: 'error' });
          setDetalle(null); 
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDetalle();
    }

  if (!isOpen) {
       
        setDetalle(null); setIsLoading(true); setIsPaying(false); setIsDeleting(false);
        setIsSavingAsistencia(false); setIsSavingNotas(false); setNotas(''); setMetodoPago('Efectivo');
    }
  }, [isOpen, turno, toast]);
 
const turnoData = turno?.extendedProps;
const turnoFecha = turno?.start;


let fechaFormateada = 'Cargando...'; 
let esTurnoFuturo = false;
let isCancelado = false;
let isPagado = false;
let isTurnoCerrado = false;


if (detalle && detalle.fechaHora) { 
    try {
      const fechaTurno = parseISO(detalle.fechaHora); 
      fechaFormateada = format(fechaTurno, "eeee dd 'de' MMMM, yyyy 'a las' HH:mm 'hs'", { locale: es });
      esTurnoFuturo = isFuture(fechaTurno);
    } catch (error) { 
        console.error('Error fecha:', error);
        fechaFormateada = 'Fecha inválida'; 
    }
    
    isCancelado = detalle?.estado?.toLowerCase() === 'cancelado';
    isPagado = detalle?.estaPagado === true;

   isTurnoCerrado = 
        detalle?.estado === 'Atendido' || 
        detalle?.estado === 'Ausente' || 
        isCancelado;
}

const handleMarcarPagado = async () => {
  if (!detalle) return;
  setIsPaying(true); 
  try {
    const result = await turnoService.marcarComoPagado(detalle.id, metodoPago); 
    if (result.success) {
      toast({ title: 'Turno Pagado', status: 'success' });
      const datosFrescos = await turnoService.getTurnoDetalle(detalle.id);
      onTurnoUpdate(turnoService.formatTurnoForCalendar(datosFrescos)); 
      onClose(); 
    } else {
      toast({ title: 'Error al pagar', description: result.message, status: 'error' });
    }
  } catch (error) {
    toast({ title: 'Error', description: error.message, status: 'error' });
  } finally {
    setIsPaying(false);
  }
};

const handleEditar = () => {

    if (detalle && turno?.extendedProps) {
      
  
      const datosCompletosParaEditar = {
        ...turno.extendedProps,
        ...detalle
      };

    
      console.log("Enviando estos datos al modal de edición:", datosCompletosParaEditar);

   
      onEdit(datosCompletosParaEditar); 

    } else {
  
      console.error("Error: Faltan 'detalle' o 'turno.extendedProps' para poder editar.");
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos completos para editar.',
        status: 'error'
      });
    }
  };

 
 const handleConfirmarCancelar = async () => {
    if (!detalle) return;
    setIsDeleting(true); 

    try {
    
      const result = await turnoService.deleteTurno(detalle.id);
      
      if (result.success) {
        toast({ title: 'Turno Cancelado', status: 'warning', duration: 3000 });
        
       
        const datosFrescos = await turnoService.getTurnoDetalle(detalle.id);
        
        
        onTurnoUpdate(turnoService.formatTurnoForCalendar(datosFrescos));
        
        onAlertClose(); 
        onClose(); 
      } else {
        toast({ title: 'Error al cancelar', description: result.message, status: 'error', duration: 5000 });
      }
    } catch (error) {
       toast({ title: 'Error grave', description: error.message, status: 'error' });
    } finally {
      setIsDeleting(false); 
    }
  };

const handleAsistencia = async (estadoAsistencia) => {
    if (!detalle || isCancelado) return; 
    setIsSavingAsistencia(true);
    
    const result = await sesionService.registrarAsistencia(detalle.id, estadoAsistencia); 
    
    if (result.success) {
      toast({ title: `Asistencia registrada`, status: 'success' });
      
     
      const datosFrescos = await turnoService.getTurnoDetalle(detalle.id);
      setDetalle(datosFrescos); 
      setNotas(datosFrescos.notasSesion || '');
      onTurnoUpdate(turnoService.formatTurnoForCalendar(datosFrescos));
      
    } else {
      toast({ title: 'Error al registrar', description: result.message, status: result.alreadyExists ? 'warning' : 'error' });
    }
    setIsSavingAsistencia(false);
  };



  const handleReprogramarClick = () => {
      if (detalle) {
          onReprogramar(detalle); 
      }
  };



const handleGuardarNotas = async () => {
    if (!detalle || !detalle.sesionId) return;
    setIsSavingNotas(true);
    const payload = { notas: notas, asistencia: detalle.asistencia };
    const result = await sesionService.actualizarSesion(detalle.sesionId, payload);
    
    if (result.success) {
        toast({ title: 'Notas guardadas', status: 'success', duration: 2000 });
        setDetalle(prev => ({ ...prev, notasSesion: notas }));
    } else {
        toast({ title: 'Error', description: result.message, status: 'error' });
    }
    setIsSavingNotas(false);
  };

  const handleRevertirTurno = async () => {
    if (!detalle) return;
    setIsReverting(true);
    try {
      const result = await turnoService.revertirTurno(detalle.id);
      if (result.success) {
        toast({ title: 'Turno revertido a Pendiente', status: 'info' });
    
        const datosFrescos = await turnoService.getTurnoDetalle(detalle.id);
        setDetalle(datosFrescos);
        onTurnoUpdate(turnoService.formatTurnoForCalendar(datosFrescos));
      } else {
        toast({ title: 'Error al revertir', description: result.message, status: 'error' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setIsReverting(false);
    }
};

 const renderAsistencia = () => {
    if (esTurnoFuturo) {
      return <Text fontSize="sm" color="gray.500">(La asistencia se registra el día del turno)</Text>;
    }
    
    const puedeRevertir = user?.rol === 'Admin' || user?.rol === 'Secretaria';

    const botonRevertir = puedeRevertir && (
      <Tooltip label="Deshacer asistencia y volver a Pendiente">
        <IconButton 
          icon={<FiRefreshCcw />} 
          size="xs" variant="ghost" colorScheme="blue" ml={2} 
          onClick={handleRevertirTurno} isLoading={isReverting} 
        />
      </Tooltip>
    );

    switch (detalle.asistencia) {
      case 'Presente':
        return (
          <Flex align="center">
            <Tag colorScheme='green' size="md"><FiCheckCircle />&nbsp; Asistencia Confirmada</Tag>
            {botonRevertir}
          </Flex>
        );
      case 'Ausente':
        return (
          <Flex align="center">
            <Tag colorScheme='orange' size="md"><FiX />&nbsp; Ausencia Registrada</Tag>
            {botonRevertir}
          </Flex>
        );
      case null: 
      default:
        return (
          <ButtonGroup spacing="3" w="full">
            <Button leftIcon={<FiCheck />} colorScheme="green" variant="outline" size="sm" onClick={() => handleAsistencia('Presente')} isLoading={isSavingAsistencia} loadingText="Guardando" flex="1"> Confirmar Asistencia </Button>
            <Button leftIcon={<FiX />} colorScheme="orange" variant="outline" size="sm" onClick={() => handleAsistencia('Ausente')} isLoading={isSavingAsistencia} loadingText="Guardando" flex="1"> Marcar Ausente </Button>
          </ButtonGroup>
        );
    }
};
  if (!isOpen) return null;
 
 return (
    <>
   
    <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside" size="xl"> 
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader pb={2}>
            <Flex justify="space-between" align="center">
              <Heading size="md" mr={4} color={textColor}>Detalles</Heading>
              <HStack spacing={1} mr="8">
                <Tooltip label="Reprogramar">
        <IconButton 
            icon={<FiClock />} 
            variant="ghost" 
            size="sm" 
            onClick={handleReprogramarClick} 
            isDisabled={isTurnoCerrado}
            onFocus={(e) => e.preventDefault()} 
        /></Tooltip>
                 <Tooltip label="Editar">
                     <IconButton icon={<FiEdit />} variant="ghost" size="sm" onClick={handleEditar} isDisabled={isPagado || isCancelado} />
                 </Tooltip>
                <Tooltip label="Cancelar">
        <IconButton 
            icon={<FiTrash2 />} 
            colorScheme="red" 
            variant="ghost" 
            size="sm" 
            onClick={onAlertOpen} 
            isDisabled={isTurnoCerrado || isPagado} 
        />
    </Tooltip>
              </HStack>
            </Flex>
          </ModalHeader>
          <ModalCloseButton top={4} right={4}/> 
          
          <ModalBody py={4}> 
            {isLoading ? ( <Center h="150px"><Spinner /></Center> ) : !detalle ? ( <Text>Error</Text> ) : (
                <VStack align="stretch" spacing={4}>
                
                  <Box>
                    <Heading size="md" color={headingColor}>{detalle.pacienteNombre} {detalle.pacienteApellido}</Heading>
                  <Text fontSize="sm" fontWeight="bold" color="blue.500" mt={1}> 
    Profesional: {detalle.terapeutaNombreCompletoProfesional || detalle.terapeutaNombreCompleto || detalle.terapeutaNombre || "No asignado"} 
 </Text>
                    <Text fontSize="sm" color={secondaryTextColor} mt={1}> {fechaFormateada} </Text>
                  <HStack mt={2}>
                     
                        <Tag colorScheme={
                            detalle.estado === 'Atendido' ? 'green' : 
                            detalle.estado === 'Cancelado' ? 'red' : 
                            detalle.estado === 'Ausente' ? 'orange' :
                            detalle.estado === 'Pendiente de Cierre' ? 'gray' : 'blue'
                            
                            
                        } size="sm">
                            {detalle.estado}
                        </Tag>

                        <Tag colorScheme={isPagado ? 'green' : 'yellow'} size="sm" variant={isPagado ? "solid" : "subtle"}>
                            {isPagado ? '✔ Pagado' : '⏳ Debe'}
                        </Tag>

                        <Text fontSize="sm" fontWeight="bold">${detalle.precio?.toLocaleString('es-AR')}</Text>
                    </HStack>
                  </Box>

                  <Divider borderColor={modalBorder}/>
                  
                
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} textTransform="uppercase">Asistencia</Text>
                    {renderAsistencia()}
                  </Box>

                
                  {detalle.sesionId && user?.rol === 'Terapeuta' && user?.id === detalle.terapeutaId && (
                    <Accordion allowToggle>
                      <AccordionItem border="none">
                        <h2>
                          <AccordionButton p={2} bg={accordionBg} borderRadius="md" _hover={{ bg: 'gray.200' }}>
                            <Box flex="1" textAlign="left" fontSize="sm" fontWeight="bold">
                               Notas de la Sesión
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4} px={0}>
                           <Textarea 
                              placeholder="Escribe la evolución aquí..."
                              value={notas}
                              onChange={(e) => setNotas(e.target.value)}
                              bg={inputBg}
                              minH="120px"
                           />
                           <Button 
                              mt={2} size="sm" leftIcon={<FiSave />} colorScheme="blue" width="full"
                              onClick={handleGuardarNotas} isLoading={isSavingNotas}
                           >
                              Guardar Notas
                           </Button>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  )}

                 {!isPagado && !isCancelado && user?.rol !== 'Terapeuta' && (
                     <Box pt={2}>
                         <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} textTransform="uppercase">Pago</Text>
                         <HStack>
                            <Select size="sm" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} isDisabled={isPaying} bg={inputBg}>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                               
                            </Select>
                            <Button leftIcon={<FiCheckCircle />} colorScheme="green" onClick={handleMarcarPagado} isLoading={isPaying} size="sm" px={6}>
                                Cobrar
                            </Button>
                         </HStack>
                     </Box>
                  )}
                </VStack>
            )}
          </ModalBody>
          <ModalFooter pt={2} pb={4}>
             <Button variant="ghost" onClick={onClose} size="sm" ml="auto">Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
   
  <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={modalBg}> 
            <AlertDialogHeader fontSize="lg" fontWeight="bold"> 
              Cancelar Turno 
            </AlertDialogHeader>
            <AlertDialogBody>
              ¿Estás seguro que deseas cancelar este turno? Esta acción no se puede deshacer.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}> Salir </Button>
             <Button 
              colorScheme="red" 
              onClick={handleConfirmarCancelar} 
              ml={3} 
              isLoading={isDeleting} 
              loadingText="Cancelando..."
            >
              Cancelar Turno
            </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ModalVerTurno;