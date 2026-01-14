'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface YieldOpportunity {
  id: string
  protocol: string
  logo: string
  pool: string
  apy: number
  tvl: number
  risk: 'low' | 'medium' | 'high'
  type: 'lending' | 'lp' | 'staking' | 'vault'
  tokens: string[]
  link: string
  description: string
}

const YIELD_OPPORTUNITIES: YieldOpportunity[] = [
  {
    id: '1',
    protocol: 'Marinade',
    logo: '🥷',
    pool: 'mSOL Staking',
    apy: 7.2,
    tvl: 1200000000,
    risk: 'low',
    type: 'staking',
    tokens: ['SOL', 'mSOL'],
    link: 'https://marinade.finance',
    description: 'SOLを流動性ステーキング。mSOLはDeFiで使用可能',
  },
  {
    id: '2',
    protocol: 'Jito',
    logo: '🔷',
    pool: 'JitoSOL Staking',
    apy: 7.8,
    tvl: 800000000,
    risk: 'low',
    type: 'staking',
    tokens: ['SOL', 'JitoSOL'],
    link: 'https://jito.network',
    description: 'MEV報酬付きの流動性ステーキング',
  },
  {
    id: '3',
    protocol: 'Kamino',
    logo: '🌀',
    pool: 'USDC Lending',
    apy: 12.5,
    tvl: 450000000,
    risk: 'low',
    type: 'lending',
    tokens: ['USDC'],
    link: 'https://kamino.finance',
    description: 'USDCを預けて利息を獲得。安定収益',
  },
  {
    id: '4',
    protocol: 'Kamino',
    logo: '🌀',
    pool: 'SOL Lending',
    apy: 8.3,
    tvl: 380000000,
    risk: 'low',
    type: 'lending',
    tokens: ['SOL'],
    link: 'https://kamino.finance',
    description: 'SOLを預けて利息を獲得',
  },
  {
    id: '5',
    protocol: 'Raydium',
    logo: '☀️',
    pool: 'SOL-USDC LP',
    apy: 24.5,
    tvl: 120000000,
    risk: 'medium',
    type: 'lp',
    tokens: ['SOL', 'USDC'],
    link: 'https://raydium.io',
    description: '流動性提供で取引手数料を獲得',
  },
  {
    id: '6',
    protocol: 'Orca',
    logo: '🐋',
    pool: 'SOL-USDC Whirlpool',
    apy: 28.3,
    tvl: 95000000,
    risk: 'medium',
    type: 'lp',
    tokens: ['SOL', 'USDC'],
    link: 'https://orca.so',
    description: '集中流動性プールで高効率な収益',
  },
  {
    id: '7',
    protocol: 'Meteora',
    logo: '☄️',
    pool: 'Dynamic SOL-USDC',
    apy: 35.2,
    tvl: 45000000,
    risk: 'medium',
    type: 'lp',
    tokens: ['SOL', 'USDC'],
    link: 'https://meteora.ag',
    description: 'ダイナミックプールで最適化された収益',
  },
  {
    id: '8',
    protocol: 'marginfi',
    logo: '🏦',
    pool: 'USDC Supply',
    apy: 15.2,
    tvl: 280000000,
    risk: 'low',
    type: 'lending',
    tokens: ['USDC'],
    link: 'https://marginfi.com',
    description: 'レンディング + ポイント報酬',
  },
  {
    id: '9',
    protocol: 'Solend',
    logo: '💰',
    pool: 'SOL Supply',
    apy: 6.8,
    tvl: 150000000,
    risk: 'low',
    type: 'lending',
    tokens: ['SOL'],
    link: 'https://solend.fi',
    description: '老舗レンディングプロトコル',
  },
  {
    id: '10',
    protocol: 'Raydium',
    logo: '☀️',
    pool: 'JUP-SOL LP',
    apy: 85.5,
    tvl: 25000000,
    risk: 'high',
    type: 'lp',
    tokens: ['JUP', 'SOL'],
    link: 'https://raydium.io',
    description: '高APYだがIL（変動損失）リスクあり',
  },
  {
    id: '11',
    protocol: 'Orca',
    logo: '🐋',
    pool: 'BONK-SOL Whirlpool',
    apy: 120.5,
    tvl: 15000000,
    risk: 'high',
    type: 'lp',
    tokens: ['BONK', 'SOL'],
    link: 'https://orca.so',
    description: 'ミームコインLP。超高リスク高リターン',
  },
  {
    id: '12',
    protocol: 'Sanctum',
    logo: '☁️',
    pool: 'Infinity Pool',
    apy: 9.5,
    tvl: 200000000,
    risk: 'low',
    type: 'vault',
    tokens: ['LST'],
    link: 'https://sanctum.so',
    description: 'あらゆるLSTを単一プールで運用',
  },
]

