import React, { useRef } from "react";
import { AlertDialog, AlertDialogBody, AlertDialogFooter, 
AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button } from "@chakra-ui/react";


export const ComfirmarEliminarModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading, 
  title, 
  children,
  leastDestructiveRef 
}) => {

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={leastDestructiveRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
           
            {title}
          </AlertDialogHeader>

          <AlertDialogBody>
           
            {children}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={leastDestructiveRef} onClick={onClose} isDisabled={isLoading}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={onConfirm} isDisabled={isLoading} ml={3}>
              Desactivar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};