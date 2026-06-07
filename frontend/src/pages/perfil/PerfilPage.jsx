import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { usuarioService } from '../../services/UsuarioService'; 
import { useAuth } from '../../context/AuthContext';
import PerfilForm from './components/PerfilForm';
import ContrasenaForm from './components/ContraseñaForm';
import DisponibilidadForm from './components/DisponibilidadForm';
import ConfiguracionAgendaForm from './components/ConfiguracionAgendaForm'; 

const PerfilPage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuth();


  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const data = await usuarioService.getMyProfile();
        setUserData(data);
      } catch (error) {
        toast({ title: "Error al cargar perfil", status: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [toast]);

  if (isLoading) {
    return <Center h="300px"><Spinner size="xl" /></Center>;
  }
const isTerapeuta = user?.rol === 'Terapeuta';
  const isAdmin = user?.rol === 'Admin';

 return (
    <Box>
      <Heading mb={6}>Configuración</Heading>

      <Tabs isLazy colorScheme='blue'> 
        <TabList>
        
          <Tab>Mi Perfil</Tab>
          <Tab>Cambiar Contraseña</Tab>
          
          {/* {isTerapeuta && <Tab>Mis Horarios</Tab>} */}
          
          {/*{isAdmin && <Tab>Reglas de la Agenda</Tab>}*/}
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box maxW="lg">
              <PerfilForm initialData={userData} />
            </Box>
          </TabPanel>

          <TabPanel>
             <Box maxW="lg">
               <ContrasenaForm />
             </Box>
          </TabPanel>

          {isTerapeuta && (
             <TabPanel>
                <Box maxW="xl"> 
                  <DisponibilidadForm />
                </Box>
             </TabPanel>
          )}

          {isAdmin && (
             <TabPanel> 
               <Box maxW="lg">
                  <ConfiguracionAgendaForm />
               </Box>
            </TabPanel>
          )}

        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PerfilPage;