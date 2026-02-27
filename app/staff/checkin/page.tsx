'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  QrCode, Keyboard, CheckCircle2, XCircle, ArrowLeft,
  Loader2, RotateCcw, Ticket, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateTicket, confirmCheckin } from '../actions'

type Tab = 'scan' | 'manual'
type CheckinState = 'idle' | 'validating' | 'valid' | 'invalid' | 'confirming' | 'done' | 'error'

interface TicketInfo {
  ticket_id: string
  code: string
  status: string
  event_id: string
}

export default function CheckinPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const eventId = searchParams.get('eventId') ?? ''
  const eventName = searchParams.get('eventName') ?? 'Sự kiện'

  const [tab, setTab] = useState<Tab>('scan')
  const [manualCode, setManualCode] = useState('')
  const [state, setState] = useState<CheckinState>('idle')
  const [message, setMessage] = useState('')
  const [ticket, setTicket] = useState<TicketInfo | null>(null)
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrcodeRef = useRef<any>(null)

  const handleScanResult = useCallback(async (code: string) => {
    if (state !== 'idle') return

    if (html5QrcodeRef.current) {
      try { await html5QrcodeRef.current.stop() } catch { /* ignore */ }
    }

    await doValidate(code)
  }, [state, eventId])

  useEffect(() => {
    if (tab !== 'scan' || !scannerRef.current || state !== 'idle') return

    let scanner: any = null

    async function startScanner() {
      const { Html5Qrcode } = await import('html5-qrcode')
      scanner = new Html5Qrcode('qr-reader')
      html5QrcodeRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            handleScanResult(decodedText)
          },
          () => {}
        )
      } catch {
        // Camera not available
      }
    }

    startScanner()

    return () => {
      if (scanner) {
        try { scanner.stop() } catch { /* ignore */ }
      }
    }
  }, [tab, state, handleScanResult])

  async function doValidate(code: string) {
    setState('validating')
    setMessage('')

    const result = await validateTicket(eventId, code)

    if (result.valid && result.ticket) {
      setTicket(result.ticket as TicketInfo)
      setState('valid')
      setMessage(`Vé hợp lệ: ${result.ticket.code}`)
    } else {
      setTicket(result.ticket as TicketInfo | null)
      setState('invalid')
      setMessage(result.error ?? 'Vé không hợp lệ')
    }
  }

  async function handleConfirm() {
    if (!ticket) return
    setState('confirming')

    const result = await confirmCheckin(eventId, ticket.ticket_id)

    if (result.success) {
      setState('done')
      setMessage('Check-in thành công!')
    } else {
      setState('error')
      setMessage(result.error ?? 'Lỗi khi check-in')
    }
  }

  function handleReset() {
    setState('idle')
    setMessage('')
    setTicket(null)
    setManualCode('')
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!manualCode.trim()) return
    doValidate(manualCode.trim().toUpperCase())
  }

  if (!eventId) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Vui lòng chọn sự kiện trước</p>
        <Button variant="link" onClick={() => router.push('/staff')}>
          Quay lại danh sách sự kiện
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/staff')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold truncate">Check-in</h1>
          <p className="text-sm text-muted-foreground truncate">{decodeURIComponent(eventName)}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-secondary rounded-lg p-1">
        <button
          onClick={() => { setTab('scan'); handleReset() }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'scan' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Quét QR
        </button>
        <button
          onClick={() => { setTab('manual'); handleReset() }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'manual' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          Nhập mã
        </button>
      </div>

      {/* Input Area */}
      {state === 'idle' && (
        <>
          {tab === 'scan' ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div
                id="qr-reader"
                ref={scannerRef}
                className="w-full aspect-square bg-black"
              />
              <p className="text-center text-sm text-muted-foreground py-3">
                Hướng camera vào mã QR trên vé
              </p>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <label className="block text-sm font-medium mb-2">Nhập mã vé</label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="VD: TKT-A1B2C3"
                  autoFocus
                  className="w-full px-4 py-3 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-lg text-center tracking-wider"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={!manualCode.trim()}>
                <Ticket className="w-4 h-4 mr-2" />
                Kiểm tra vé
              </Button>
            </form>
          )}
        </>
      )}

      {/* Validating */}
      {state === 'validating' && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary mb-3" />
          <p className="font-medium">Đang xác thực vé...</p>
        </div>
      )}

      {/* Valid - Ready to confirm */}
      {state === 'valid' && ticket && (
        <div className="bg-card border-2 border-green-500/50 rounded-xl p-6 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 mx-auto text-green-500" />
          <div>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{message}</p>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{ticket.code}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Hủy
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
              Xác nhận Check-in
            </Button>
          </div>
        </div>
      )}

      {/* Confirming */}
      {state === 'confirming' && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-green-500 mb-3" />
          <p className="font-medium">Đang xác nhận check-in...</p>
        </div>
      )}

      {/* Done */}
      {state === 'done' && (
        <div className="bg-card border-2 border-green-500/50 rounded-xl p-6 text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">Check-in thành công!</p>
            {ticket && <p className="text-sm text-muted-foreground mt-1 font-mono">{ticket.code}</p>}
          </div>
          <Button onClick={handleReset} className="w-full" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Check-in vé tiếp theo
          </Button>
        </div>
      )}

      {/* Invalid */}
      {state === 'invalid' && (
        <div className="bg-card border-2 border-red-500/50 rounded-xl p-6 text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">Vé không hợp lệ</p>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
          <Button onClick={handleReset} className="w-full" variant="outline" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="bg-card border-2 border-yellow-500/50 rounded-xl p-6 text-center space-y-4">
          <AlertTriangle className="w-14 h-14 mx-auto text-yellow-500" />
          <div>
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">Lỗi check-in</p>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
          <Button onClick={handleReset} className="w-full" variant="outline" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      )}
    </div>
  )
}
