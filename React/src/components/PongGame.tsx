import React, { useRef, useState, useEffect, useCallback } from "react";

const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paddleX, setPaddleX] = useState(186); // Changed from 350
  const [ballPosition, setBallPosition] = useState({ x: 300, y: 200 });
  const [ballVelocity, setBallVelocity] = useState(() =>
    getInitialBallVelocity()
  );
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const canvasWidth = 600;
  const canvasHeight = 400;
  const paddleWidth = 30;
  const paddleHeight = 10;
  const paddleY = canvasHeight - 72; // Changed from canvasHeight - 100

  const text = "NFT-TICKETS";
  const paddleIndex = text.indexOf("-");
  const letterSpacing = canvasWidth / (text.length + 1);

  // Move getInitialBallVelocity into a useCallback
  const getInitialBallVelocity = useCallback(() => {
    const speed = 4;
    const ballStartX = canvasWidth / 2;
    const targetX = paddleX + paddleWidth / 2;
    const deltaX = targetX - ballStartX;
    const deltaY = paddleY - canvasHeight / 2;
    const angle = Math.atan2(deltaY, deltaX);

    return {
      x: speed * Math.cos(angle),
      y: speed * Math.sin(angle),
    };
  }, [paddleX, paddleY, paddleWidth, canvasWidth]);

  // Handle paddle movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && paddleX > 0) {
        setPaddleX((prevX) => Math.max(0, prevX - 20));
      }
      if (event.key === "ArrowRight" && paddleX < canvasWidth - paddleWidth) {
        setPaddleX((prevX) => Math.min(canvasWidth - paddleWidth, prevX + 20));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paddleX]);

  // Add these touch handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      setPaddleX(() =>
        Math.min(Math.max(x - paddleWidth / 2, 0), canvasWidth - paddleWidth)
      );
    };

    canvas.addEventListener("touchstart", handleTouch);
    canvas.addEventListener("touchmove", handleTouch);

    return () => {
      canvas.removeEventListener("touchstart", handleTouch);
      canvas.removeEventListener("touchmove", handleTouch);
    };
  }, []);

  // Ball movement and collision detection
  useEffect(() => {
    const updateGame = () => {
      setBallPosition((prevPosition) => {
        let newPosX = prevPosition.x + ballVelocity.x;
        let newPosY = prevPosition.y + ballVelocity.y;
        let newVelX = ballVelocity.x;
        let newVelY = ballVelocity.y;

        // Wall collisions (sides and top)
        if (newPosX <= 0 || newPosX >= canvasWidth) {
          newPosX = newPosX <= 0 ? 0 : canvasWidth;
          newVelX =
            newPosX <= 0 ? Math.abs(ballVelocity.x) : -Math.abs(ballVelocity.x);
        }
        if (newPosY <= 0) {
          newPosY = 0;
          newVelY = Math.abs(ballVelocity.y);
        }

        // Paddle collision
        if (
          newPosY >= paddleY &&
          newPosY <= paddleY + paddleHeight &&
          newPosX >= paddleX &&
          newPosX <= paddleX + paddleWidth
        ) {
          newPosY = paddleY;
          newVelY = -Math.abs(ballVelocity.y);
          const newScore = score + 1;
          setScore(newScore);
          setHighScore((prev) => Math.max(prev, newScore));
        }

        // Bottom wall collision (game over)
        if (newPosY >= canvasHeight) {
          newPosY = canvasHeight / 2;
          newPosX = canvasWidth / 2;
          setBallVelocity(getInitialBallVelocity());
          setScore(0);
        }

        // Update velocity if it changed
        if (newVelX !== ballVelocity.x || newVelY !== ballVelocity.y) {
          setBallVelocity({ x: newVelX, y: newVelY });
        }

        return { x: newPosX, y: newPosY };
      });
    };

    const gameLoop = setInterval(updateGame, 16); // 60 FPS
    return () => clearInterval(gameLoop);
  }, [
    ballPosition,
    ballVelocity,
    paddleX,
    paddleY,
    score,
    getInitialBallVelocity,
  ]);

  // Draw everything on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw Score
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.textAlign = "right";
        ctx.fillText(`High Score: ${highScore}`, canvasWidth - 10, 30);
        ctx.textAlign = "left";

        // Draw background text
        ctx.font = "48px Arial";
        ctx.fillStyle = "#e0e0e0";
        text.split("").forEach((letter, index) => {
          if (index !== paddleIndex) {
            ctx.fillText(
              letter,
              (index + 1) * letterSpacing - 15,
              canvasHeight - 50
            );
          }
        });

        // Draw Paddle (the dash)
        ctx.fillStyle = "blue";
        ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);

        // Draw Ball
        ctx.beginPath();
        ctx.arc(ballPosition.x, ballPosition.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
      }
    }
  }, [
    paddleX,
    ballPosition,
    score,
    letterSpacing,
    paddleIndex,
    paddleY,
    highScore,
  ]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        touchAction: "none", // Prevents default touch actions
        userSelect: "none", // Prevents text selection
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          border: "2px solid black",
          borderRadius: "4px",
          backgroundColor: "white",
          cursor: "pointer",
          maxWidth: "100%", // Makes canvas responsive
          maxHeight: "100vh",
        }}
      />
    </div>
  );
};

export default PongGame;
