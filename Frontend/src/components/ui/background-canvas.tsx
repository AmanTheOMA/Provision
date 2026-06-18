import { useEffect, useRef } from "react";

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const _canvas = canvasRef.current;
    if (!_canvas) return;
    const _ctx = _canvas.getContext("2d");
    if (!_ctx) return;
    // Assign to non-nullable types so closures below don't trigger TS18047
    const canvas: HTMLCanvasElement = _canvas;
    const ctx: CanvasRenderingContext2D = _ctx;

    const threadColor = "rgba(100, 100, 255, 0.45)";
    const threadCount = 80;

    type Thread = {
      x: number;
      y: number;
      speed: number;
      amplitude: number;
      frequency: number;
      phase: number;
      reset: () => void;
      update: () => void;
      draw: () => void;
    };

    let threads: Thread[] = [];
    let animId: number;
    let w = 0;
    let h = 0;

    function makeThread(): Thread {
      const t: Thread = {
        x: 0,
        y: 0,
        speed: 0,
        amplitude: 0,
        frequency: 0,
        phase: 0,
        reset() {
          this.x = Math.random() * w;
          this.y = Math.random() * h;
          this.speed = Math.random() * 0.5 + 0.1;
          this.amplitude = Math.random() * 20 + 10;
          this.frequency = Math.random() * 0.02 + 0.01;
          this.phase = Math.random() * Math.PI * 2;
        },
        update() {
          this.x += this.speed;
          if (this.x > w) {
            this.x = 0;
            this.y = Math.random() * h;
          }
        },
        draw() {
          const startX = Math.max(this.x - 200, 0);
          ctx.beginPath();
          ctx.moveTo(
            startX,
            this.y + Math.sin(startX * this.frequency + this.phase) * this.amplitude,
          );
          for (let i = startX; i < this.x; i++) {
            ctx.lineTo(
              i,
              this.y + Math.sin(i * this.frequency + this.phase) * this.amplitude,
            );
          }
          ctx.strokeStyle = threadColor;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        },
      };
      t.reset();
      return t;
    }

    function setup() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      threads = Array.from({ length: threadCount }, () => makeThread());
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const thread of threads) {
        thread.update();
        thread.draw();
      }
    }

    setup();
    animate();
    window.addEventListener("resize", setup);

    return () => {
      window.removeEventListener("resize", setup);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}
