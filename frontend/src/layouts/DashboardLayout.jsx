import { useState, useEffect } from 'react';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import Navbar from './NavBar';

const DashboardLayout = () => {
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const [isSidebarOpen, setSidebarOpen] = useState(isDesktop);

useEffect(() => {
      setSidebarOpen(isDesktop);
  }, [isDesktop]);
  const sidebarWidthOpen = '250px';
  const sidebarWidthCollapsed = '80px'; 
 const sidebarWidth = isDesktop ? (isSidebarOpen ? sidebarWidthOpen : sidebarWidthCollapsed) : (isSidebarOpen ? sidebarWidthOpen : '0px');
 const marginLeft = isDesktop ? sidebarWidth : (isSidebarOpen ? sidebarWidth : '0px');

 const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const onSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
   <Box>
      <Sidebar 
        width={sidebarWidth} 
        isOpen={isSidebarOpen} 
        display={{ base: isSidebarOpen ? 'block' : 'none', md: 'block' }} 
        
        onClose={onSidebarClose} 
        isDesktop={isDesktop} 
       
      />
      
   <Box
      
        ml={{ base: 0, md: marginLeft }} 
        transition="margin-left 0.2s ease-in-out" 
      >

        <Navbar onToggleSidebar={toggleSidebar} isDesktop={isDesktop} />
        
        <Box p={{ base: 2, md: 4 }}> 
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;