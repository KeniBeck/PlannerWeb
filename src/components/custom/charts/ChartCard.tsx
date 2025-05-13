import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  total?: { value: number; label: string };
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  titleGradient: { from: string; to: string };
  chartType: 'bar' | 'pie';
  chartData: ChartData<'bar' | 'pie'>;
  chartOptions?: ChartOptions<'bar' | 'pie'>;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  emptySubMessage?: string;
  height?: string | number;
  className?: string;
}

const defaultBarOptions: ChartOptions<'bar'> = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        color: '#6B7280'
      },
      grid: {
        color: '#F3F4F6'
      }
    },
    x: {
      ticks: {
        color: '#6B7280'
      },
      grid: {
        display: false
      }
    }
  }
};

const defaultPieOptions: ChartOptions<'pie'> = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        padding: 20,
        font: {
          size: 12
        },
        usePointStyle: true,
        boxWidth: 8
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      padding: 12,
      cornerRadius: 8
    }
  }
};

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  total,
  icon,
  iconBgColor,
  iconColor,
  titleGradient,
  chartType,
  chartData,
  chartOptions,
  isLoading = false,
  isEmpty = false,
  emptyIcon,
  emptyMessage = "No hay datos para mostrar",
  emptySubMessage,
  height = "72",
  className = ""
}) => {
  // Determinar qué opciones de gráfico usar
  const defaultOptions = chartType === 'bar' ? defaultBarOptions : defaultPieOptions;
  const options = chartOptions || defaultOptions;

  return (
    <div className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 
            className="text-2xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${titleGradient.from}, ${titleGradient.to})` }}
          >
            {title}
          </h2>
          {total && (
            <p className="text-gray-500 text-sm mt-1">
              Total: {total.value} {total.label}
            </p>
          )}
          {subtitle && !total && (
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${iconBgColor} rounded-lg p-2`}>
          <div className={`w-6 h-6 ${iconColor}`}>
            {icon}
          </div>
        </div>
      </div>
      <div className={`h-${height} ${chartType === 'pie' ? 'flex items-center justify-center' : 'relative'}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full">
            {emptyIcon ? (
              emptyIcon
            ) : (
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
            <p className="text-gray-500 text-center">{emptyMessage}</p>
            {emptySubMessage && (
              <p className="text-gray-400 text-sm text-center mt-2">{emptySubMessage}</p>
            )}
          </div>
        ) : (
          chartType === 'bar' ? (
            <Bar data={chartData as ChartData<'bar'>} options={options as ChartOptions<'bar'>} />
          ) : (
            <Pie data={chartData as ChartData<'pie'>} options={options as ChartOptions<'pie'>} />
          )
        )}
      </div>
    </div>
  );
};
export default ChartCard;