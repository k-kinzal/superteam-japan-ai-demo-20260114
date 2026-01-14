'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import WealthMeter from '@/components/WealthMeter'
import PortfolioChart from '@/components/PortfolioChart'
import StakingSimulator from '@/components/StakingSimulator'
import SolanaStats from '@/components/SolanaStats'

export default function Home() {
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState<number>(0)
  const [solPrice, setSolPrice] = useState<number>(0)
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
        setSolPrice(100) // Fallback price
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

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2">
            💰 Solana Wealth App
          </h1>
          <p className="text-gray-400 text-lg">
            Solanaでお金持ちになろう！
          </p>
        </div>
        <WalletMultiButton className="!bg-gradient-to-r !from-solana-purple !to-solana-green hover:opacity-90 transition-opacity" />
      </header>

      {/* Main Content */}
      {!connected ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="card-gradient border-gradient rounded-3xl p-12 text-center max-w-2xl">
            <div className="text-8xl mb-6 animate-float">🚀</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              ウォレットを接続して始めよう！
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Phantomやその他のSolanaウォレットを接続して、<br />
              あなたの「お金持ち度」をチェックしましょう！
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="px-4 py-2 bg-gray-800 rounded-full">📊 資産追跡</span>
              <span className="px-4 py-2 bg-gray-800 rounded-full">💎 お金持ち度メーター</span>
              <span className="px-4 py-2 bg-gray-800 rounded-full">📈 ステーキングシミュレーター</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="card-gradient border-gradient rounded-2xl p-6 glow-purple">
            <h3 className="text-gray-400 text-sm mb-2">あなたの資産</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold text-white mb-1">
                  {balance.toFixed(4)} SOL
                </div>
                <div className="text-2xl text-solana-green">
                  ${totalValueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  SOL価格: ${solPrice.toFixed(2)}
                </div>
              </>
            )}
          </div>

          {/* Wealth Meter */}
          <div className="card-gradient border-gradient rounded-2xl p-6 glow-green">
            <WealthMeter balance={balance} solPrice={solPrice} />
          </div>

          {/* Solana Network Stats */}
          <div className="card-gradient border-gradient rounded-2xl p-6">
            <SolanaStats />
          </div>

          {/* Portfolio Chart */}
          <div className="card-gradient border-gradient rounded-2xl p-6 lg:col-span-2">
            <PortfolioChart balance={balance} solPrice={solPrice} />
          </div>

          {/* Staking Simulator */}
          <div className="card-gradient border-gradient rounded-2xl p-6 xl:col-span-1 lg:col-span-2 xl:row-span-1">
            <StakingSimulator currentBalance={balance} solPrice={solPrice} />
          </div>

          {/* Motivational Tips */}
          <div className="card-gradient border-gradient rounded-2xl p-6 lg:col-span-2 xl:col-span-3">
            <h3 className="text-xl font-bold text-white mb-4">💡 お金持ちになるためのヒント</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="text-white font-semibold mb-1">コツコツ積み立て</h4>
                <p className="text-gray-400 text-sm">毎月少しずつSOLを購入して、長期保有しましょう</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="text-white font-semibold mb-1">ステーキング活用</h4>
                <p className="text-gray-400 text-sm">SOLをステーキングして、年利5-7%の報酬をゲット</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="text-2xl mb-2">🧘</div>
                <h4 className="text-white font-semibold mb-1">HODL精神</h4>
                <p className="text-gray-400 text-sm">短期の値動きに惑わされず、長期視点で投資しましょう</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Built with 💜 on Solana | Superteam Japan AI Demo 2026</p>
        <p className="mt-2 text-xs">
          ※投資は自己責任でお願いします。このアプリは教育・エンターテイメント目的です。
        </p>
      </footer>
    </main>
  )
}
