
import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
Stat, StatLabel, StatNumber, StatHelpText, Icon, Divider
} from '@chakra-ui/react';
import { FiFilter,FiDownload,FiUsers,FiCheckCircle,FiActivity,FiDollarSign, } from 'react-icons/fi';
import { reportesService } from '../../services/ReportesService';

import BarChartReport from './components/BarChartReport';
import PieChartReport from './components/PieChartReport';
import HorizontalBarChartReport from './components/HorizontalBarChartReport';
import { useAuth } from '../../context/AuthContext';



const StatCard = ({ title, stat, helpText, icon }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Stat px={8} py={5} shadow="md" border="1px solid" borderColor={borderColor} rounded="lg" bg={bgColor}>
      <StatLabel fontWeight="medium" color="gray.500">{title}</StatLabel>
      <StatNumber fontSize="2xl" fontWeight="medium" color={textColor}>{stat}</StatNumber>
      {helpText && (
        <StatHelpText>
          {icon && <Icon as={icon} mr={1} w={4} h={4} />}
          {helpText}
        </StatHelpText>
      )}
    </Stat>
  );
};
const ReportesPage = () => {
const { user } = useAuth();
  const [topPacientes, setTopPacientes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [turnosEstado, setTurnosEstado] = useState([]);
  const [turnosMes, setTurnosMes] = useState([]);
  const [ingresosMes, setIngresosMes] = useState([]);
  const [turnosObraSocial, setTurnosObraSocial] = useState([]);
  
const [rendimientoTerapeuta, setRendimientoTerapeuta] = useState(null);
 
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);


  const getMesActual = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Convierte "YYYY-MM" a un rango completo de fechas para el backend
  const expandFiltros = ({ fechaDesde: desde, fechaHasta: hasta }) => {
    const toFirstDay = (ym) => (ym ? `${ym}-01` : null);
    const toLastDay = (ym) => {
      if (!ym) return null;
      const [y, m] = ym.split('-');
      const last = new Date(Number(y), Number(m), 0).getDate();
      return `${ym}-${String(last).padStart(2, '0')}`;
    };
    return { fechaDesde: toFirstDay(desde), fechaHasta: toLastDay(hasta) };
  };

  const [fechaDesde, setFechaDesde] = useState(getMesActual());
  const [fechaHasta, setFechaHasta] = useState(getMesActual());


 useEffect(() => {
    if (user?.rol === 'Admin') {
      const mesActual = getMesActual();
      loadAllData(expandFiltros({ fechaDesde: mesActual, fechaHasta: mesActual }));
    } else if (user?.rol === 'Terapeuta') {
      const fetchTerapeuta = async () => {
        setLoading(true);
        try {
          const rendimiento = await reportesService.getMiRendimiento();
          setRendimientoTerapeuta(rendimiento);
        } catch (error) { console.error("Error cargando rendimiento:", error); }
        finally { setLoading(false); }
      };
      fetchTerapeuta();
    }
  }, [user]);

  const loadAllData = async (currentFilters = {}) => {
    setLoading(true);
    try {
      const [pacientesData, metodosData, estadoData, osData, turnosData, ingresosData] = await Promise.all([
        reportesService.getTopPacientes(currentFilters),
        reportesService.getMetodosPago(currentFilters),
        reportesService.getTurnosPorEstado(currentFilters),
        reportesService.getTurnosPorObraSocial(currentFilters),
        reportesService.getTurnosPorMes(currentFilters),
        reportesService.getIngresosPorMes(currentFilters),
      ]);
      setTopPacientes(pacientesData);
      setMetodosPago(metodosData);
      setTurnosEstado(estadoData);
      setTurnosObraSocial(osData);
      setTurnosMes(turnosData);
      setIngresosMes(ingresosData);
    } catch (error) { console.error("Error cargando reportes:", error); }
    finally { setLoading(false); }
  };

   const handleFiltrar = () => {
       loadAllData(expandFiltros({ fechaDesde, fechaHasta }));
   };

   const handleDescargarExcel = async () => {
    setDownloading(true);
    try {
 
      const filtrosExpandidos = expandFiltros({ fechaDesde, fechaHasta });
      const blob = await reportesService.exportarExcel(filtrosExpandidos);

      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      const fechaHoy = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Reporte_TeraGestion_${fechaHoy}.xlsx`);
      
     
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Falló la descarga", error);
     
    } finally {
      setDownloading(false);
    }
  };

   const filterBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('white', 'gray.700');
if (user?.rol === 'Terapeuta' && rendimientoTerapeuta) {
      return (
          <Box>
            <Heading mb={6}>Mi Rendimiento Histórico</Heading>
            
            <HStack 
              spacing={4} 
              mb={8} 
              wrap="wrap" 
              bg={filterBg} 
              p={4} 
              borderRadius="md" 
              shadow="sm"
              align="flex-end" 
            >
               <FormControl>
                 <FormLabel fontSize="sm">Desde Mes</FormLabel>
                 <Input 
                   type="month" 
                   size="sm" 
                   value={fechaDesde} 
                   onChange={(e) => setFechaDesde(e.target.value)} 
                   bg={inputBg} 
                  />
               </FormControl>
               <FormControl>
                 <FormLabel fontSize="sm">Hasta Mes</FormLabel>
                 <Input 
                   type="month" 
                   size="sm" 
                   value={fechaHasta} 
                   onChange={(e) => setFechaHasta(e.target.value)} 
                   bg={inputBg} 
                  />
               </FormControl>
               <Button 
                  leftIcon={<FiFilter />} 
                  colorScheme="blue" 
                  size="sm" 
                  onClick={async () => {
                    setLoading(true);
                    try {
                        const rendimiento = await reportesService.getMiRendimiento({ fechaDesde, fechaHasta });
                        setRendimientoTerapeuta(rendimiento);
                    } catch (error) {
                        console.error(error);
                    } finally {
                        setLoading(false);
                    }
                  }}
                  isLoading={loading}
               >
                  Filtrar Meses
               </Button>
            </HStack>
          
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
                <StatCard title="Pacientes Únicos Atendidos" stat={rendimientoTerapeuta.pacientesUnicosMes} icon={FiUsers} helpText="En el periodo" />
                <StatCard title="Turnos Concluidos" stat={rendimientoTerapeuta.turnosAtendidosMes} icon={FiCheckCircle} helpText="Sesiones dadas" />
                <StatCard title="Tasa de Asistencia" stat={`${rendimientoTerapeuta.tasaAsistencia}%`} icon={FiActivity} helpText="De los turnos agendados" />
                <StatCard 
                    title="Mis Ganancias Estimadas" 
                    stat={`$ ${rendimientoTerapeuta.gananciasEstimadasMes?.toLocaleString('es-AR')}`} 
                    icon={FiDollarSign} 
                    helpText="En el periodo" 
                />
            </SimpleGrid>

            <Divider my={8} />

         
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                 
                 {/* Gráfico Histórico de Ganancias */}
                 <BarChartReport
                   title="Evolución de Mis Ganancias"
                   data={rendimientoTerapeuta.evolucionGanancias}
                   dataLabel="Ganancia ($)"
                   labelField="mes"
                   valueField="valor" 
                   isLoading={loading}
                   formatValue={(value) => `$ ${value.toLocaleString('es-AR')}`} 
                 />

                 <PieChartReport
                   title="Mis Turnos por Estado (Tasa de Ausentismo)"
                   data={rendimientoTerapeuta.distribucionEstados}
                   labelField="estado"
                   valueField="cantidad"
                   isLoading={loading} 
                 />

                 <HorizontalBarChartReport
                     title="Mis Pacientes más Frecuentes"
                     data={rendimientoTerapeuta.topPacientes}
                     dataLabel="Turnos Atendidos"
                     labelField="nombreCompleto" 
                     valueField="cantidadTurnos"
                     isLoading={loading}
                 />
            </SimpleGrid>
          </Box>
      );
  }
  return (
    <Box>
      <Heading mb={6}>Reportes</Heading>

   
    <HStack 
        spacing={4} 
        mb={8} 
        wrap="wrap" 
        bg={filterBg} 
        p={4} 
        borderRadius="md" 
        shadow="sm"
        align="flex-end" 
      >
         <FormControl>
           <FormLabel fontSize="sm">Desde Mes</FormLabel>
           <Input 
             type="month" 
             size="sm" 
             value={fechaDesde} 
             onChange={(e) => setFechaDesde(e.target.value)} 
             bg={inputBg} 
            />
         </FormControl>
         <FormControl>
           <FormLabel fontSize="sm">Hasta Mes</FormLabel>
           <Input 
             type="month" 
             size="sm" 
             value={fechaHasta} 
             onChange={(e) => setFechaHasta(e.target.value)} 
             bg={inputBg} 
            />
         </FormControl>
         <Button 
            leftIcon={<FiFilter />} 
            colorScheme="blue" 
            size="sm" 
            onClick={handleFiltrar}
            isLoading={loading}
         >
            Filtrar Meses
         </Button>
         <Button 
            leftIcon={<FiDownload />} 
            colorScheme="green" 
            size="sm" 
            onClick={handleDescargarExcel}
            isLoading={downloading}
            loadingText="Generando..."
          >
             Exportar Excel
          </Button>
      </HStack>

     
      {loading ? (
        <Center h="400px"><Spinner size="xl" /></Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
         
         <BarChartReport
            title="Total Facturado (Bruto)"
            data={ingresosMes}
            dataLabel="Ingresos ($)"
            labelField="mes"
            valueField="totalFacturado" 
            isLoading={loading}
            formatValue={(value) => `$ ${value.toLocaleString('es-AR')}`} 
          />

          <BarChartReport
            title="Ganancia Neta de la Clínica"
            data={ingresosMes}
            dataLabel="Ganancia ($)"
            labelField="mes"
            valueField="gananciaClinica" 
            isLoading={loading}
            formatValue={(value) => `$ ${value.toLocaleString('es-AR')}`} 
          />

          <BarChartReport
            title="Cantidad de Turnos por Mes"
            data={turnosMes}
            dataLabel="Turnos"
            labelField="mes"
            valueField="valor"
            isLoading={loading}
          />

          <HorizontalBarChartReport
             title="Obras Sociales más Usadas"
             data={turnosObraSocial}
             dataLabel="Turnos"
             labelField="estado" 
             valueField="cantidad"
             isLoading={loading}
          />

           
          <PieChartReport
            title="Distribución de Turnos por Estado"
            data={turnosEstado}
            labelField="estado"
            valueField="cantidad"
            isLoading={loading} 
          />

         
          <PieChartReport
            title="Distribución de Métodos de Pago"
            data={metodosPago}
            labelField="metodoPago"
            valueField="cantidad"
            isLoading={loading}
          />
          
         
          <HorizontalBarChartReport
             title="Top 5 Pacientes por Cantidad de Turnos"
             data={topPacientes}
             dataLabel="Cantidad de Turnos"
             labelField="paciente" 
             valueField="turnos"
             isLoading={loading}
          />

          

        </SimpleGrid>
      )}
    </Box>
  );
};

export default ReportesPage;