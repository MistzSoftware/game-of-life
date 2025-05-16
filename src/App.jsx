import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Simulation update interval in milliseconds
 */
const interval = 120

/**
 * Main application component for Conway's Game of Life simulation
 * Provides a complete implementation with adjustable rules and grid size
 *
 * @returns {JSX.Element} The Game of Life application
 */
function App() {
  // Grid state
  const [numRows, setNumRows] = useState(30)
  const [numCols, setNumCols] = useState(50)
  const [grid, setGrid] = useState(() => generateEmptyGrid(30, 50))
  
  // Simulation control state
  const [running, setRunning] = useState(false)
  const runningRef = useRef(running)
  runningRef.current = running
  
  // UI state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  
  // Conway's Game of Life rule parameters
  const [surviveMin, setSurviveMin] = useState(2)
  const [surviveMax, setSurviveMax] = useState(3)
  const [birthNum, setBirthNum] = useState(3)

  /**
   * Creates an empty grid of specified dimensions filled with zeros
   * 
   * @param {number} rows - Number of rows in the grid
   * @param {number} cols - Number of columns in the grid
   * @returns {Array<Array<number>>} 2D array representing empty grid
   */
  function generateEmptyGrid(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(0))
  }

  /**
   * Direction vectors for the eight neighboring cells
   * Used to count neighbors during simulation steps
   */
  const operations = [
    [0, 1],   // right
    [0, -1],  // left
    [1, -1],  // bottom-left
    [-1, 1],  // top-right
    [1, 1],   // bottom-right
    [-1, -1], // top-left
    [1, 0],   // bottom
    [-1, 0],  // top
  ]

  /**
   * Runs one step of the simulation by applying Conway's Game of Life rules
   * Uses setTimeout for animation instead of requestAnimationFrame for consistent speed
   * This is memoized to prevent recreating the function on every render
   */
  const runSimulation = useCallback(() => {
    if (!runningRef.current) return
    setGrid((g) => {
      return g.map((row, i) =>
        row.map((cell, j) => {
          let neighbors = 0
          operations.forEach(([x, y]) => {
            const newI = i + x
            const newJ = j + y
            if (
              newI >= 0 &&
              newI < numRows &&
              newJ >= 0 &&
              newJ < numCols
            ) {
              neighbors += g[newI][newJ]
            }
          })
          if (cell === 1 && (neighbors < surviveMin || neighbors > surviveMax)) return 0
          if (cell === 0 && neighbors === birthNum) return 1
          return cell
        })
      )
    })
    setTimeout(runSimulation, interval)
  }, [numRows, numCols, surviveMin, surviveMax, birthNum])

  const handleCellClick = (i, j) => {
    const newGrid = grid.map((row, rowIdx) =>
      row.map((cell, colIdx) =>
        rowIdx === i && colIdx === j ? (cell ? 0 : 1) : cell
      )
    )
    setGrid(newGrid)
  }

  const handleClear = () => {
    setGrid(generateEmptyGrid(numRows, numCols))
    setRunning(false)
  }

  const handleRandom = () => {
    const rows = Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => (Math.random() > 0.7 ? 1 : 0))
    )
    setGrid(rows)
  }

  const handleResize = (rows, cols) => {
    setNumRows(rows)
    setNumCols(cols)
    setGrid(generateEmptyGrid(rows, cols))
    setRunning(false)
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Drawer - Full height */}
      <div
        className={`fixed h-full transition-all duration-300 overflow-auto ${darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-300'} shadow-lg z-20 ${drawerOpen ? 'w-80 p-6' : 'w-0 p-0'}`}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          className={`absolute top-3 right-3 text-2xl bg-transparent border-none cursor-pointer ${darkMode ? 'text-white' : 'text-gray-700'}`}
          aria-label="Close settings drawer"
        >
          ×
        </button>
        <h2 className="mt-0 text-xl font-bold">Simulation Settings</h2>
        <div className="mb-4 flex justify-between items-center w-full">
          <label 
            htmlFor="surviveMin"
            title="Minimum number of neighbors for a live cell to survive (default: 2)" 
            className="font-medium"
          >
            Live Cell Underpopulation:
          </label>
          <div className="flex justify-end w-20">
              <input
                id="surviveMin"
                type="number"
                min={0}
                max={8}
                value={surviveMin}
                onChange={e => setSurviveMin(Number(e.target.value))}
                className={`w-14 px-1 py-0.5 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                title="Minimum number of neighbors for a live cell to survive. If a live cell has fewer, it dies."
                autoComplete="new-password"
                data-form-type="other"
                data-lpignore="true"
                form="non-login-form"
                aria-autocomplete="none"
              />
          </div>
        </div>
        <div className="mb-4 flex justify-between items-center w-full">
          <label 
            htmlFor="surviveMax"
            title="Maximum number of neighbors for a live cell to survive (default: 3)" 
            className="font-medium"
          >
            Live Cell Overcrowding:
          </label>
          <div className="flex justify-end w-20">
              <input
                id="surviveMax"
                type="number"
                min={0}
                max={8}
                value={surviveMax}
                onChange={e => setSurviveMax(Number(e.target.value))}
                className={`w-14 px-1 py-0.5 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                title="Maximum number of neighbors for a live cell to survive. If a live cell has more, it dies."
                autoComplete="new-password"
                data-form-type="other"
                data-lpignore="true"
                form="non-login-form"
                aria-autocomplete="none"
              />
          </div>
        </div>
        <div className="mb-4 flex justify-between items-center w-full">
          <label 
            htmlFor="birthRule"
            title="Exact number of neighbors for a dead cell to become alive (default: 3)" 
            className="font-medium"
          >
            Cell Reproduction Count:
          </label>
          <div className="flex justify-end w-20">
              <input
                id="birthRule"
                type="number"
                min={0}
                max={8}
                value={birthNum}
                onChange={e => setBirthNum(Number(e.target.value))}
                className={`w-14 px-1 py-0.5 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                title="Exact number of neighbors for a dead cell to become alive."
                autoComplete="new-password"
                data-form-type="other"
                data-lpignore="true"
                form="non-login-form"
                aria-autocomplete="none"
              />
          </div>
        </div>
        <p className={`text-xs mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Adjust the rules to experiment with different Life-like cellular automata!
        </p>
      </div>
      {/* Drawer Toggle Button */}
      {!drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          className={`absolute left-2 top-4 z-10 rounded px-3 py-1 font-semibold shadow ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
          aria-label="Open rules drawer"
        >
          Rules
        </button>
      )}

      {/* Theme Toggle Button */}
      <button
        onClick={() => {
          console.log('Theme toggle clicked, current darkMode:', darkMode)
          setDarkMode(prevMode => {
            const newMode = !prevMode
            return newMode
          })
        }}
        className={`fixed right-4 top-4 z-10 rounded-full p-2 shadow ${
          darkMode ? 'bg-gray-800 text-yellow-300 border-gray-700' : 'bg-white text-gray-800 border-gray-300'
        }`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          // Sun icon (for switching to light mode)
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          // Moon icon (for switching to dark mode)
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
        <span className="sr-only">{darkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center pt-16 px-4 max-w-full overflow-auto">
        <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Conway's Game of Life</h1>
        <div className="mb-4 flex flex-wrap items-center gap-3 justify-center">
          <label className={`flex items-center gap-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Height:
            <input
              type="number"
              min={5}
              max={100}
              value={numRows}
              onChange={e => handleResize(Number(e.target.value), numCols)}
              className={`w-16 px-1 py-0.5 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              autoComplete="new-password"
              data-form-type="other"
              data-lpignore="true"
              form="non-login-form"
              aria-autocomplete="none"
            />
          </label>
          <label className={`flex items-center gap-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Width:
            <input
              type="number"
              min={5}
              max={100}
              value={numCols}
              onChange={e => handleResize(numRows, Number(e.target.value))}
              className={`w-16 px-1 py-0.5 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              autoComplete="new-password"
              data-form-type="other"
              data-lpignore="true"
              form="non-login-form"
              aria-autocomplete="none"
            />
          </label>
          <button
            onClick={() => {
              setRunning((r) => {
                if (!r) {
                  runningRef.current = true
                  runSimulation()
                }
                return !r
              })
            }}
            className={`px-4 py-1 rounded font-semibold transition ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700' : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600'}`}
          >
            {running ? 'Pause' : 'Start'}
          </button>
          <button 
            onClick={handleClear} 
            className={`ml-2 px-4 py-1 rounded transition ${darkMode ? 'bg-gray-700 hover:bg-gray-800 text-white border-gray-800' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300'}`}
          >
            Clear
          </button>
          <button 
            onClick={handleRandom} 
            className={`ml-2 px-4 py-1 rounded transition ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' : 'bg-green-500 hover:bg-green-600 text-white border-green-600'}`}
          >
            Random
          </button>
        </div>
        <div 
          className="grid mx-auto overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${numCols}, 12px)` }}
        >
          {grid.map((row, i) =>
            row.map((col, j) => (
              <div
                key={`${i}-${j}`}
                onClick={() => handleCellClick(i, j)}
                className={`w-[12px] h-[12px] border border-solid cursor-pointer transition-colors duration-100 ${
                  grid[i][j] 
                    ? darkMode 
                      ? 'bg-cyan-400 border-cyan-800' 
                      : 'bg-cyan-700 border-cyan-900' 
                    : darkMode 
                      ? 'bg-gray-800 border-gray-900' 
                      : 'bg-gray-200 border-gray-300'
                }`}
              />
            ))
          )}
        </div>
        <p className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Click cells to toggle. Start, pause, clear, or randomize the board.
        </p>
      </div>
    </div>
  )
}

export default App