export default function DefiYield() {
  const { publicKey } = useWallet()
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'risk'>('apy')
  const [filterType, setFilterType] = useState<'all' | 'lending' | 'lp' | 'staking' | 'vault'>('all')
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  const sortedOpportunities = [...YIELD_OPPORTUNITIES]
    .filter(o => filterType === 'all' || o.type === filterType)
    .filter(o => filterRisk === 'all' || o.risk === filterRisk)
    .sort((a, b) => {
      if (sortBy === 'apy') return b.apy - a.apy
      if (sortBy === 'tvl') return b.tvl - a.tvl
      if (sortBy === 'risk') {
        const riskOrder = { low: 0, medium: 1, high: 2 }
        return riskOrder[a.risk] - riskOrder[b.risk]
      }
      return 0
    })

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-900/30 border-green-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30'
      case 'high': return 'text-red-400 bg-red-900/30 border-red-500/30'
      default: return 'text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lending': return '🏦'
      case 'lp': return '💧'
      case 'staking': return '🥩'
      case 'vault': return '🏰'
      default: return '📊'
    }
  }

  const formatTVL = (tvl: number) => {
    if (tvl >= 1000000000) return `$${(tvl / 1000000000).toFixed(1)}B`
    if (tvl >= 1000000) return `$${(tvl / 1000000).toFixed(0)}M`
    return `$${(tvl / 1000).toFixed(0)}K`
  }

  // Calculate potential earnings
  const calculateEarnings = (apy: number, amount: number) => {
    return (amount * apy / 100).toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">🌾 DeFiイールド</h2>
        <div className="text-xs text-gray-500">
          {sortedOpportunities.length}件の投資機会
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Type Filter */}
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {(['all', 'staking', 'lending', 'lp', 'vault'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterType === type
                  ? 'bg-solana-purple text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {type === 'all' ? '全て' :
               type === 'staking' ? '🥩ステーキング' :
               type === 'lending' ? '🏦レンディング' :
               type === 'lp' ? '💧LP' : '🏰Vault'}
            </button>
          ))}
        </div>

        {/* Risk Filter */}
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {(['all', 'low', 'medium', 'high'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterRisk === risk
                  ? 'bg-solana-purple text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {risk === 'all' ? '全リスク' :
               risk === 'low' ? '🟢低' :
               risk === 'medium' ? '🟡中' : '🔴高'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'apy' | 'tvl' | 'risk')}
          className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-solana-purple"
        >
          <option value="apy">APY順</option>
          <option value="tvl">TVL順</option>
          <option value="risk">リスク順</option>
        </select>
      </div>

      {/* Yield Grid */}
      <div className="grid gap-4">
        {sortedOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-solana-purple/50 transition-all hover:shadow-lg hover:shadow-solana-purple/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{opportunity.logo}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{opportunity.protocol}</span>
                    <span className="text-xs text-gray-500">{getTypeIcon(opportunity.type)}</span>
                  </div>
                  <div className="text-sm text-gray-400">{opportunity.pool}</div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  opportunity.apy >= 50 ? 'text-red-400' :
                  opportunity.apy >= 20 ? 'text-yellow-400' :
                  'text-solana-green'
                }`}>
                  {opportunity.apy}%
                </div>
                <div className="text-xs text-gray-500">APY</div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex gap-1">
                {opportunity.tokens.map((token) => (
                  <span
                    key={token}
                    className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300"
                  >
                    {token}
                  </span>
                ))}
              </div>
              <span className={`px-2 py-0.5 rounded text-xs border ${getRiskColor(opportunity.risk)}`}>
                {opportunity.risk === 'low' ? '低リスク' :
                 opportunity.risk === 'medium' ? '中リスク' : '高リスク'}
              </span>
              <span className="text-xs text-gray-500">
                TVL: {formatTVL(opportunity.tvl)}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-500">{opportunity.description}</p>

            {/* Earnings Calculator */}
            <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">$1,000投資時の年間収益</div>
              <div className="text-lg font-bold text-solana-green">
                +${calculateEarnings(opportunity.apy, 1000)}
              </div>
            </div>

            <a
              href={opportunity.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block w-full py-2 bg-gradient-to-r from-solana-purple/80 to-solana-green/80 rounded-lg text-white text-sm font-medium text-center hover:opacity-90 transition-opacity"
            >
              {opportunity.protocol}で始める →
            </a>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-red-400 mb-2">⚠️ リスクについて</h4>
        <ul className="text-xs text-red-300/80 space-y-1">
          <li>• 高APYは高リスクを意味します（特にLP）</li>
          <li>• 変動損失（IL）でトークン価格以上の損失の可能性</li>
          <li>• スマートコントラクトリスクがあります</li>
          <li>• DYORを徹底し、失っても良い金額のみ投資してください</li>
        </ul>
      </div>
    </div>
  )
}
