'use client'

import { useMemo } from 'react'

interface WealthMeterProps {
  balance: number
  solPrice: number
}

const wealthLevels = [
  { min: 0, max: 1, level: '初心者', emoji: '🌱', color: 'from-gray-400 to-gray-500', message: '最初の一歩！コツコツ頑張ろう！' },
  { min: 1, max: 10, level: 'ルーキー', emoji: '🥉', color: 'from-amber-700 to-amber-600', message: 'いい調子！続けていこう！' },
  { min: 10, max: 50, level: 'シルバー', emoji: '🥈', color: 'from-gray-300 to-gray-400', message: '着実に成長中！' },
  { min: 50, max: 100, level: 'ゴールド', emoji: '🥇', color: 'from-yellow-400 to-yellow-500', message: '素晴らしい！ゴールドランク！' },
  { min: 100, max: 500, level: 'プラチナ', emoji: '💎', color: 'from-cyan-300 to-cyan-400', message: 'プラチナホルダー！' },
  { min: 500, max: 1000, level: 'ダイヤモンド', emoji: '👑', color: 'from-purple-400 to-pink-400', message: '王者の風格！' },
  { min: 1000, max: 10000, level: 'マスター', emoji: '🌟', color: 'from-solana-purple to-solana-green', message: 'Solanaマスター！' },
  { min: 10000, max: Infinity, level: 'レジェンド', emoji: '🏆', color: 'from-solana-green to-yellow-400', message: '伝説のホルダー！お金持ちです！' },
]

export default function WealthMeter({ balance, solPrice }: WealthMeterProps) {
  const currentLevel = useMemo(() => {
    return wealthLevels.find(level => balance >= level.min && balance < level.max) || wealthLevels[0]
  }, [balance])

  const nextLevel = useMemo(() => {
    const currentIndex = wealthLevels.findIndex(level => level === currentLevel)
    return currentIndex < wealthLevels.length - 1 ? wealthLevels[currentIndex + 1] : null
  }, [currentLevel])

  const progressToNext = useMemo(() => {
    if (!nextLevel) return 100
    const rangeSize = currentLevel.max - currentLevel.min
    const progress = ((balance - currentLevel.min) / rangeSize) * 100
    return Math.min(progress, 100)
  }, [balance, currentLevel, nextLevel])

  const solNeededForNext = useMemo(() => {
    if (!nextLevel) return 0
    return nextLevel.min - balance
  }, [balance, nextLevel])

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-gray-400 text-sm mb-4">お金持ち度メーター</h3>

      {/* Current Level Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-6xl mb-2 animate-bounce-slow">{currentLevel.emoji}</div>
        <div className={`text-2xl font-bold bg-gradient-to-r ${currentLevel.color} bg-clip-text text-transparent`}>
          {currentLevel.level}
        </div>
        <p className="text-gray-400 text-sm mt-2 text-center">{currentLevel.message}</p>
      </div>

      {/* Progress Bar */}
      {nextLevel && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{currentLevel.level}</span>
            <span>{nextLevel.level}</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${currentLevel.color} transition-all duration-500`}
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            次のレベルまで: <span className="text-solana-green">{solNeededForNext.toFixed(2)} SOL</span>
            <span className="text-gray-600"> (${(solNeededForNext * solPrice).toFixed(2)})</span>
          </p>
        </div>
      )}

      {/* Level List */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-4 gap-1">
          {wealthLevels.slice(0, 8).map((level) => (
            <div
              key={level.level}
              className={`text-center text-lg transition-all ${
                balance >= level.min ? 'opacity-100 scale-100' : 'opacity-30 scale-90'
              }`}
              title={`${level.level}: ${level.min}+ SOL`}
            >
              {level.emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
