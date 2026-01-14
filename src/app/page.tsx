'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import StakingFeature from '@/components/StakingFeature'
import SwapFeature from '@/components/SwapFeature'
import AirdropHunter from '@/components/AirdropHunter'
import DefiYield from '@/components/DefiYield'

type Tab = 'staking' | 'swap' | 'airdrop' | 'defi'

export default function Home() {
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState<number>(0)
  const [solPrice, setSolPrice] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<Tab>('staking')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd,jpy'
        )
        const data = await response.json()
        setSolPrice(data.solana.usd)
      } catch (error) {
        console.error('Failed to fetch SOL price:', error)
        setSolPrice(100)
      }
    }
    fetchSolPrice()
    const interval = setInterval(fetchSolPrice, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setBalance(0)
        return
      }

      setLoading(true)
      try {
        const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
        const bal = await connection.getBalance(publicKey)
        setBalance(bal / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error('Failed to fetch balance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [publicKey])

  const totalValueUSD = balance * solPrice

  const tabs: { id: Tab; label: string; icon: string; description: string }[] = [
    { id: 'staking', label: 'ステーキング', icon: '🥩', description: 'SOLをステークして年利7%+' },
    { id: 'swap', label: 'スワップ', icon: '💱', description: 'トークンを交換して利益を狙う' },
    { id: 'airdrop', label: 'エアドロップ', icon: '🎁', description: '無料でトークンをゲット' },
    { id: 'defi', label: 'DeFiイールド', icon: '🌾', description: '高利回り投資機会' },
  ]

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gradient">
                💰 Solana Wealth App
              </h1>
              <span className="hidden md:inline-block px-3 py-1 bg-solana-green/20 text-solana-green text-xs font-medium rounded-full">
                お金持ちになろう
              </span>
            </div>
            <div className="flex items-center gap-4">
              {connected && (
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-gray-400">残高</div>
                  <div className="font-semibold text-white">
                    {loading ? '...' : `${balance.toFixed(2)} SOL`}
                    <span className="text-solana-green text-sm ml-2">
                      (${totalValueUSD.toFixed(0)})
                    </span>
                  </div>
                </div>
              )}
              <WalletMultiButton className="!bg-gradient-to-r !from-solana-purple !to-solana-green hover:opacity-90 transition-opacity !rounded-xl" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!connected ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <div className="card-gradient border-gradient rounded-3xl p-8 md:p-12 text-center max-w-3xl">
            <div className="text-8xl mb-6 animate-float">🚀</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Solanaでお金持ちになろう！
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              ウォレットを接続して、資産を増やす旅を始めましょう
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className="bg-gray-800/50 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl mb-2">{tab.icon}</div>
                  <div className="text-white font-medium text-sm">{tab.label}</div>
                  <div className="text-gray-500 text-xs mt-1">{tab.description}</div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="bg-gray-800/30 rounded-xl p-6 text-left">
              <h3 className="text-white font-semibold mb-4 text-center">このアプリでできること</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-solana-green">✓</span>
                  <span>SOLをステーキングして年利7%以上の報酬を獲得</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-solana-green">✓</span>
                  <span>Jupiter DEXで最適レートでトークンをスワップ</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-solana-green">✓</span>
                  <span>最新のエアドロップ情報で無料トークンをゲット</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-solana-green">✓</span>
                  <span>DeFiの高利回り投資機会を発見</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-4">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-solana-purple to-solana-green text-white shadow-lg shadow-solana-purple/25'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card-gradient rounded-xl p-4">
              <div className="text-gray-400 text-xs">SOL残高</div>
              <div className="text-xl font-bold text-white">{balance.toFixed(4)}</div>
              <div className="text-solana-green text-sm">${totalValueUSD.toFixed(2)}</div>
            </div>
            <div className="card-gradient rounded-xl p-4">
              <div className="text-gray-400 text-xs">SOL価格</div>
              <div className="text-xl font-bold text-white">${solPrice.toFixed(2)}</div>
              <div className="text-gray-500 text-sm">USD</div>
            </div>
            <div className="card-gradient rounded-xl p-4">
              <div className="text-gray-400 text-xs">ステーキング報酬</div>
              <div className="text-xl font-bold text-solana-green">7.2%</div>
              <div className="text-gray-500 text-sm">年利 (APY)</div>
            </div>
            <div className="card-gradient rounded-xl p-4">
              <div className="text-gray-400 text-xs">エアドロップ機会</div>
              <div className="text-xl font-bold text-solana-purple">8件</div>
              <div className="text-gray-500 text-sm">アクティブ</div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="card-gradient border-gradient rounded-2xl p-6">
            {activeTab === 'staking' && <StakingFeature />}
            {activeTab === 'swap' && <SwapFeature />}
            {activeTab === 'airdrop' && <AirdropHunter />}
            {activeTab === 'defi' && <DefiYield />}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-solana-purple/20 to-transparent rounded-xl p-4 border border-solana-purple/30">
              <h4 className="text-white font-semibold mb-2">🎯 今日のおすすめ</h4>
              <p className="text-gray-400 text-sm mb-3">
                Sanctumでステーキングして、エアドロップ資格も獲得しよう
              </p>
              <a
                href="https://sanctum.so"
                target="_blank"
                rel="noopener noreferrer"
                className="text-solana-purple text-sm font-medium hover:underline"
              >
                Sanctumを開く →
              </a>
            </div>
            <div className="bg-gradient-to-br from-solana-green/20 to-transparent rounded-xl p-4 border border-solana-green/30">
              <h4 className="text-white font-semibold mb-2">💡 お金持ちTips</h4>
              <p className="text-gray-400 text-sm mb-3">
                複数のDeFiプロトコルを使って、ポイントを効率的に稼ごう
              </p>
              <button
                onClick={() => setActiveTab('defi')}
                className="text-solana-green text-sm font-medium hover:underline"
              >
                DeFi一覧を見る →
              </button>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-transparent rounded-xl p-4 border border-yellow-500/30">
              <h4 className="text-white font-semibold mb-2">⚠️ 注意</h4>
              <p className="text-gray-400 text-sm">
                投資は自己責任です。失っても良い金額のみ投資してください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Built with 💜 on Solana | Superteam Japan AI Demo 2026
          </p>
          <p className="mt-2 text-xs text-gray-600">
            ※このアプリは教育・デモ目的です。投資判断は自己責任でお願いします。
          </p>
        </div>
      </footer>
    </main>
  )
}
