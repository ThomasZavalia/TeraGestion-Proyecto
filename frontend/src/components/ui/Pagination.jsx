
import {
  HStack, Button, Text, Select, IconButton, 
  useColorModeValue
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange 
}) => {
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const inicio = (currentPage - 1) * pageSize + 1;
  const fin = Math.min(currentPage * pageSize, totalItems);
  
  const generarPaginas = () => {
    const paginas = [];
    const rangoVisible = 2;
    
    let inicio = Math.max(1, currentPage - rangoVisible);
    let fin = Math.min(totalPages, currentPage + rangoVisible);
    
    if (currentPage <= rangoVisible) {
      fin = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - rangoVisible) {
      inicio = Math.max(1, totalPages - 4);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  };
  
  if (totalPages <= 1) return null; 
  
  return (
    <HStack 
      justify="space-between" 
      p={4} 
      bg={bg} 
      borderTopWidth="1px" 
      borderColor={borderColor}
      wrap="wrap"
      spacing={4}
    >
      
      <HStack spacing={2} fontSize="sm" color="gray.600">
        <Text>Mostrando</Text>
        <Text fontWeight="bold">{inicio}</Text>
        <Text>-</Text>
        <Text fontWeight="bold">{fin}</Text>
        <Text>de</Text>
        <Text fontWeight="bold">{totalItems}</Text>
        <Text>registros</Text>
      </HStack>
      
      <HStack spacing={2}>
     
        <IconButton
          icon={<FiChevronsLeft />}
          onClick={() => onPageChange(1)}
          isDisabled={currentPage === 1}
          size="sm"
          variant="ghost"
          aria-label="Primera página"
        />
        
       
        <IconButton
          icon={<FiChevronLeft />}
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          size="sm"
          variant="ghost"
          aria-label="Página anterior"
        />
        
        {generarPaginas().map(num => (
          <Button
            key={num}
            onClick={() => onPageChange(num)}
            size="sm"
            variant={currentPage === num ? 'solid' : 'ghost'}
            colorScheme={currentPage === num ? 'blue' : 'gray'}
            minW="40px"
          >
            {num}
          </Button>
        ))}
        
        <IconButton
          icon={<FiChevronRight />}
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          size="sm"
          variant="ghost"
          aria-label="Página siguiente"
        />
        
        
        <IconButton
          icon={<FiChevronsRight />}
          onClick={() => onPageChange(totalPages)}
          isDisabled={currentPage === totalPages}
          size="sm"
          variant="ghost"
          aria-label="Última página"
        />
      </HStack>
      
      <HStack spacing={2} fontSize="sm">
        <Text color="gray.600">Mostrar</Text>
        <Select
          size="sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          w="80px"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </Select>
        <Text color="gray.600">por página</Text>
      </HStack>
    </HStack>
  );
};

export default Pagination;