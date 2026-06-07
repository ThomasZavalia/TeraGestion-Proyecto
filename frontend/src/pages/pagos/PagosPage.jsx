import { useState, useEffect,useRef } from 'react';
import {
  Box, Heading, HStack, FormControl, FormLabel, Input, Select, Spinner, Center, Alert, AlertIcon, useColorModeValue,
  useToast, useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button,
  Text 
} from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';
import { pagoService } from '../../services/PagosService';
import TablaPagos from './components/TablaPagos'; 
import { usePagosPaginados } from '../../hooks/usePagosPaginados';
import Pagination from '../../components/ui/Pagination';


const PagosPage = () => {


  const { 
    pagos, loading, error, currentPage, totalPages, totalItems, pageSize, filtros,
    cambiarPagina, aplicarFiltros, cambiarTamanio, isExporting, exportarExcel, recargarPagos
  } = usePagosPaginados();

const toast = useToast();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [pagoAAnular, setPagoAAnular] = useState(null);
  const [isAnulando, setIsAnulando] = useState(false);

  const handleClickAnular = (pago) => {
    setPagoAAnular(pago);
    onOpen();
  };

 const confirmarAnulacion = async () => {
    setIsAnulando(true);
    
    const result = await pagoService.anularPago(pagoAAnular.id);
    
    setIsAnulando(false);
    onClose();
    
    if (result.success) {
      toast({ title: "Pago Anulado", description: "El pago fue anulado exitosamente.", status: "success", duration: 4000 });
      recargarPagos(); 
    } else {
      toast({ title: "Error", description: result.message, status: "error", duration: 4000 });
    }
    
    setTimeout(() => setPagoAAnular(null), 300);
  };
 
  
  const boxBg = useColorModeValue('white', 'gray.800'); 
  const inputBg = useColorModeValue('white', 'gray.700'); 

  return (
   <Box>
      <Heading mb={6}>Gestión de Pagos</Heading>

      <Box bg={boxBg} p={4} borderRadius="md" shadow="sm" mb={6}>
        <HStack spacing={4} wrap="wrap" align="flex-end"> 
          
          <FormControl flex="1" minW="200px">
            <FormLabel fontSize="sm">Buscar Paciente</FormLabel>
            <Input 
              placeholder="Nombre, apellido o DNI..." 
              value={filtros.busqueda}
              onChange={(e) => aplicarFiltros({ busqueda: e.target.value })}
              bg={inputBg} 
              size="sm"
            />
          </FormControl>

          <FormControl w="150px">
            <FormLabel fontSize="sm">Fecha Desde</FormLabel>
            <Input 
              type="date" size="sm" bg={inputBg} 
              value={filtros.fechaDesde}
              onChange={(e) => aplicarFiltros({ fechaDesde: e.target.value })}
            />
          </FormControl>
          
          <FormControl w="150px">
            <FormLabel fontSize="sm">Fecha Hasta</FormLabel>
            <Input 
              type="date" size="sm" bg={inputBg} 
              value={filtros.fechaHasta}
              onChange={(e) => aplicarFiltros({ fechaHasta: e.target.value })} 
            />
          </FormControl>

          <FormControl w="150px">
            <FormLabel fontSize="sm">Método</FormLabel>
            <Select 
              size="sm" bg={inputBg}
              value={filtros.metodoPago}
              onChange={(e) => aplicarFiltros({ metodoPago: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
            </Select>
          </FormControl>
          <Button 
            leftIcon={<FiDownload />} 
            colorScheme="green" 
            size="sm" 
            onClick={async () => {
              const res = await exportarExcel();
              if (!res.success) {
                toast({ title: "Error", description: res.message, status: "error", duration: 3000 });
              }
            }}
            isLoading={isExporting}
            loadingText="Generando..."
          >
            Exportar a Excel
          </Button>
          
        </HStack>
      </Box>

     <Box bg={boxBg} p={4} borderRadius="md" shadow="md" position="relative">
        {error && <Alert status='error' mb={4}><AlertIcon />Error al cargar los pagos.</Alert>}
        
        {loading && pagos.length === 0 ? (
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
              
              <TablaPagos pagos={pagos} onAnular={handleClickAnular} />
              
              <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={cambiarPagina}
                  onPageSizeChange={cambiarTamanio}
              />

              {!filtros.fechaDesde && !filtros.fechaHasta && !filtros.busqueda && (
                <Alert status="info" mt={4} borderRadius="md" size="sm" variant="left-accent">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">Vista rápida de actividad reciente</Text>
                    <Text fontSize="sm">
                      Por rendimiento, solo se muestran los pagos de los <strong>últimos 3 días</strong>. 
                      Utilice los filtros de fecha en la parte superior para ver registros más antiguos.
                    </Text>
                  </Box>
                </Alert>
              )}
            </Box>
          </Box>
        )}
      </Box>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent bg={boxBg}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Anular Pago
            </AlertDialogHeader>
            <AlertDialogBody>
              ¿Estás seguro de que deseas anular el pago de <strong>${pagoAAnular?.monto}</strong> del paciente <strong>{pagoAAnular?.pacienteNombre} {pagoAAnular?.pacienteApellido}</strong>?
              <br/><br/>
              Esta acción marcará el pago como anulado, por lo que el turno asociado volverá a figurar como impago (deuda) en el sistema.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} isDisabled={isAnulando}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={confirmarAnulacion} ml={3} isLoading={isAnulando}>
                Sí, Anular Pago
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

    </Box>
  );
};
export default PagosPage;