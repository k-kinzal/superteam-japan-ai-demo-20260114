'use client'

import { useState, useMemo } from 'react'

interface StakingSimulatorProps {
  currentBalance: number
  solPrice: number
}

export default function StakingSimulator({ currentBalance, solPrice }: StakingSimulatorProps) {
  const [stakingAmount, setStakingAmount] = useState<number>(currentBalance)
  const [stakingYears, setStakingYears] = useState<number>(3)
  const [apy, setApy] = useState<number>(6.5)

  const projections = useMemo(() => {
    const yearlyProjections = []
    let currentAmount = stakingAmount

    for (let year = 1; year <= stakingYears; year++) {
      const reward = currentAmount * (apy / 100)
      currentAmount += reward
      yearlyProjections.push({
        year,
        balance: currentAmount,
        totalReward: currentAmount - stakingAmount,
        valueUSD: currentAmount * solPrice,
      })
    }

    return yearlyProjections
  }, [stakingAmount, stakingYears, apy, solPrice])

  const finalProjection = projections[projections.length - 1]

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-bold text-white mb-4">📈 ステーキングシミュレーター</h3>

      {/* Input Controls */}
      <div className="space-y-4 mb-6">
        {/* Staking Amount */}
        <div>
          <label className="text-gray-400 text-sm block mb-2">
            ステーキング量: <span className="text-solana-green">{stakingAmount.toFixed(2)} SOL</span>
          </label>
          <input
            type="range"
            min="0"
            max={Math.max(currentBalance * 2, 100)}
            step="0.1"
            value={stakingAmount}
            onChange={(e) => setStakingAmount(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-solana-purple"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 SOL</span>
            <span>{Math.max(currentBalance * 2, 100).toFixed(0)} SOL</span>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-gray-400 text-sm block mb-2">
            期間: <span className="text-solana-green">{stakingYears}年</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={stakingYears}
            onChange={(e) => setStakingYears(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-solana-purple"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1年</span>
            <span>10年</span>
          </div>
        </div>

        {/* APY */}
        <div>
          <label className="text-gray-400 text-sm block mb-2">
            年利 (APY): <span className="text-solana-green">{apy}%</span>
          </label>
          <input
            type="range"
            min="3"
            max="12"
            step="0.5"
            value={apy}
            onChange={(e) => setApy(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-solana-purple"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>3%</span>
            <span>12%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      {finalProjection && (
        <div className="flex-1">
          <div className="bg-gradient-to-br from-solana-purple/20 to-solana-green/20 rounded-xl p-4 border border-solana-purple/30">
            <div className="text-center mb-4">
              <div className="text-gray-400 text-sm">{stakingYears}年後の予想資産</div>
              <div className="text-3xl font-bold text-white mt-1">
                {finalProjection.balance.toFixed(2)} SOL
              </div>
              <div className="text-xl text-solana-green">
                ${finalProjection.valueUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">総報酬</div>
                <div className="text-lg font-bold text-solana-green">
                  +{finalProjection.totalReward.toFixed(2)} SOL
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">成長率</div>
                <div className="text-lg font-bold text-solana-purple">
                  +{((finalProjection.balance / stakingAmount - 1) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Yearly Breakdown */}
          <div className="mt-4">
            <div className="text-gray-400 text-xs mb-2">年次予測</div>
            <div className="grid grid-cols-5 gap-1 overflow-x-auto">
              {projections.slice(0, 5).map((proj) => (
                <div key={proj.year} className="bg-gray-800/30 rounded p-2 text-center min-w-[60px]">
                  <div className="text-xs text-gray-500">{proj.year}年目</div>
                  <div className="text-sm font-semibold text-white">
                    {proj.balance.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-600 text-center">
          ※シミュレーション結果は参考値です。実際の報酬は変動します。
        </p>
      </div>
    </div>
  )
}
