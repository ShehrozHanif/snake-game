"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const CANVAS_SIZE = 400
const GRID_SIZE = 20
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

interface SnakePart {
  x: number
  y: number
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [snake, setSnake] = useState<SnakePart[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<SnakePart>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setDirection(Direction.UP)
          break
        case "ArrowDown":
          setDirection(Direction.DOWN)
          break
        case "ArrowLeft":
          setDirection(Direction.LEFT)
          break
        case "ArrowRight":
          setDirection(Direction.RIGHT)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake]
        const head = { ...newSnake[0] }

        switch (direction) {
          case Direction.UP:
            head.y -= 1
            break
          case Direction.DOWN:
            head.y += 1
            break
          case Direction.LEFT:
            head.x -= 1
            break
          case Direction.RIGHT:
            head.x += 1
            break
        }

        // Check for collision with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true)
          return prevSnake
        }

        // Check for collision with self
        if (newSnake.some((part) => part.x === head.x && part.y === head.y)) {
          setGameOver(true)
          return prevSnake
        }

        newSnake.unshift(head)

        // Check for food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((prevScore) => prevScore + 1)
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          })
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }

    const gameLoop = setInterval(moveSnake, 100)

    return () => clearInterval(gameLoop)
  }, [direction, food, gameOver, gameStarted, isPaused])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw snake
    ctx.fillStyle = "#4CAF50"
    snake.forEach((part) => {
      ctx.fillRect(part.x * CELL_SIZE, part.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    })

    // Draw food
    ctx.fillStyle = "#FF5722"
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)

    // Draw grid
    ctx.strokeStyle = "#E0E0E0"
    for (let i = 0; i < GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }
  }, [snake, food])

  const handleStartGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setSnake([{ x: 10, y: 10 }])
    setDirection(Direction.RIGHT)
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    })
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
  }

  const handleStopGame = () => {
    setGameStarted(false)
    setGameOver(true)
    setIsPaused(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
       
      <Card className="p-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Snake Game</h1>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="border-2 border-gray-300 rounded-lg"
        />
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xl font-semibold text-gray-700">Score: {score}</div>
          <div className="space-x-2">
            {!gameStarted && !gameOver && (
              <Button onClick={handleStartGame} className="bg-green-500 hover:bg-green-600">
                Start Game
              </Button>
            )}
            {gameStarted && !gameOver && (
              <>
                <Button onClick={handlePauseResume} className="bg-yellow-500 hover:bg-yellow-600">
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button onClick={handleStopGame} className="bg-red-500 hover:bg-red-600">
                  Stop
                </Button>
              </>
            )}
            {gameOver && (
              <Button onClick={handleStartGame} className="bg-blue-500 hover:bg-blue-600">
                Try Again
              </Button>
            )}
          </div>
        </div>
        {gameOver && (
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-red-600">Game Over!</h2>
            <p className="text-lg text-gray-700">Final Score: {score}</p>
          </div>
        )}
      </Card>
    </div>
  )
}