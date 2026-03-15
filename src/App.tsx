import { useState, useEffect, useCallback, useRef } from 'react'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

interface ModeConfig {
  label: string
  duration: number
  color: string
  bgGradient: string
}

const MODES: Record<TimerMode, ModeConfig> = {
  focus: {
    label: 'FOCUS',
    duration: 25 * 60,
    color: '#D64545',
    bgGradient: 'from-stone-950 via-stone-900 to-red-950/30',
  },
  shortBreak: {
    label: 'SHORT BREAK',
    duration: 5 * 60,
    color: '#45D67D',
    bgGradient: 'from-stone-950 via-stone-900 to-emerald-950/30',
  },
  longBreak: {
    label: 'LONG BREAK',
    duration: 15 * 60,
    color: '#4577D6',
    bgGradient: 'from-stone-950 via-stone-900 to-blue-950/30',
  },
}

function App() {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentMode = MODES[mode]
  const progress = 1 - timeLeft / currentMode.duration
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }, [])

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(MODES[newMode].duration)
    setIsRunning(false)
  }, [])

  const handleComplete = useCallback(() => {
    playSound()
    if (mode === 'focus') {
      const newCount = completedPomodoros + 1
      setCompletedPomodoros(newCount)
      if (newCount % 4 === 0) {
        switchMode('longBreak')
      } else {
        switchMode('shortBreak')
      }
    } else {
      switchMode('focus')
    }
  }, [mode, completedPomodoros, playSound, switchMode])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, handleComplete])

  const toggleTimer = () => setIsRunning(!isRunning)

  const resetTimer = () => {
    setTimeLeft(currentMode.duration)
    setIsRunning(false)
  }

  const circumference = 2 * Math.PI * 140
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className={`min-h-screen min-h-[100dvh] bg-gradient-to-br ${currentMode.bgGradient} flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-1000 relative overflow-hidden`}>
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white" />
        <div className="absolute right-1/4 top-0 bottom-0 w-px bg-white" />
        <div className="absolute top-1/4 left-0 right-0 h-px bg-white" />
        <div className="absolute bottom-1/4 left-0 right-0 h-px bg-white" />
      </div>

      {/* Audio element for completion sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQYAKIvR47qHIRFFltO2jC0pPo3LuZ1QJCQ6grqwpWM4LTyEt6qYWTAsP4S2qZRVMSxAhbiqllYxKz+FuKqXVzEsPoa5qpdXMSs+hrmql1gxKz2GuqqYWDErPYa6qphYMSs8h7qrmFkyKzyHu6uZWjIsPYi8rJpcMyw+ib2tm10zLD+KvrCfYDQsQIzAsp9hNStBjcG0oWM2K0KOwLSiZDcrQ4/BtKJlNyxDj8K0omY3LEOQwrSjZjcsQ5DDtaNnNyxEkMO1pGg4LUSQ w7WlaTgtRJHEtaVpOC1FkcS2pmk5LUWQ xLanajktRpLEtqdqOS1Gk8W3qGs6LUeTxbeoazosSJTGt6lsOi1Ilca4qm07LUmWx7mrbTstSpbIuqtuPC1Ll8m7rG88LUyYyrysb z4tTJnKvK1wPi1Nmsu9rnE+LU6bzL6vcT8tTpzMv69yPy1PnM2/sHNALU+dzsDwc0AtUJ7OwPF0QS1Qn8/B8nRBLVGg0MLzdUIrUqHRw/R1Qi1SodHD9XZDLVOi0sT2dkMtU6PRxfZ3RC1Uo9LF93dELVSk08b4eEQtVaTTxvh5RS1VpdTH+XlFLVam1cf6ekYtVqbWyPp6Ri1Wp9bI+3tHLVen18n7fEctV6jYyvx8Ry1YqNjK/H1ILVip2cv9fUgtWana zP1+SC1Zqtr N/n5JLVqr28/+f0ktWqzcz/6ASi1brNzQ/4BKLVut3dD/gUotW67e0f+CSy1crt7R/4NLLVyu39L/g0wtXK/f0v+ETSpcr+DT/4RNKlyv4NT/hU4qXK/g1P+GTipcr+HV/4ZPKlyv4dX/h08qXK/h1v+HUCpcr+HW/4hQKlyv4db/iFEqXK/i1/+JUSpcr+LX/4lSKlyv4tj/ilIqXK/i2P+KUypcsOPY/4tTKlyv49n/i1QqXLDj2f+MVCpcsOTa/4xVKlyv5Nr/jVUpXLDk2/+NVSlcseTb/45WKV2x5dz/jlYpXbHl3P+PVyldsube/49YKV2y5t7/kFgpXbLm3/+QWSldsufg/5FZKl2z5+D/kVopXbPo4f+SWipds+jh/5JbKl2z6OL/k1sqXbPo4v+UXCpes+ni/5RcKl6z6eP/lFwqXrPp4/+VXSpes+rk/5VdKl+06uT/lV4qX7Tq5P+WXipftOvl/5ZfKl+06+X/l18qX7Ts5v+XYCpftOzm/5hgK1+07ef/mGErX7Xt5/+ZYStftO3o/5liK1+07ej/mmIrYLXu6f+aYytgte7p/5pjK2C17un/m2QrYLbv6v+bZCtgtu/q/5xlK2G28Or/nGUrYbbw6/+dZithtfHr/51nK2G28ez/nmcrYbby7P+eaCtht/Lt/55oK2G28u3/n2krYbfz7v+faSthtvPu/6BqK2K38+7/oGorYrfz7/+haytit/Tv/6FsK2K39O//om wrYrf18P+ibStiuPXw/6JuK2K49vH/o24rYrj18f+kbytjuPby/6RvK2O49vL/pHArY7j28/+lcCtjufbz/6VxK2O49/T/pnErY7n39P+mcitjuPf1/6dyK2O5+PX/p3MrY7n49v+ocytjufn2/6h0K2S5+fb/qXQrZLn59/+pdStluvr3/6p1K2W6+vj/qnYrZbr7+P+rditmuvv5/6t3K2a7+/n/rHcrZrr8+f+seCxmu/z6/614LGa7/fr/rXksZrz9+/+ueS1nvP37/656LWe8/fz/r3stZ7z+/P+vfC1nvf79/7B8LWe9/v3/sH0tZ739/v+xfS1nvv7+/7F+LWi+/v7/sn4taL/+//+yfy5ov///wIAvAA==" type="audio/wav" />
      </audio>

      {/* Header */}
      <header className="text-center mb-8 md:mb-12 relative z-10">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-2" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.3)' }}>
          POMODORO
        </h1>
        <p className="text-stone-500 font-mono text-xs md:text-sm tracking-[0.3em] uppercase">
          {completedPomodoros} sessions completed
        </p>
      </header>

      {/* Mode selector */}
      <nav className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 relative z-10">
        {(Object.keys(MODES) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-3 py-2 md:px-6 md:py-3 font-mono text-xs md:text-sm tracking-wider uppercase transition-all duration-300 border-2 ${
              mode === m
                ? 'border-white text-white bg-white/10 shadow-[4px_4px_0px_rgba(255,255,255,0.2)]'
                : 'border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300'
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </nav>

      {/* Timer circle */}
      <div className="relative mb-8 md:mb-12">
        {/* Outer glow */}
        <div
          className="absolute inset-0 blur-3xl opacity-30 transition-colors duration-1000"
          style={{ backgroundColor: currentMode.color }}
        />

        {/* SVG Timer */}
        <svg className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 transform -rotate-90" viewBox="0 0 300 300">
          {/* Background track */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-stone-800"
          />
          {/* Progress arc */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke={currentMode.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 20px ${currentMode.color}50)`,
            }}
          />
          {/* Inner decorative circle */}
          <circle
            cx="150"
            cy="150"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-700"
            strokeDasharray="8 8"
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight tabular-nums" style={{ fontFeatureSettings: '"tnum"' }}>
            {String(minutes).padStart(2, '0')}
            <span className="animate-pulse">:</span>
            {String(seconds).padStart(2, '0')}
          </span>
          <span
            className="font-mono text-xs md:text-sm tracking-[0.4em] uppercase mt-2 transition-colors duration-500"
            style={{ color: currentMode.color }}
          >
            {currentMode.label}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 md:gap-6 relative z-10">
        <button
          onClick={toggleTimer}
          className="group relative px-8 py-4 md:px-12 md:py-5 font-mono text-sm md:text-base tracking-widest uppercase text-white border-2 border-white transition-all duration-300 hover:bg-white hover:text-stone-900 active:translate-x-1 active:translate-y-1 active:shadow-none"
          style={{
            boxShadow: '6px 6px 0px rgba(255,255,255,0.2)',
          }}
        >
          <span className="relative z-10">{isRunning ? 'PAUSE' : 'START'}</span>
        </button>
        <button
          onClick={resetTimer}
          className="px-6 py-4 md:px-8 md:py-5 font-mono text-sm md:text-base tracking-widest uppercase text-stone-500 border-2 border-stone-700 transition-all duration-300 hover:border-stone-500 hover:text-stone-300 active:translate-x-1 active:translate-y-1"
        >
          RESET
        </button>
      </div>

      {/* Session indicators */}
      <div className="flex gap-2 md:gap-3 mt-8 md:mt-12 relative z-10">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 transition-all duration-500 ${
              i < (completedPomodoros % 4)
                ? 'border-transparent'
                : 'border-stone-600 bg-transparent'
            }`}
            style={{
              backgroundColor: i < (completedPomodoros % 4) ? currentMode.color : 'transparent',
              boxShadow: i < (completedPomodoros % 4) ? `0 0 12px ${currentMode.color}80` : 'none',
            }}
          />
        ))}
      </div>

      {/* Instructions */}
      <p className="text-stone-600 font-mono text-[10px] md:text-xs tracking-wider mt-6 md:mt-8 text-center max-w-xs md:max-w-md relative z-10">
        Complete 4 focus sessions to unlock a long break
      </p>

      {/* Footer */}
      <footer className="absolute bottom-4 md:bottom-6 left-0 right-0 text-center">
        <p className="text-stone-600 font-mono text-[10px] md:text-xs tracking-wider">
          Requested by <span className="text-stone-500">@rng_rn</span> · Built by <span className="text-stone-500">@clonkbot</span>
        </p>
      </footer>
    </div>
  )
}

export default App
