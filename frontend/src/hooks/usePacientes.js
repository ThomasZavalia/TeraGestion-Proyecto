import { useState, useEffect, use, useCallback} from "react";
import { pacienteService } from "../services/PacienteService/PacienteService";



export const usePacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    
      const cargarPacientes = useCallback(async (filtros = {}) => {
        try {
            setLoading(true);
        
            const data = await pacienteService.getPacientes(filtros); 
            setPacientes(data);
            setError(null);
        } catch (err) {
            console.error("Error al cargar pacientes:", err);
            setError(err);
            setPacientes([]);
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        
        cargarPacientes({}); 
    }, [cargarPacientes]);

    const eliminarPaciente = async (id) => {
        try {
            await pacienteService.eliminarPaciente(id);
            cargarPacientes({}); 
        } catch (err) {
            console.error("Error al eliminar el paciente:", err);
            throw err;
        }
    };
    
    
    return { pacientes, loading, error, recargarPacientes: cargarPacientes, eliminarPaciente };
}