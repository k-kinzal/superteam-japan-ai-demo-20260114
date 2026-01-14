'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface Airdrop {
  id: string
  name: string
  logo: string
  description: string
  status: 'active' | 'upcoming' | 'ended'
  estimatedValue: string
  tasks: Task[]
  deadline?: string
  link: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Task {
  id: string
  name: string
  completed: boolean
  link?: string
}

const AIRDROPS: Airdrop[] = [
  {
    id: '1',
    name: 'Parcl',
    logo: '🏠',
    description: '不動産RWAプロトコル。トレード＆LPでポイント獲得',
    status: 'active',
    estimatedValue: '$500-2000',
    difficulty: 'medium',
    deadline: '2026年Q1',
    link: 'https://app.parcl.co',
    tasks: [
      { id: '1-1', name: 'ウォレット接続', completed: false },
      { id: '1-2', name: 'トレード実行 (最低$100)', completed: false },
      { id: '1-3', name: 'LP提供', completed: false },
      { id: '1-4', name: 'デイリーチェックイン', completed: false },
    ],
  },
  {
    id: '2',
    name: 'Zeta Markets',
    logo: '⚡',
    description: '分散型デリバティブ取引所。Z-Scoreを稼ごう',
    status: 'active',
    estimatedValue: '$300-1500',
    difficulty: 'medium',
    deadline: '未定',
    link: 'https://zeta.markets',
    tasks: [
      { id: '2-1', name: 'アカウント作成', completed: false },
      { id: '2-2', name: '入金 (最低$50)', completed: false },
      { id: '2-3', name: 'パーペチュアル取引', completed: false },
      { id: '2-4', name: 'Z-Score獲得', completed: false },
    ],
  },
  {
    id: '3',
    name: 'Marginfi',
    logo: '🏦',
    description: 'レンディングプロトコル。ポイントプログラム実施中',
    status: 'active',
    estimatedValue: '$200-1000',
    difficulty: 'easy',
    deadline: '未定',
    link: 'https://marginfi.com',
    tasks: [
      { id: '3-1', name: 'ウォレット接続', completed: false },
      { id: '3-2', name: 'SOL/USDC預け入れ', completed: false },
      { id: '3-3', name: '借り入れ実行', completed: false },
      { id: '3-4', name: 'ポイント確認', completed: false },
    ],
  },
  {
    id: '4',
    name: 'Drift Protocol',
    logo: '🌊',
    description: 'パーペチュアルDEX。DRIFT追加エアドロップ予定',
    status: 'active',
    estimatedValue: '$100-800',
    difficulty: 'medium',
    deadline: '未定',
    link: 'https://drift.trade',
    tasks: [
      { id: '4-1', name: 'アカウント作成', completed: false },
      { id: '4-2', name: 'デポジット', completed: false },
      { id: '4-3', name: '取引実行', completed: false },
      { id: '4-4', name: 'DRIFTステーキング', completed: false },
    ],
  },
  {
    id: '5',
    name: 'Sanctum',
    logo: '☁️',
    description: 'LST（流動性ステーキング）ハブ。ポイントでトークン獲得',
    status: 'active',
    estimatedValue: '$200-1200',
    difficulty: 'easy',
    deadline: '未定',
    link: 'https://sanctum.so',
    tasks: [
      { id: '5-1', name: 'SOLをLSTに変換', completed: false },
      { id: '5-2', name: 'Infinity Pool利用', completed: false },
      { id: '5-3', name: 'ペット育成', completed: false },
    ],
  },
  {
    id: '6',
    name: 'Tensor',
    logo: '🖼️',
    description: 'NFTマーケットプレイス。シーズン2実施中',
    status: 'active',
    estimatedValue: '$100-500',
    difficulty: 'easy',
    deadline: '未定',
    link: 'https://tensor.trade',
    tasks: [
      { id: '6-1', name: 'NFT購入', completed: false },
      { id: '6-2', name: 'NFT出品', completed: false },
      { id: '6-3', name: 'ビッド設置', completed: false },
    ],
  },
  {
    id: '7',
    name: 'Phantom',
    logo: '👻',
    description: 'ウォレット。将来のトークン発行に備えてアクティブに',
    status: 'upcoming',
    estimatedValue: '$???',
    difficulty: 'easy',
    link: 'https://phantom.app',
    tasks: [
      { id: '7-1', name: 'Phantomウォレット使用', completed: false },
      { id: '7-2', name: 'スワップ機能利用', completed: false },
      { id: '7-3', name: 'NFT表示', completed: false },
    ],
  },
  {
    id: '8',
    name: 'Magic Eden',
    logo: '✨',
    description: 'マルチチェーンNFTマーケット。ダイヤモンド報酬',
    status: 'active',
    estimatedValue: '$50-300',
    difficulty: 'easy',
    deadline: '継続中',
    link: 'https://magiceden.io',
    tasks: [
      { id: '8-1', name: 'NFT取引', completed: false },
      { id: '8-2', name: 'ダイヤモンド獲得', completed: false },
    ],
  },
]

