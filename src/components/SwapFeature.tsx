'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, VersionedTransaction } from '@solana/web3.js'

interface Token {
  symbol: string
  name: string
  mint: string
  decimals: number
  logoURI: string
  balance?: number
}

const POPULAR_TOKENS: Token[] = [
  { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', decimals: 9, logoURI: '◎' },
  { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, logoURI: '$' },
  { symbol: 'USDT', name: 'Tether', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, logoURI: '₮' },
  { symbol: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6, logoURI: '🪐' },
  { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, logoURI: '🐕' },
  { symbol: 'WIF', name: 'dogwifhat', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6, logoURI: '🎩' },
  { symbol: 'PYTH', name: 'Pyth Network', mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', decimals: 6, logoURI: '🔮' },
  { symbol: 'RAY', name: 'Raydium', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6, logoURI: '☀️' },
]

export default function SwapFeature() {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()

  const [fromToken, setFromToken] = useState<Token>(POPULAR_TOKENS[0])
  const [toToken, setToToken] = useState<Token>(POPULAR_TOKENS[1])
  const [fromAmount, setFromAmount] = useState<string>('')
  const [toAmount, setToAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [priceImpact, setPriceImpact] = useState<number>(0)
  const [showFromTokenList, setShowFromTokenList] = useState(false)
  const [showToTokenList, setShowToTokenList] = useState(false)

  // Get quote from Jupiter
  const getQuote = useCallback(async (inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setToAmount('')
      return
    }

    setQuoteLoading(true)
    try {
      const amount = Math.floor(parseFloat(inputAmount) * Math.pow(10, fromToken.decimals))

      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${fromToken.mint}&outputMint=${toToken.mint}&amount=${amount}&slippageBps=50`
      )

      if (!response.ok) throw new Error('Quote failed')

      const data = await response.json()
      const outAmount = parseInt(data.outAmount) / Math.pow(10, toToken.decimals)
      setToAmount(outAmount.toFixed(6))
      setPriceImpact(parseFloat(data.priceImpactPct) || 0)
    } catch (error) {
      console.error('Quote error:', error)
      setToAmount('')
    } finally {
      setQuoteLoading(false)
    }
  }, [fromToken, toToken])

  // Debounced quote fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount) {
        getQuote(fromAmount)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [fromAmount, getQuote])

  const handleSwap = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setMessage({ type: 'error', text: 'ウォレットを接続してください' })
      return
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setMessage({ type: 'error', text: '金額を入力してください' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const amount = Math.floor(parseFloat(fromAmount) * Math.pow(10, fromToken.decimals))

      // Get quote
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${fromToken.mint}&outputMint=${toToken.mint}&amount=${amount}&slippageBps=50`
      )
      const quote = await quoteResponse.json()

      // Get swap transaction
      const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toString(),
          wrapAndUnwrapSol: true,
        }),
      })

      const { swapTransaction } = await swapResponse.json()

      // Deserialize and sign
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf)
      const signedTransaction = await signTransaction(transaction)

      // Send transaction
      const rawTransaction = signedTransaction.serialize()
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
      })

      await connection.confirmTransaction(txid, 'confirmed')

      setMessage({
        type: 'success',
        text: `スワップ成功！${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`
      })
      setFromAmount('')
      setToAmount('')
    } catch (error: any) {
      console.error('Swap error:', error)
      setMessage({ type: 'error', text: error.message || 'スワップに失敗しました' })
    } finally {
      setLoading(false)
    }
  }, [publicKey, signTransaction, connection, fromAmount, toAmount, fromToken, toToken])

  const switchTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const TokenSelector = ({
    selected,
    onSelect,
    show,
    setShow,
    exclude
  }: {
    selected: Token
    onSelect: (token: Token) => void
    show: boolean
    setShow: (show: boolean) => void
    exclude: string
  }) => (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors"
      >
        <span className="text-xl">{selected.logoURI}</span>
        <span className="text-white font-medium">{selected.symbol}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {show && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-700 max-h-64 overflow-y-auto">
          {POPULAR_TOKENS.filter(t => t.mint !== exclude).map((token) => (
            <button
              key={token.mint}
              onClick={() => {
                onSelect(token)
                setShow(false)
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors"
            >
              <span className="text-xl">{token.logoURI}</span>
              <div className="text-left">
                <div className="text-white font-medium">{token.symbol}</div>
                <div className="text-xs text-gray-500">{token.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">💱 トークンスワップ</h2>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Powered by Jupiter</span>
      </div>

      {/* From Token */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">支払い</span>
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-3xl text-white focus:outline-none"
          />
          <TokenSelector
            selected={fromToken}
            onSelect={setFromToken}
            show={showFromTokenList}
            setShow={setShowFromTokenList}
            exclude={toToken.mint}
          />
        </div>
      </div>

      {/* Switch Button */}
      <div className="flex justify-center -my-3 relative z-10">
        <button
          onClick={switchTokens}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors border-4 border-gray-900"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* To Token */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">受け取り</span>
          {quoteLoading && <span className="text-xs text-solana-purple">見積もり中...</span>}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={toAmount}
            readOnly
            placeholder="0.0"
            className="flex-1 bg-transparent text-3xl text-white focus:outline-none"
          />
          <TokenSelector
            selected={toToken}
            onSelect={setToToken}
            show={showToTokenList}
            setShow={setShowToTokenList}
            exclude={fromToken.mint}
          />
        </div>
      </div>

      {/* Price Info */}
      {toAmount && fromAmount && (
        <div className="bg-gray-800/30 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">レート</span>
            <span className="text-white">
              1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">価格影響</span>
            <span className={priceImpact > 1 ? 'text-red-400' : 'text-green-400'}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">スリッページ許容</span>
            <span className="text-white">0.5%</span>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={loading || !publicKey || !fromAmount || !toAmount}
        className="w-full py-4 bg-gradient-to-r from-solana-purple to-solana-green rounded-xl text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            スワップ中...
          </span>
        ) : !publicKey ? (
          'ウォレットを接続'
        ) : (
          'スワップ'
        )}
      </button>

      {/* Tips */}
      <div className="bg-gray-800/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">💡 トレードのコツ</h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• 大きな取引は価格影響が大きくなります</li>
          <li>• ミームコインは変動が激しいので注意</li>
          <li>• JUP/BONK/WIFなどは高リスク高リターン</li>
        </ul>
      </div>
    </div>
  )
}
