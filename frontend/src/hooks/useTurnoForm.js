
import { useState, useEffect, useCallback,useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { turnoService } from '../services/TurnoService';
import { pacienteService } from '../services/PacienteService';
import { obraSocialService } from '../services/ObraSocialService';
import { usuarioService } from '../services/UsuarioService';


export const useTurnoForm = (config) => {
  
  const { selectedDate, turnoAEditar, onTurnoCreado, onTurnoActualizado, isEditingMode } = config; 

  const toast = useToast();

  const isInitialMount = useRef(true);

  
  const [pacienteTipo, setPacienteTipo] = useState('existente');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [nombrePaciente, setNombrePaciente] = useState('');
  const [apellidoPaciente, setApellidoPaciente] = useState('');
  const [dni, setDni] = useState('');
  const [obraSocialId, setObraSocialId] = useState(null); 
  const [precio, setPrecio] = useState(0);
  const [terapeutaId, setTerapeutaId] = useState(config.terapeutaId || '');
  const [terapeutasList, setTerapeutasList] = useState([]);


 const [dniError, setDniError] = useState(null);
  const [obrasSocialesList, setObrasSocialesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrecio, setIsLoadingPrecio] = useState(false);
  const [didInitForEdit, setDidInitForEdit] = useState(false);
  
useEffect(() => {
    
    obraSocialService.getObrasSocialesActivas()
      .then(data => {
         const formattedList = data.map(os => ({ value: os.id, label: os.nombre }));
         setObrasSocialesList(formattedList);
      })
      .catch(error => { console.error("Error cargando OS:", error); setObrasSocialesList([]); });

    usuarioService.getTerapeutas()
      .then(data => setTerapeutasList(data))
      .catch(error => console.error("Error cargando terapeutas:", error));
  }, []);


 useEffect(() => {
    if (isEditingMode && turnoAEditar && !didInitForEdit) {
   
      setPacienteTipo('existente');
      setPacienteSeleccionado({
        value: turnoAEditar.pacienteId,
        label: `${turnoAEditar.pacienteNombre || ''} ${turnoAEditar.pacienteApellido || ''}`,
        obraSocialId: turnoAEditar.obraSocialId
      });
      setObraSocialId(turnoAEditar.obraSocialId);
      setPrecio(turnoAEditar.precio || 0);
      
     
      setNombrePaciente(''); setApellidoPaciente(''); setDni(''); setDniError(null);
      
      setDidInitForEdit(true);
    } else if (!isEditingMode) {
   
      setPacienteTipo('existente');
      setPacienteSeleccionado(null);
      setNombrePaciente(''); setApellidoPaciente(''); setDni(''); setDniError(null);
      setObraSocialId(null);
      setPrecio(0);
     setTerapeutaId(config.terapeutaId || '');
      setDidInitForEdit(false);
    }
  }, [isEditingMode, turnoAEditar, didInitForEdit]);


  useEffect(() => {
    if (!isEditingMode) {
      if (pacienteTipo === 'existente' && pacienteSeleccionado) {
        setObraSocialId(pacienteSeleccionado.obraSocialId || null);
      } else if (pacienteTipo === 'nuevo') {
        setObraSocialId(null);
      }
    }
  }, [pacienteTipo, pacienteSeleccionado, isEditingMode]);

  
 const fetchPrecio = useCallback(async () => {
    if (obraSocialId) {
      setIsLoadingPrecio(true);
      try {
        const precioCalculado = await obraSocialService.getPrecio(obraSocialId);
        setPrecio(precioCalculado);
      } catch (error) { console.error(error); setPrecio(0); }
      finally { setIsLoadingPrecio(false); }
    } else {
       if (!isEditingMode) setPrecio(0);
    }
  }, [obraSocialId, isEditingMode]);

  useEffect(() => { fetchPrecio(); }, [fetchPrecio]);



  const loadPacientes = useCallback((inputValue) => {
      return pacienteService.buscarPacientes(inputValue);
  }, []);

  const validateDni = useCallback(async (dniValue) => {
    if (!dniValue || pacienteTipo !== 'nuevo' || isEditingMode) { 
        setDniError(null); 
        return; 
    }
    try {
        const exists = await pacienteService.checkDniExists(dniValue); 
        if (exists) setDniError('Este DNI ya está registrado.');
        else setDniError(null);
    } catch (error) {
        console.error("Error validando DNI:", error);
    
    }
  }, [pacienteTipo, isEditingMode]);


  const handleSubmit = async () => {

    if (!isEditingMode) {

     if (!terapeutaId) {
            toast({ title: 'Falta Profesional', description: 'Seleccione un profesional para este turno.', status: 'error' });
            return;
        }
        if (pacienteTipo === 'existente' && !pacienteSeleccionado) {
            toast({ title: 'Falta Paciente', description: 'Seleccione un paciente existente.', status: 'error' });
            return; 
        }
        if (pacienteTipo === 'nuevo') {
            if (!nombrePaciente.trim() || !apellidoPaciente.trim() || !dni.trim()) {
                toast({ title: 'Campos incompletos', description: 'Nombre, Apellido y DNI son obligatorios.', status: 'error' });
                return;
            }
            if (!/^[0-9]{7,8}$/.test(dni)) {
                toast({ title: 'DNI Inválido', description: 'El DNI debe tener 7 u 8 números.', status: 'error' });
                return;
            }
            if (dniError) {
                toast({ title: 'Error en DNI', description: dniError, status: 'error' });
                return;
            }
        }
    }
    
  
    if (!obraSocialId) {
         toast({ title: 'Falta Cobertura', description: 'Seleccione una Obra Social o "Particular".', status: 'error' });
         return;
    }

    setIsSubmitting(true);
    console.log('--- handleSubmit --- Mode:', isEditingMode ? 'EDIT' : 'CREATE'); 

 
    const turnoDtoBase = {
      esParticular: false, 
      pacienteId: pacienteSeleccionado?.value, 
      obraSocialId: obraSocialId, 
      precio: precio, 
    };

    try {
      if (isEditingMode) {
       
        if (!turnoAEditar?.id) throw new Error("ID del turno no encontrado");

        const dtoActualizacion = {
            esParticular: false,
            obraSocialId: turnoDtoBase.obraSocialId,
            precio: turnoDtoBase.precio,
           
        };

        console.log('Update ID:', turnoAEditar.id, 'DTO:', dtoActualizacion); 
        const turnoActualizado = await turnoService.updateTurno(turnoAEditar.id, dtoActualizacion);
        
        toast({ title: 'Turno Actualizado', status: 'success', duration: 3000 });
        
    
        onTurnoActualizado({ ...turnoActualizado, id: turnoAEditar.id }); 

      } else {
    
        if (!selectedDate) throw new Error("Falta fecha");

        const dtoCreacion = {
            ...turnoDtoBase, 
            fecha: selectedDate.toISOString(), 
            nombrePaciente: pacienteTipo === 'nuevo' ? nombrePaciente : null,
            apellidoPaciente: pacienteTipo === 'nuevo' ? apellidoPaciente : null,
            dni: pacienteTipo === 'nuevo' ? dni : null,
            terapeutaId: parseInt(terapeutaId, 10)
        };

        console.log('Create DTO:', dtoCreacion); 
        const nuevoTurno = await turnoService.createTurno(dtoCreacion);
        
        toast({ title: 'Turno Creado', description: `Turno agendado.`, status: 'success', duration: 3000 });
        onTurnoCreado(nuevoTurno); 
      }
    } catch (error) { 
      console.error('Submit Error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.response?.data || 'Error desconocido';
      toast({ title: 'Error al guardar', description: errorMessage, status: 'error', duration: 5000 });
    } finally {
      setIsSubmitting(false); 
    } 
  };

  return {
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
    terapeutasList
  };
};