'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import {
  PublicKey,
  Transaction,
  StakeProgram,
  Authorized,
  Lockup,
  LAMPORTS_PER_SOL,
  Keypair,
  SystemProgram,
} from '@solana/web3.js'

interface StakeAccount {
  pubkey: string
  lamports: number
  validator: string
  status: 'active' | 'inactive' | 'activating' | 'deactivating'
}

interface Validator {
  votePubkey: string
  name: string
  commission: number
  apy: number
  totalStake: number
}

// Popular validators on Solana mainnet
const POPULAR_VALIDATORS: Validator[] = [
  { votePubkey: 'J2nUHEAgZFRyuJbFjdqPrAa9gyWDuc7hErtDQHPhsYRp', name: 'Jito', commission: 0, apy: 7.2, totalStake: 12500000 },
  { votePubkey: 'CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1', name: 'Coinbase', commission: 8, apy: 6.5, totalStake: 8900000 },
  { votePubkey: 'EARNyGtRV5YhvK6ycouKBDmVjF5t9WVxqc64veqP5sQN', name: 'Everstake', commission: 5, apy: 6.8, totalStake: 7200000 },
  { votePubkey: 'DPmsofVJ1UMRZADgwYAHGJw9G9k3BrYYaJwbiPFqUyu', name: 'Staked', commission: 6, apy: 6.7, totalStake: 5400000 },
  { votePubkey: 'HRCwgpoLT9aAwN5r21NqFXBjNRVjgN3qcmfHXQF6QNVY', name: 'Figment', commission: 7, apy: 6.6, totalStake: 4800000 },
]

