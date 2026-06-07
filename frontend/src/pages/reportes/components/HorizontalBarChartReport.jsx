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

const HorizontalBarChartReport = ({ title, data, dataLabel, labelField, valueField, isLoading }) => {
   const isEmpty = !data || data.length === 0;

  const chartData = {
    labels: data?.map(item => item[labelField]) || [], 
    datasets: [
      {
        label: dataLabel,
        data: data?.map(item => item[valueField]) || [], 
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y', 
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { 
        beginAtZero: true,
        ticks: {
          precision: 0 
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

export default HorizontalBarChartReport;