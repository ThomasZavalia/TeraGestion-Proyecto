import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartCard from './ChartCard';

ChartJS.register(ArcElement, Tooltip, Legend);


const SEMANTIC_COLORS = {
 
  'reservado': '#3182CE',               
  'atendido': '#48BB78',               
  'cancelado': '#E53E3E',            
  'ausente': '#DD6B20',               
  'pendiente de cierre': '#A0AEC0',    
  'pendienteconfirmacion': '#D69E2E', 

  'pagado': '#48BB78',  
  'pendiente': '#3182CE', 
  'efectivo': '#38A169',      
  'transferencia': '#805AD5', 
  'mercadopago': '#009EE3',  
  'tarjeta': '#2B6CB0',       
  'debito': '#2C5282',        
  'credito': '#2A4365',      
};

const defaultPalette = [
  '#3182CE', '#38B2AC', '#805AD5', '#D69E2E', '#E53E3E', '#718096',
];

const getColorForLabel = (label, index) => {
  if (!label) return defaultPalette[index % defaultPalette.length];
  
  const normalizedLabel = label.toString().toLowerCase().trim();

  if (SEMANTIC_COLORS[normalizedLabel]) {
    return SEMANTIC_COLORS[normalizedLabel];
  }

  return defaultPalette[index % defaultPalette.length];
};

const PieChartReport = ({ title, data, labelField, valueField, isLoading }) => {
  const isEmpty = !data || data.length === 0;


  const backgroundColors = data?.map((item, index) => 
    getColorForLabel(item[labelField], index)
  ) || [];

  const chartData = {
    labels: data?.map(item => item[labelField]) || [],
    datasets: [
      {
        label: title,
        data: data?.map(item => item[valueField]) || [],
        backgroundColor: backgroundColors, 
        borderColor: 'white', 
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', 
        labels: {
            usePointStyle: true, 
            padding: 20,
        }
      },
      title: { display: false },
    },
  };

  return (
    <ChartCard title={title} isLoading={isLoading} isEmpty={isEmpty}>
      <Pie options={options} data={chartData} />
    </ChartCard>
  );
};

export default PieChartReport;