export default function StakingFeature() {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([])
  const [selectedValidator, setSelectedValidator] = useState<Validator>(POPULAR_VALIDATORS[0])
  const [stakeAmount, setStakeAmount] = useState<string>('1')
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return
      try {
        const bal = await connection.getBalance(publicKey)
        setBalance(bal / LAMPORTS_PER_SOL)
      } catch (e) {
        console.error('Failed to fetch balance:', e)
      }
    }
    fetchBalance()
  }, [publicKey, connection])

  // Fetch existing stake accounts
  useEffect(() => {
    const fetchStakeAccounts = async () => {
      if (!publicKey) return
      try {
        const accounts = await connection.getParsedProgramAccounts(
          StakeProgram.programId,
          {
            filters: [
              { dataSize: 200 },
              {
                memcmp: {
                  offset: 12,
                  bytes: publicKey.toBase58(),
                },
              },
            ],
          }
        )

        const parsed: StakeAccount[] = accounts.map((acc) => {
          const data = acc.account.data as any
          return {
            pubkey: acc.pubkey.toBase58(),
            lamports: acc.account.lamports,
            validator: data.parsed?.info?.stake?.delegation?.voter || 'Unknown',
            status: 'active',
          }
        })
        setStakeAccounts(parsed)
      } catch (e) {
        console.error('Failed to fetch stake accounts:', e)
      }
    }
    fetchStakeAccounts()
  }, [publicKey, connection])

  const handleStake = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setMessage({ type: 'error', text: 'ウォレットを接続してください' })
      return
    }

    const amount = parseFloat(stakeAmount)
    if (isNaN(amount) || amount < 0.01) {
      setMessage({ type: 'error', text: '最低0.01 SOLが必要です' })
      return
    }

    if (amount > balance - 0.01) {
      setMessage({ type: 'error', text: '残高が不足しています（手数料分を残してください）' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Create stake account
      const stakeAccount = Keypair.generate()
      const lamports = amount * LAMPORTS_PER_SOL
      const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space)

      const transaction = new Transaction()

      // Create stake account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: stakeAccount.publicKey,
          lamports: lamports + minimumRent,
          space: StakeProgram.space,
          programId: StakeProgram.programId,
        })
      )

      // Initialize stake account
      transaction.add(
        StakeProgram.initialize({
          stakePubkey: stakeAccount.publicKey,
          authorized: new Authorized(publicKey, publicKey),
          lockup: new Lockup(0, 0, publicKey),
        })
      )

      // Delegate to validator
      transaction.add(
        StakeProgram.delegate({
          stakePubkey: stakeAccount.publicKey,
          authorizedPubkey: publicKey,
          votePubkey: new PublicKey(selectedValidator.votePubkey),
        })
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Sign with stake account keypair
      transaction.partialSign(stakeAccount)

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')

      setMessage({ type: 'success', text: `${amount} SOLをステーキングしました！署名: ${signature.slice(0, 8)}...` })

      // Refresh balance
      const newBal = await connection.getBalance(publicKey)
      setBalance(newBal / LAMPORTS_PER_SOL)
    } catch (error: any) {
      console.error('Staking error:', error)
      setMessage({ type: 'error', text: error.message || 'ステーキングに失敗しました' })
    } finally {
      setLoading(false)
    }
  }, [publicKey, signTransaction, sendTransaction, connection, stakeAmount, selectedValidator, balance])

  const totalStaked = stakeAccounts.reduce((sum, acc) => sum + acc.lamports, 0) / LAMPORTS_PER_SOL
  const estimatedYearlyReward = totalStaked * (selectedValidator.apy / 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">🥩 SOLステーキング</h2>
        <div className="text-sm text-gray-400">
          残高: <span className="text-solana-green font-semibold">{balance.toFixed(4)} SOL</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-solana-purple">{totalStaked.toFixed(2)}</div>
          <div className="text-xs text-gray-500">ステーキング中 (SOL)</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-solana-green">{selectedValidator.apy}%</div>
          <div className="text-xs text-gray-500">年利 (APY)</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">+{estimatedYearlyReward.toFixed(2)}</div>
          <div className="text-xs text-gray-500">年間報酬予測 (SOL)</div>
        </div>
      </div>

      {/* Validator Selection */}
      <div className="bg-gray-800/30 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">バリデータを選択</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {POPULAR_VALIDATORS.map((validator) => (
            <button
              key={validator.votePubkey}
              onClick={() => setSelectedValidator(validator)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                selectedValidator.votePubkey === validator.votePubkey
                  ? 'bg-solana-purple/30 border border-solana-purple'
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-solana-purple to-solana-green flex items-center justify-center text-sm font-bold">
                  {validator.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{validator.name}</div>
                  <div className="text-xs text-gray-500">手数料: {validator.commission}%</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-solana-green font-semibold">{validator.apy}% APY</div>
                <div className="text-xs text-gray-500">
                  {(validator.totalStake / 1000000).toFixed(1)}M SOL
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stake Input */}
      <div className="bg-gray-800/30 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">ステーキング量</h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-solana-purple"
              min="0.01"
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">SOL</span>
          </div>
          <button
            onClick={() => setStakeAmount(Math.max(0, balance - 0.01).toFixed(4))}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300"
          >
            最大
          </button>
        </div>

        <div className="mt-3 flex justify-between text-sm text-gray-500">
          <span>最低: 0.01 SOL</span>
          <span>予測年間報酬: +{(parseFloat(stakeAmount || '0') * selectedValidator.apy / 100).toFixed(4)} SOL</span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Stake Button */}
      <button
        onClick={handleStake}
        disabled={loading || !publicKey}
        className="w-full py-4 bg-gradient-to-r from-solana-purple to-solana-green rounded-xl text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            処理中...
          </span>
        ) : (
          `${stakeAmount || '0'} SOLをステーキング`
        )}
      </button>

      {/* Existing Stakes */}
      {stakeAccounts.length > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">あなたのステーキング</h3>
          <div className="space-y-2">
            {stakeAccounts.map((account) => (
              <div key={account.pubkey} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <div className="text-white font-medium">{(account.lamports / LAMPORTS_PER_SOL).toFixed(4)} SOL</div>
                  <div className="text-xs text-gray-500">{account.pubkey.slice(0, 8)}...</div>
                </div>
                <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded">
                  {account.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
