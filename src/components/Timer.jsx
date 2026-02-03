import { useState, useEffect, useCallback, useRef } from "react";

const WORK_TIME = 20 * 60;
const BREAK_TIME = 20;
const CIRCUMFERENCE = 2 * Math.PI * 90;

export default function Timer() {
  const [timeRemaining, setTimeRemaining] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef(null);

  const totalTime = isBreak ? BREAK_TIME : WORK_TIME;
  const progress = timeRemaining / totalTime;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const playSound = useCallback(() => {
    try {
      const audioContext = new AudioContext();

      const playBeep = (freq, delay) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = freq;
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5,
          );
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        }, delay);
      };

      playBeep(800, 0);
      playBeep(1000, 200);
    } catch {
      console.log("Audio not supported");
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (isBreak) {
            setIsBreak(false);
            playSound();
            return WORK_TIME;
          } else {
            setIsBreak(true);
            playSound();
            return BREAK_TIME;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isBreak, playSound]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeRemaining(WORK_TIME);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      } else if (e.code === "KeyR") {
        handleReset();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleReset]);

  const getStatusText = () => {
    if (!isRunning) return "Ready to start";
    return isBreak ? "Look away!" : "Working...";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full blur-[80px] opacity-40 animate-float"
          style={{
            background: isBreak ? "#f472b6" : "#6366f1",
            top: "-10%",
            right: "-10%",
          }}
        />
        <div
          className="absolute w-[150px] h-[150px] md:w-[200px] md:h-[200px] rounded-full blur-[80px] opacity-30 animate-float-delayed"
          style={{
            background: "#a855f7",
            bottom: "-5%",
            right: "20%",
          }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 md:p-6 relative z-10 gap-6 md:gap-8 overflow-y-auto">
        <header className="text-center pt-4 md:pt-0">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl md:text-2xl animate-blink">👁️</span>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              20-20-20
            </h1>
          </div>
          <p className="text-white/70 text-sm md:text-base font-light">
            Protect your eyes from digital strain
          </p>
        </header>

        <div className="glass rounded-3xl p-6 md:p-8 flex flex-col items-center gap-4 md:gap-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] w-full max-w-[340px] md:max-w-none md:w-auto h-[70%]">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm text-white/70">
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                isRunning
                  ? isBreak
                    ? "bg-pink-400 animate-pulse-fast"
                    : "bg-green-500 animate-pulse-glow"
                  : "bg-white/40"
              }`}
            />
            <span>{getStatusText()}</span>
          </div>

          <div className="relative w-[220px] h-[220px] md:w-[300px] md:h-full p-[10px]">
            <svg
              className="w-full h-full -rotate-90 overflow-visible"
              viewBox="0 0 200 200"
            >
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={isBreak ? "#f472b6" : "#6366f1"}
                  />
                  <stop
                    offset="50%"
                    stopColor={isBreak ? "#ec4899" : "#8b5cf6"}
                  />
                  <stop
                    offset="100%"
                    stopColor={isBreak ? "#db2777" : "#a855f7"}
                  />
                </linearGradient>
              </defs>
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
                style={{
                  filter: `drop-shadow(0 0 10px ${isBreak ? "#f472b6" : "#6366f1"})`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-4xl md:text-6xl font-semibold tabular-nums ${isBreak ? "gradient-text-break" : "gradient-text"}`}
              >
                {String(minutes).padStart(2, "0")}
              </span>
              <span className="text-2xl md:text-4xl font-light text-white/40 mx-1 animate-blink-separator">
                :
              </span>
              <span
                className={`text-4xl md:text-6xl font-semibold tabular-nums ${isBreak ? "gradient-text-break" : "gradient-text"}`}
              >
                {String(seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 text-base md:text-lg font-medium ${isBreak ? "text-pink-400" : "text-white/70"}`}
          >
            <span className={isBreak ? "animate-look-away" : ""}>
              {isBreak ? "👀" : "💻"}
            </span>
            <span>{isBreak ? "Look 20 feet away" : "Work Time"}</span>
          </div>

          <div className="flex gap-3 md:gap-4 w-full md:w-auto">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-3 rounded-full font-medium text-white cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                isBreak
                  ? "btn-gradient-break shadow-[0_4px_20px_rgba(244,114,182,0.4)] hover:shadow-[0_6px_30px_rgba(244,114,182,0.5)]"
                  : "btn-gradient shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_30px_rgba(99,102,241,0.5)]"
              }`}
            >
              <span className="text-sm">{isRunning ? "⏸" : "▶"}</span>
              <span>{isRunning ? "Pause" : "Start"}</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-full font-medium text-white/70 bg-white/10 border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/15 hover:text-white"
            >
              <span className="text-sm">↺</span>
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>

        <section className="text-center w-full">
          <h2 className="text-base md:text-lg font-medium text-white/70 mb-4">
            How it works
          </h2>
          <div className="flex gap-3 md:gap-4 flex-wrap justify-center">
            {[
              { num: "20", unit: "MINUTES", desc: "Work on your screen" },
              { num: "20", unit: "SECONDS", desc: "Take a break" },
              { num: "20", unit: "FEET", desc: "Look into the distance" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/3 border border-white/5 rounded-2xl p-3 md:p-4 min-w-[100px] md:min-w-[120px] transition-all duration-300 hover:bg-white/6 hover:-translate-y-1"
              >
                <div className="text-xl md:text-2xl font-bold gradient-text">
                  {item.num}
                </div>
                <div className="text-xs text-cyan-400 font-medium uppercase tracking-wider">
                  {item.unit}
                </div>
                <p className="mt-1 md:mt-2 text-xs md:text-sm text-white/40">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-2xl mx-auto glass rounded-2xl p-4 md:p-6 text-center">
          <h2 className="text-lg md:text-xl font-semibold gradient-text mb-3 md:mb-4">
            What is the 20-20-20 Rule?
          </h2>
          <p className="text-white/70 leading-relaxed mb-3 md:mb-4 text-sm md:text-base">
            The <strong className="text-white">20-20-20 rule</strong> is a
            simple guideline recommended to help reduce digital eye strain.
          </p>
          <div className="bg-white/5 rounded-xl p-3 md:p-4 mb-3 md:mb-4">
            <p className="text-base md:text-lg text-white/90 font-medium">
              Every <span className="text-white font-bold">20 minutes</span>,
              look at something{" "}
              <span className="text-white font-bold">20 feet</span> (~6 meters)
              away, for at least{" "}
              <span className="text-white font-bold">20 seconds</span>.
            </p>
          </div>
          <div className="text-left space-y-2 md:space-y-3 text-white/60 text-xs md:text-sm">
            <p>
              <strong className="text-white/80">Why does it work?</strong> When
              you stare at a screen, your eyes focus at a fixed distance and
              blink less frequently, leading to dryness and fatigue. Looking at
              a distant object relaxes the focusing muscles and encourages
              blinking.
            </p>
          </div>
        </section>
      </main>

      <footer className="flex justify-center p-3 md:p-4 text-white/40 text-xs md:text-sm ">
        <p>Take care of your eyes 💜</p>
      </footer>
    </div>
  );
}
