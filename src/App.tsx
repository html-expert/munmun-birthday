import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Gift, Cake, Star, ArrowRight, Volume2, VolumeX } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

const quizQuestions: QuizQuestion[] = [
  {
    question: "What is my favorite way to surprise you?",
    options: ["Flowers", "Love letters", "Romantic dinners", "All of the above"],
    correct: 3,
  },
  {
    question: "Our first date was at...",
    options: ["The park", "A cozy cafe", "The beach", "The movies"],
    correct: 1,
  },
  {
    question: "What song reminds me of you the most?",
    options: ["Perfect - Ed Sheeran", "All of Me - John Legend", "Lover - Taylor Swift", "Can't Help Falling in Love"],
    correct: 1,
  },
  {
    question: "How do I feel when I'm with you?",
    options: ["Happy", "Complete", "The luckiest", "All of them"],
    correct: 3,
  },
];

const memoryCards = [
  '❤️', '🌹', '💕', '🎂', '💋', '🦋', '⭐', '🍫',
  '❤️', '🌹', '💕', '🎂', '💋', '🦋', '⭐', '🍫',
];

export function App() {
  const [stage, setStage] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [memoryBoard, setMemoryBoard] = useState<string[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [cakeCandles, setCakeCandles] = useState([true, true, true, true, true]);
  const [name] = useState("Munmun");

  // Initialize memory game
  const initMemoryGame = useCallback(() => {
    const shuffled = [...memoryCards].sort(() => Math.random() - 0.5);
    setMemoryBoard(shuffled);
    setFlippedCards([]);
    setMatchedIndices([]);
  }, []);

  // Confetti function
  const launchConfetti = (intensity: number = 1) => {
    const count = 200 * intensity;
    confetti({
      particleCount: count,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff69b4', '#ff1493', '#ffd700', '#ff69b4', '#c71585'],
    });
  };

  // Floating hearts component
  const FloatingHearts = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl"
          initial={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100 + 20}%`,
            opacity: 0.2 + Math.random() * 0.6 
          }}
          animate={{
            y: [0, -800],
            x: [0, Math.random() * 60 - 30],
            rotate: [0, Math.random() * 40 - 20],
            opacity: [0.3, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 7,
            repeat: Infinity,
            delay: Math.random() * -15,
          }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );

  // Play romantic music (using a free sound url or simulate)
  useEffect(() => {
    const audioElement = new (window.Audio as any)('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    audioElement.loop = true;
    audioElement.volume = 0.3;
    setAudio(audioElement);

    return () => {
      if (audioElement) audioElement.pause();
    };
  }, []);

  const toggleMusic = () => {
    if (!audio) return;
    
    if (isPlayingMusic) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlayingMusic(!isPlayingMusic);
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedAnswer(index);
    
    setTimeout(() => {
      if (index === quizQuestions[currentQuestion].correct) {
        setQuizScore(prev => prev + 1);
      }
      
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        if (quizScore + (index === quizQuestions[currentQuestion].correct ? 1 : 0) > 2) {
          launchConfetti(1.5);
        }
      }
    }, 800);
  };

  const nextStage = () => {
    if (stage === 1) {
      launchConfetti();
    }
    if (stage === 2 && showResult) {
      setShowResult(false);
      setCurrentQuestion(0);
      setQuizScore(0);
      setSelectedAnswer(null);
    }
    if (stage === 3) {
      initMemoryGame();
    }
    setStage(prev => Math.min(prev + 1, 5));
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  // Memory game logic
  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedIndices.includes(index)) {
      return;
    }

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (memoryBoard[first] === memoryBoard[second]) {
        setMatchedIndices(prev => {
          const newMatched = [...prev, first, second];
          if (newMatched.length === 16) {
            setTimeout(() => {
              launchConfetti(2);
            }, 600);
          }
          return newMatched;
        });
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1200);
      }
    }
  };

  const blowCandles = (index: number) => {
    if (!cakeCandles[index]) return; // Prevent clicking blown out candles
    
    const newCandles = [...cakeCandles];
    newCandles[index] = false;
    setCakeCandles(newCandles);
    
    launchConfetti(0.6);
    
    // Play a little "blow" sound effect with confetti
    if (newCandles.every(c => !c)) {
      setTimeout(() => {
        launchConfetti(2.5);
      }, 600);
    }
  };

  // Auto confetti on certain stages
  useEffect(() => {
    if (stage === 0) {
      const timer = setTimeout(() => launchConfetti(0.4), 800);
      return () => clearTimeout(timer);
    }
    if (stage === 5) {
      const interval = setInterval(() => {
        launchConfetti(0.7);
      }, 1400);
      return () => clearInterval(interval);
    }
  }, [stage]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,rgba(236,72,153,0.15),transparent)]" />
      <FloatingHearts />
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-black/70 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500">
            <Heart className="h-5 w-5" />
          </div>
          <span className="font-serif text-2xl tracking-tight">For Munmun</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMusic}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            {isPlayingMusic ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <div className="px-5 py-1.5 text-xs font-mono tracking-[2px] border border-white/30 rounded-full">
            {stage === 0 && "WELCOME"}
            {stage === 1 && "THE MESSAGE"}
            {stage === 2 && "THE QUIZ"}
            {stage === 3 && "MEMORY LANE"}
            {stage === 4 && "THE CAKE"}
            {stage === 5 && "FOREVER YOURS"}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STAGE 0: HERO LANDING */}
        {stage === 0 && (
          <motion.div
            key="stage0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 relative"
          >
            <div className="text-center max-w-2xl z-10">
              <motion.div
                initial={{ scale: 0.6, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.4, duration: 1.2 }}
                className="mb-8 inline-flex flex-col items-center"
              >
                <div className="flex gap-3 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      <Star className="text-yellow-400 h-8 w-8" />
                    </motion.div>
                  ))}
                </div>
                <h1 className="text-[92px] font-serif leading-none tracking-[-6px] bg-gradient-to-b from-white via-pink-200 to-pink-400 bg-clip-text text-transparent">
                  HAPPY<br />BIRTHDAY
                </h1>
                <div className="mt-1 flex items-center gap-4 justify-center">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
                  <p className="text-5xl font-light text-pink-300 tracking-[6px]">{name.toUpperCase()}</p>
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
                </div>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-pink-200/90 max-w-md mx-auto mb-16"
              >
                Today the world celebrates the day my favorite person was born
              </motion.p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStage}
                className="group relative flex items-center gap-3 rounded-2xl bg-white px-14 py-6 text-xl font-medium text-black shadow-2xl shadow-pink-500/40 transition-all hover:shadow-pink-500/60"
              >
                Open Your Surprise
                <ArrowRight className="group-hover:translate-x-1 transition" />
              </motion.button>

              <p className="mt-12 text-xs text-white/40 tracking-widest">SCROLL OR TAP TO BEGIN • MADE WITH LOVE</p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute bottom-12 left-1/2 flex gap-8 text-6xl opacity-30">
              <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }}>🎈</motion.div>
              <motion.div animate={{ y: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 0.6 }}>💖</motion.div>
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: 1.2 }}>🎁</motion.div>
            </div>
          </motion.div>
        )}

        {/* STAGE 1: LOVE LETTER */}
        {stage === 1 && (
          <motion.div
            key="stage1"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full">
              <div className="bg-[#111] border border-pink-500/30 rounded-3xl p-14 relative">
                <div className="absolute -top-5 left-8 bg-black text-pink-400 text-sm tracking-widest px-6 py-1 border border-pink-500/50 rounded">A LETTER FOR YOU</div>
                
                <div className="space-y-8 text-lg leading-relaxed text-pink-100">
                  <p className="text-3xl font-light italic">My dearest Munmun,</p>
                  
                  <p>Every single day with you feels like a dream I never want to wake up from. Today, on your special day, I want to remind you just how incredibly special you are to me.</p>
                  
                  <p>Your smile lights up my world brighter than all the stars in the sky. Your laugh is my favorite sound. The way you look at me makes my heart do things I didn't know were possible.</p>
                  
                  <p>Thank you for being my best friend, my biggest supporter, and the love of my life. I promise to spend every birthday from now on making sure you feel as loved as you make me feel.</p>
                  
                  <div className="pt-6 border-t border-white/10">
                    <p className="font-serif text-4xl text-right text-pink-300">Forever yours,</p>
                    <p className="text-right text-xl mt-1">— The guy who can't stop falling in love with you</p>
                  </div>
                </div>
              </div>
      
      <div className="flex justify-center mt-12 relative z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => nextStage()}
          className="relative z-50 pointer-events-auto px-16 py-6 rounded-2xl border border-white/30 hover:bg-white/5 flex items-center gap-3 text-lg transition-all cursor-pointer"
        >
          CONTINUE TO THE QUIZ <ArrowRight />
        </motion.button>
      </div>

    </div>
  </motion.div>
)}

        {/* STAGE 2: QUIZ */}
        {stage === 2 && (
          <motion.div 
            key="stage2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="max-w-xl w-full">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-white/5 text-pink-400 text-sm uppercase tracking-[3px] px-6 py-3 rounded-3xl mb-6">
                  <Star className="h-4 w-4" /> HOW WELL DO YOU THINK I KNOW YOU?
                </div>
                <h2 className="text-6xl font-light">The Love Quiz</h2>
                <p className="text-pink-300 mt-3">Answer these questions about us</p>
              </div>

              {!showResult ? (
                <div className="bg-zinc-950 border border-white/10 rounded-3xl p-10">
                  <div className="flex justify-between text-sm mb-8 text-white/60">
                    <div>QUESTION {currentQuestion + 1} OF {quizQuestions.length}</div>
                    <div className="text-emerald-400">{quizScore} correct</div>
                  </div>
                  
                  <motion.p 
                    key={currentQuestion}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl leading-tight mb-12 font-light"
                  >
                    {quizQuestions[currentQuestion].question}
                  </motion.p>
                  
                  <div className="grid gap-4">
                    {quizQuestions[currentQuestion].options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02, x: 6 }}
                        onClick={() => handleQuizAnswer(idx)}
                        className={`group p-6 text-left rounded-2xl border transition-all text-lg flex items-center justify-between
                          ${selectedAnswer === idx 
                            ? (idx === quizQuestions[currentQuestion].correct ? 'border-emerald-400 bg-emerald-900/30' : 'border-red-400 bg-red-900/30') 
                            : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                      >
                        <span>{option}</span>
                        <div className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/50 group-hover:bg-pink-500/20 transition">
                          SELECT
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-zinc-950 border border-white/10 rounded-3xl p-16 text-center"
                >
                  <div className="text-7xl mb-6">🎉</div>
                  <h3 className="text-5xl font-light mb-3">You got {quizScore} out of {quizQuestions.length}</h3>
                  <p className="text-xl text-pink-400 mb-10">Amazing! You really know me {quizScore > 2 ? 'so well ❤️' : 'pretty well'}</p>
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={resetQuiz}
                      className="px-10 py-4 border border-white/30 hover:bg-white/5 rounded-2xl"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={nextStage}
                      className="px-10 py-4 bg-white text-black rounded-2xl hover:bg-pink-200 flex items-center gap-2"
                    >
                      NEXT SURPRISE <Gift className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* STAGE 3: MEMORY GAME */}
        {stage === 3 && (
          <motion.div 
            key="stage3" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen py-24 px-6"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mb-6">
                  <Heart className="h-9 w-9" />
                </div>
                <h2 className="text-6xl font-light tracking-tighter mb-3">Memory Lane</h2>
                <p className="text-pink-300 max-w-xs mx-auto">Match the symbols that represent our beautiful memories together</p>
              </div>

               <div className="grid grid-cols-4 gap-4 max-w-[560px] mx-auto">
                 {memoryBoard.map((symbol, index) => (
                   <motion.div
                     key={index}
                     onClick={() => handleCardClick(index)}
                     whileHover={{ scale: 1.04 }}
                     whileTap={{ scale: 0.92 }}
                     className={`aspect-square rounded-3xl flex items-center justify-center text-6xl cursor-pointer border-2 transition-all duration-300 shadow-inner select-none
                       ${(flippedCards.includes(index) || matchedIndices.includes(index))
                         ? 'bg-zinc-900 border-pink-400 shadow-pink-500/30' 
                         : 'bg-zinc-950 border-white/10 hover:border-pink-400/40 active:scale-95'}`}
                   >
                     {(flippedCards.includes(index) || matchedIndices.includes(index)) ? (
                       <span className="drop-shadow-md transition-all">{symbol}</span>
                     ) : (
                       <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                     )}
                   </motion.div>
                 ))}
               </div>

               <div className="text-center mt-16">
                 <div className="inline-flex items-center gap-2 text-sm text-white/50">
                   MATCHES FOUND: <span className="text-pink-400 font-mono text-xl">{matchedIndices.length / 2}</span>/8
                 </div>
                 
                 {matchedIndices.length === 16 && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="mt-6 text-emerald-400 font-medium flex items-center justify-center gap-2"
                   >
                     ✨ You completed the game! Amazing memory ❤️ ✨
                   </motion.div>
                 )}
               </div>

              <div className="flex justify-center mt-16">
                <button 
                  onClick={nextStage}
                  className="px-12 py-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl text-lg flex items-center gap-3 hover:brightness-110 transition"
                >
                  BLOW OUT THE CANDLES <Cake className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 4: CAKE */}
        {stage === 4 && (
          <motion.div
            key="stage4"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex items-center justify-center p-6 relative"
          >
            <div className="text-center">
              <motion.div 
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="mx-auto mb-8 relative"
              >
                <div className="relative w-80 h-80 mx-auto">
                  {/* Cake */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-64 bg-gradient-to-b from-pink-300 via-rose-400 to-pink-600 rounded-[4rem] shadow-2xl"></div>
                  
                  {/* Cake layers */}
                  <div className="absolute bottom-[92px] left-1/2 -translate-x-1/2 w-[260px] h-5 bg-gradient-to-r from-pink-700 to-rose-700 rounded"></div>
                  <div className="absolute bottom-[132px] left-1/2 -translate-x-1/2 w-[260px] h-5 bg-gradient-to-r from-pink-700 to-rose-700 rounded"></div>
                  
                  {/* Frosting details */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[278px] h-[72px] bg-white/30 rounded-t-[6rem]"></div>
                  
                  {/* Candles with better click areas */}
                  {cakeCandles.map((isLit, i) => (
                    <motion.div 
                      key={i}
                      onClick={() => blowCandles(i)}
                      whileHover={{ scale: 1.15, y: -8 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute cursor-pointer group"
                      style={{
                        left: `${22 + i * 14.5}%`,
                        top: '68px'
                      }}
                    >
                      {/* Larger invisible click target */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-24 -z-10" />
                      
                      {/* Candle */}
                      <div className={`relative w-5 h-16 bg-gradient-to-t from-amber-800 via-amber-700 to-amber-100 rounded-sm shadow-md transition-all duration-200 ${isLit ? 'animate-flicker' : 'grayscale'}`}>
                        {/* Wick */}
                        <div className={`absolute -top-1 left-1/2 w-0.5 h-3 bg-amber-900 -translate-x-1/2 ${isLit ? '' : 'hidden'}`}></div>
                        
                        {/* Flame */}
                        {isLit && (
                          <motion.div 
                            animate={{ 
                              scale: [1, 1.15, 1],
                              opacity: [1, 0.85, 1]
                            }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                            className="absolute -top-7 left-1/2 -translate-x-1/2 text-3xl drop-shadow-[0_0_12px_#ffeb3b]"
                          >
                            🔥
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <h3 className="text-5xl font-light mb-6">Make a wish, my love...</h3>
              <p className="text-pink-400 max-w-xs mx-auto">Click each candle to blow them out. Make your wish as you do.</p>
              
              {cakeCandles.every(c => !c) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-12"
                >
                  <div className="text-4xl mb-4">✨</div>
                  <p className="text-2xl text-emerald-400">WISH GRANTED! I LOVE YOU MORE THAN WORDS CAN SAY</p>
                </motion.div>
              )}

              <button 
                onClick={nextStage}
                className="mt-20 px-14 py-6 border-2 border-white/60 rounded-3xl text-lg hover:bg-white hover:text-black transition-all flex items-center gap-3 mx-auto"
              >
                SEE YOUR FINAL GIFT
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 5: FINAL SURPRISE */}
        {stage === 5 && (
          <motion.div 
            key="stage5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
          >
            <div className="z-10 max-w-lg">
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                }}
                transition={{ duration: 2.8, repeat: Infinity }}
              >
                <div className="text-[180px] mb-6">💍</div>
              </motion.div>
              
              <h1 className="text-7xl font-serif mb-4 tracking-tighter">I love you</h1>
              <p className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 mb-8">to the moon and back</p>
              
              <div className="max-w-xs mx-auto text-lg text-white/80 leading-relaxed mb-16">
                Thank you for making every day better than the last. 
                Here's to many more birthdays together. 
                You are my everything.
              </div>
              
              <button 
                onClick={() => {
                  launchConfetti(3);
                  setTimeout(() => launchConfetti(2), 300);
                  setTimeout(() => launchConfetti(2.5), 700);
                }}
                className="px-8 py-4 rounded-full border border-pink-400 text-pink-300 text-sm tracking-widest hover:bg-pink-500 hover:text-white transition"
              >
                ONE MORE TIME
              </button>
            </div>
            
            <div className="absolute bottom-8 text-xs text-white/30">❤️ HAPPY BIRTHDAY MY LOVE ❤️</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="fixed bottom-8 right-8 flex gap-2 z-50">
        {[0,1,2,3,4,5].map(i => (
          <div 
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all ${stage === i ? 'bg-pink-400 scale-125' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}
