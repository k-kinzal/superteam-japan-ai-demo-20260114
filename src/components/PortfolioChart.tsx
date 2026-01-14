'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
)

interface PortfolioChartProps {
  balance: number
  solPrice: number
}

export default function PortfolioChart({ balance, solPrice }: PortfolioChartProps) {
  // Simulate historical data based on current balance
  const historicalData = useMemo(() => {
    const months = ['8月', '9月', '10月', '11月', '12月', '1月']
    const baseBalance = balance * 0.6
    const data = months.map((_, index) => {
      const growth = 1 + (index * 0.08) + (Math.random() * 0.1 - 0.05)
      return baseBalance * growth
    })
    // Make sure the last value is the current balance
    data[data.length - 1] = balance
    return { months, data }
  }, [balance])

  const lineChartData = {
    labels: historicalData.months,
    datasets: [
      {
        label: 'SOL残高',
        data: historicalData.data,
        fill: true,
        borderColor: '#9945FF',
        backgroundColor: 'rgba(153, 69, 255, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#14F195',
        pointBorderColor: '#14F195',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#14F195',
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1f2e',
        titleColor: '#fff',
        bodyColor: '#14F195',
        borderColor: '#9945FF',
        borderWidth: 1,
        callbacks: {
          label: (context: { parsed: { y: number } }) => {
            return `${context.parsed.y.toFixed(4)} SOL`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          callback: (value: number | string) => `${Number(value).toFixed(2)} SOL`,
        },
      },
    },
  }

  // Portfolio allocation simulation
  const portfolioAllocation = useMemo(() => {
    const totalValue = balance * solPrice
    return {
      labels: ['SOL (メイン)', 'ステーキング可能', 'DeFi投資用'],
      datasets: [
        {
          data: [60, 30, 10],
          backgroundColor: ['#9945FF', '#14F195', '#FFD700'],
          borderColor: ['#9945FF', '#14F195', '#FFD700'],
          borderWidth: 2,
        },
      ],
    }
  }, [balance, solPrice])

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9ca3af',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
    cutout: '60%',
  }

  return (
    <div className="h-full">
      <h3 className="text-xl font-bold text-white mb-4">📊 資産推移 & ポートフォリオ</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100%-2rem)]">
        {/* Line Chart */}
        <div className="bg-gray-800/30 rounded-xl p-4">
          <h4 className="text-gray-400 text-sm mb-3">資産推移（シミュレーション）</h4>
          <div className="h-48">
            <Line data={lineChartData} options={lineChartOptions as object} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-gray-800/30 rounded-xl p-4">
          <h4 className="text-gray-400 text-sm mb-3">推奨ポートフォリオ配分</h4>
          <div className="h-48">
            <Doughnut data={portfolioAllocation} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Value Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">今月の成長</div>
          <div className="text-lg font-bold text-solana-green">+12.4%</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">推定年間リターン</div>
          <div className="text-lg font-bold text-solana-purple">+45.2%</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">お金持ちスコア</div>
          <div className="text-lg font-bold text-yellow-400">{Math.min(Math.floor(balance * 10), 999)}</div>
        </div>
      </div>
    </div>
  )
}