export default function AirdropHunter() {
  const { publicKey } = useWallet()
  const [airdrops, setAirdrops] = useState<Airdrop[]>(AIRDROPS)
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('active')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleTask = (airdropId: string, taskId: string) => {
    setAirdrops(prev => prev.map(airdrop => {
      if (airdrop.id === airdropId) {
        return {
          ...airdrop,
          tasks: airdrop.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        }
      }
      return airdrop
    }))
  }

  const filteredAirdrops = airdrops.filter(a =>
    filter === 'all' ? true : a.status === filter
  )

  const totalEstimatedValue = filteredAirdrops
    .filter(a => a.status === 'active')
    .reduce((sum, a) => {
      const match = a.estimatedValue.match(/\$(\d+)-(\d+)/)
      if (match) return sum + (parseInt(match[1]) + parseInt(match[2])) / 2
      return sum
    }, 0)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-900/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/30'
      case 'hard': return 'text-red-400 bg-red-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  const getProgress = (tasks: Task[]) => {
    const completed = tasks.filter(t => t.completed).length
    return (completed / tasks.length) * 100
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">🎁 エアドロップハンター</h2>
        <div className="text-right">
          <div className="text-xs text-gray-500">推定獲得可能額</div>
          <div className="text-lg font-bold text-solana-green">${totalEstimatedValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['active', 'upcoming', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-solana-purple text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f === 'active' ? '🔥 アクティブ' : f === 'upcoming' ? '⏳ 近日開始' : '📋 すべて'}
          </button>
        ))}
      </div>

      {/* Airdrop List */}
      <div className="space-y-3">
        {filteredAirdrops.map((airdrop) => (
          <div
            key={airdrop.id}
            className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-solana-purple/50 transition-colors"
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(expandedId === airdrop.id ? null : airdrop.id)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{airdrop.logo}</div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{airdrop.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(airdrop.difficulty)}`}>
                      {airdrop.difficulty === 'easy' ? '簡単' : airdrop.difficulty === 'medium' ? '普通' : '難しい'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">{airdrop.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-solana-green font-semibold">{airdrop.estimatedValue}</div>
                  {airdrop.deadline && (
                    <div className="text-xs text-gray-500">〆 {airdrop.deadline}</div>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === airdrop.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Progress Bar */}
            <div className="px-4 pb-2">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-solana-purple to-solana-green transition-all"
                  style={{ width: `${getProgress(airdrop.tasks)}%` }}
                />
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === airdrop.id && (
              <div className="px-4 pb-4 space-y-3">
                <div className="border-t border-gray-700 pt-3">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">タスク一覧</h4>
                  <div className="space-y-2">
                    {airdrop.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-2 bg-gray-700/30 rounded-lg"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTask(airdrop.id, task.id)
                          }}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            task.completed
                              ? 'bg-solana-green text-black'
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          {task.completed && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {task.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={airdrop.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-gradient-to-r from-solana-purple to-solana-green rounded-lg text-white font-semibold text-center hover:opacity-90 transition-opacity"
                >
                  🚀 {airdrop.name}を始める
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-gray-800/30 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-2">🎯 エアドロップ攻略のコツ</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>✓ 複数のプロトコルを並行して利用する</li>
          <li>✓ 少額でもいいので実際に取引する</li>
          <li>✓ Discord/Twitterをフォローして最新情報をチェック</li>
          <li>✓ 早期ユーザーほど報酬が大きい傾向</li>
          <li>⚠️ 詐欺サイトに注意！公式リンクのみ使用</li>
        </ul>
      </div>
    </div>
  )
}
