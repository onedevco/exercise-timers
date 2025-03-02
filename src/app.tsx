import { useState, useEffect } from 'preact/hooks';
import { nanoid } from 'nanoid';
import { playTickingSound, stopTickingSound } from './utils/audio';
import './app.css'

// Define types
interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  completed: boolean;
}

const App = () => {
  // State for timers and app configuration
  const [timers, setTimers] = useState<Timer[]>([]);
  const [gapDuration, setGapDuration] = useState<number>(5);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTimerIndex, setActiveTimerIndex] = useState<number | null>(null);
  const [isInGap, setIsInGap] = useState<boolean>(false);
  const [currentCountdown, setCurrentCountdown] = useState<number>(0);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Form state for adding new timers
  const [timerQuantity, setTimerQuantity] = useState<number>(1);
  const [timerDuration, setTimerDuration] = useState<number>(20);
  const [timerName, setTimerName] = useState<string>('Exercise');
  
  // Load timers and preferences from localStorage on initial render
  useEffect(() => {
    const savedTimers = localStorage.getItem('exerciseTimers');
    const savedGap = localStorage.getItem('exerciseGapDuration');
    const savedTheme = localStorage.getItem('exerciseDarkMode');
    
    console.log('Saved theme from localStorage:', savedTheme);
    
    if (savedTimers) {
      setTimers(JSON.parse(savedTimers));
    }
    
    if (savedGap) {
      setGapDuration(JSON.parse(savedGap));
    }
    
    if (savedTheme !== null) {
      const parsedTheme = JSON.parse(savedTheme);
      console.log('Parsed theme:', parsedTheme);
      setDarkMode(parsedTheme);
    } else {
      // Check if user prefers dark mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      console.log('System prefers dark:', prefersDark);
      setDarkMode(prefersDark);
    }
  }, []);
  
  // Apply dark mode class to document when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Save timers to localStorage when they change
  useEffect(() => {
    localStorage.setItem('exerciseTimers', JSON.stringify(timers));
  }, [timers]);
  
  // Save gap duration to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('exerciseGapDuration', JSON.stringify(gapDuration));
  }, [gapDuration]);
  
  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('exerciseDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  // Toggle dark mode
  const handleToggleDarkMode = () => {
    console.log('Toggling dark mode from', darkMode, 'to', !darkMode);
    setDarkMode(!darkMode);
  };
  
  // Add timers to the list
  const handleAddTimers = () => {
    const newTimers = Array.from({ length: timerQuantity }, (_, index) => ({
      id: nanoid(),
      name: `Exercise ${timers.length + index + 1}`,
      duration: timerDuration,
      completed: false
    }));
    
    setTimers([...timers, ...newTimers]);
  };
  
  // Start the timer sequence
  const handleStartTimers = () => {
    if (timers.length === 0) return;
    
    setIsRunning(true);
    if (activeTimerIndex === null) {
      setActiveTimerIndex(0);
      startGapTimer();
    }
  };
  
  // Pause the timer sequence
  const handlePauseTimers = () => {
    setIsRunning(false);
    stopTickingSound();
  };
  
  // Reset all timers
  const handleResetTimers = () => {
    setIsRunning(false);
    setActiveTimerIndex(null);
    setIsInGap(false);
    setCurrentCountdown(0);
    setTimers(timers.map(timer => ({ ...timer, completed: false })));
    stopTickingSound();
  };
  
  // Start the gap timer before the active timer
  const startGapTimer = () => {
    setIsInGap(true);
    setCurrentCountdown(gapDuration);
  };
  
  // Start the active timer
  const startActiveTimer = () => {
    if (activeTimerIndex === null || activeTimerIndex >= timers.length) return;
    
    setIsInGap(false);
    setCurrentCountdown(timers[activeTimerIndex].duration);
  };
  
  // Move to the next timer
  const moveToNextTimer = () => {
    if (activeTimerIndex === null) return;
    
    // Mark current timer as completed
    const updatedTimers = [...timers];
    updatedTimers[activeTimerIndex].completed = true;
    setTimers(updatedTimers);
    
    // Move to next timer or finish
    if (activeTimerIndex < timers.length - 1) {
      setActiveTimerIndex(activeTimerIndex + 1);
      startGapTimer();
    } else {
      // All timers completed
      setIsRunning(false);
      setActiveTimerIndex(null);
    }
  };
  
  // Timer countdown effect
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      if (currentCountdown <= 0) {
        clearInterval(interval);
        stopTickingSound();
        if (isInGap) {
          startActiveTimer();
        } else {
          moveToNextTimer();
        }
        return;
      }
      
      setCurrentCountdown(prev => prev - 1);
      
      // Play ticking sound in last 5 seconds
      if (currentCountdown <= 5) {
        playTickingSound();
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
      stopTickingSound();
    };
  }, [isRunning, currentCountdown, isInGap, activeTimerIndex]);
  
  // Handle timer name change
  const handleTimerNameChange = (id: string, newName: string) => {
    setTimers(timers.map(timer => 
      timer.id === id ? { ...timer, name: newName } : timer
    ));
  };
  
  // Handle timer duration change
  const handleTimerDurationChange = (id: string, newDuration: number) => {
    setTimers(timers.map(timer => 
      timer.id === id ? { ...timer, duration: newDuration } : timer
    ));
  };
  
  // Handle timer deletion
  const handleDeleteTimer = (id: string) => {
    setTimers(timers.filter(timer => timer.id !== id));
  };
  
  return (
    <div class={`min-h-screen p-2 sm:p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-200`}>
      {/* <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <button 
          onClick={handleToggleDarkMode}
          class={`p-2 rounded-full self-end sm:self-auto ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          tabindex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleToggleDarkMode()}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div> */}
      
      {/* Timer Form */}
      <div class={`rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Add Timer</h2> */}
        <div class="flex gap-2 mb-3 sm:mb-4">
          {[10, 20, 30, 45, 60].map((seconds) => (
            <button
              key={seconds}
              onClick={() => {
                setTimerDuration(seconds);
                // Optionally auto-add the timer when a duration is selected
                // setTimerQuantity(1);
                // handleAddTimers();
              }}
              class={`px-3 py-2 rounded-md font-medium transition-colors ${
                timerDuration === seconds 
                  ? (darkMode ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white') 
                  : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
              }`}
              aria-label={`Set timer duration to ${seconds} seconds`}
              aria-pressed={timerDuration === seconds}
              tabindex={0}
              onKeyDown={(e) => e.key === 'Enter' && setTimerDuration(seconds)}
            >
              {seconds} sec
            </button>
          ))}
        </div>
        <button 
          onClick={() => {
            // Always add just one timer
            setTimerQuantity(1);
            handleAddTimers();
          }}
          class={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-800 text-yellow-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} font-medium py-2 px-4 rounded-md`}
          aria-label="Add timer to the list"
          tabindex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTimers()}
        >
          Add Timer
        </button>
      </div>
      
      {/* Gap Duration Setting */}
      <div class={`rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Gap Between Timers</h2>
        <div class="flex flex-wrap gap-2">
          {[5, 10, 20, 30, 60].map((seconds) => (
            <button
              key={seconds}
              onClick={() => setGapDuration(seconds)}
              class={`px-3 py-2 rounded-md font-medium transition-colors ${
                gapDuration === seconds 
                  ? (darkMode ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white') 
                  : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
              }`}
              aria-label={`Set gap to ${seconds} seconds`}
              aria-pressed={gapDuration === seconds}
              tabindex={0}
              onKeyDown={(e) => e.key === 'Enter' && setGapDuration(seconds)}
            >
              {seconds} sec
            </button>
          ))}
        </div>
      </div>
      
      {/* Timer Controls */}
      <div class={`rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div class="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button 
            onClick={handleStartTimers}
            disabled={timers.length === 0 || isRunning}
            class={`flex-1 sm:flex-none ${darkMode ? 'bg-gray-700 hover:bg-gray-800 text-yellow-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} font-medium py-2 px-4 sm:px-6 rounded-md disabled:opacity-50`}
            aria-label="Start timers"
            tabindex={0}
            onKeyDown={(e) => e.key === 'Enter' && !isRunning && timers.length > 0 && handleStartTimers()}
          >
            Start
          </button>
          <button 
            onClick={handlePauseTimers}
            disabled={!isRunning}
            class={`flex-1 sm:flex-none ${darkMode ? 'bg-gray-700 hover:bg-gray-800 text-yellow-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} font-medium py-2 px-4 sm:px-6 rounded-md disabled:opacity-50`}
            aria-label="Pause timers"
            tabindex={0}
            onKeyDown={(e) => e.key === 'Enter' && isRunning && handlePauseTimers()}
          >
            Pause
          </button>
          <button 
            onClick={handleResetTimers}
            class={`flex-1 sm:flex-none ${darkMode ? 'bg-gray-700 hover:bg-gray-800 text-yellow-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} font-medium py-2 px-4 sm:px-6 rounded-md`}
            aria-label="Reset all timers"
            tabindex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleResetTimers()}
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Active Timer Display */}
      {isRunning && activeTimerIndex !== null && (
        <div class={`rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 class="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
            {isInGap ? 'Get Ready For:' : 'Current Exercise:'}
          </h2>
          <h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            {timers[activeTimerIndex].name}
          </h3>
          <div class="flex justify-center">
            <div class="text-5xl sm:text-6xl font-bold digital-font">
              {currentCountdown}
            </div>
          </div>
          <div class="mt-3 sm:mt-4 text-center text-gray-400">
            {isInGap ? 'Starting in...' : 'Seconds remaining'}
          </div>
        </div>
      )}
      
      {/* Timer List */}
      <div class={`rounded-lg shadow p-3 sm:p-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Your Timers</h2>
        {timers.length === 0 ? (
          <p class={`text-center py-3 sm:py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No timers added yet. Add some timers to get started!</p>
        ) : (
          <div class="space-y-2 sm:space-y-3">
            {timers.map((timer, index) => (
              <div 
                key={timer.id} 
                class={`border rounded-md p-2 sm:p-3 flex items-center justify-between ${
                  timer.completed ? (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300') : (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')
                } ${
                  activeTimerIndex === index && isRunning ? (darkMode ? 'border-yellow-500 border-2' : 'border-blue-500 border-2') : ''
                }`}
              >
                <div class="flex-1 flex items-center">
                  <span class={`font-medium ${timer.completed ? 'opacity-70' : ''}`}>
                    {timer.name}
                  </span>
                  <span class={`ml-2 px-2 py-1 rounded-md text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${timer.completed ? 'opacity-70' : ''}`}>
                    {timer.duration} sec
                  </span>
                  {activeTimerIndex === index && isRunning && (
                    <span class={`ml-auto mr-2 digital-font text-xl ${isInGap ? 'text-yellow-400' : 'text-green-400'}`}>
                      {currentCountdown}
                    </span>
                  )}
                </div>
                <div class="flex ml-4">
                  <button 
                    onClick={() => handleDeleteTimer(timer.id)}
                    disabled={isRunning}
                    class={`text-red-500 hover:text-red-400 disabled:opacity-50 p-1 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    aria-label={`Delete timer ${index + 1}`}
                    tabindex={0}
                    onKeyDown={(e) => e.key === 'Enter' && !isRunning && handleDeleteTimer(timer.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <div class="flex ml-2">
                    <button 
                      onClick={() => {
                        if (index > 0) {
                          const newTimers = [...timers];
                          [newTimers[index], newTimers[index - 1]] = [newTimers[index - 1], newTimers[index]];
                          setTimers(newTimers);
                        }
                      }}
                      disabled={index === 0 || isRunning}
                      class={`p-1 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-700 hover:text-gray-800'} disabled:opacity-50`}
                      aria-label={`Move timer ${index + 1} up`}
                      tabindex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isRunning && index > 0) {
                          const newTimers = [...timers];
                          [newTimers[index], newTimers[index - 1]] = [newTimers[index - 1], newTimers[index]];
                          setTimers(newTimers);
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => {
                        if (index < timers.length - 1) {
                          const newTimers = [...timers];
                          [newTimers[index], newTimers[index + 1]] = [newTimers[index + 1], newTimers[index]];
                          setTimers(newTimers);
                        }
                      }}
                      disabled={index === timers.length - 1 || isRunning}
                      class={`p-1 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-700 hover:text-gray-800'} disabled:opacity-50`}
                      aria-label={`Move timer ${index + 1} down`}
                      tabindex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isRunning && index < timers.length - 1) {
                          const newTimers = [...timers];
                          [newTimers[index], newTimers[index + 1]] = [newTimers[index + 1], newTimers[index]];
                          setTimers(newTimers);
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add meta viewport tag for proper mobile scaling */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    </div>
  );
};

export { App };
