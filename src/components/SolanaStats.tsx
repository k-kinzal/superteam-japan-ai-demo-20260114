'use client'

import { useEffect, useState } from 'react'

interface NetworkStats {
  tps: number
  totalTransactions: string
  validators: number
  blockHeight: number
  epoch: number
}

export default function SolanaStats() {
  const [stats, setStats] = useState<NetworkStats>({
    tps: 3500,
    totalTransactions: '250B+',
    validators: 1800,
    blockHeight: 250000000,
    epoch: 600,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        tps: Math.floor(2500 + Math.random() * 2000),
        blockHeight: prev.blockHeight + Math.floor(Math.random() * 3),
      }))
    }, 2000)

    setLoading(false)

    return () => clearInterval(interval)
  }, [])

  const statItems = [
    { label: 'TPS (取引/秒)', value: stats.tps.toLocaleString(), icon: '⚡' },
    { label: '総取引数', value: stats.totalTransactions, icon: '📊' },
    { label: 'バリデータ数', value: stats.validators.toLocaleString(), icon: '🔐' },
    { label: 'ブロック高', value: stats.blockHeight.toLocaleString(), icon: '🧱' },
  ]

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-gray-400 text-sm mb-4">Solanaネットワーク統計</h3>

      <div className="flex-1 grid grid-cols-2 gap-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="bg-gray-800/30 rounded-xl p-3 flex flex-col items-center justify-center text-center"
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-lg font-bold text-white">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                item.value
              )}
            </span>
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Network Health Indicator */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">ネットワーク状態</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-solana-green rounded-full animate-pulse"></span>
            <span className="text-sm text-solana-green">正常稼働中</span>
          </div>
        </div>
      </div>

      {/* Solana Features */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-gray-800/20 rounded-lg">
          <div className="text-xs text-solana-purple font-semibold">高速</div>
          <div className="text-[10px] text-gray-500">400ms確定</div>
        </div>
        <div className="text-center p-2 bg-gray-800/20 rounded-lg">
          <div className="text-xs text-solana-green font-semibold">低コスト</div>
          <div className="text-[10px] text-gray-500">$0.00025/tx</div>
        </div>
        <div className="text-center p-2 bg-gray-800/20 rounded-lg">
          <div className="text-xs text-yellow-400 font-semibold">エコ</div>
          <div className="text-[10px] text-gray-500">省エネルギー</div>
        </div>
      </div>
    </div>
  )
}
