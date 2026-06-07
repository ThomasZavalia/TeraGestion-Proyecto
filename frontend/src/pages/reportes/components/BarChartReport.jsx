import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartCard from './ChartCard'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChartReport = ({ title, data, dataLabel, labelField = 'mes', valueField = 'valor', isLoading, formatValue = (v) => v }) => {
  const isEmpty = !data || data.length === 0;

  const chartData = {
    labels: data?.map(item => item[labelField]) || [],
    datasets: [
      {
        label: dataLabel,
        data: data?.map(item => item[valueField]) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Azul
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: { display: false }, 
      title: { display: false }, 
      tooltip: {
         callbacks: {
             label: function(context) {
                 let label = context.dataset.label || '';
                 if (label) { label += ': '; }
                 if (context.parsed.y !== null) {
                     // Formatea el valor (ej. añade '$')
                     label += formatValue(context.parsed.y);
                 }
                 return label;
             }
         }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
             callback: function(value) {
                // Formatea el eje Y
                 return formatValue(value);
             }
        }
      },
    },
  };

  return (
    <ChartCard title={title} isLoading={isLoading} isEmpty={isEmpty}>
      <Bar options={options} data={chartData} />
    </ChartCard>
  );
};

export default BarChartReport;