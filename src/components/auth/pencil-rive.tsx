"use client";

import { useEffect } from "react";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";

interface PencilRiveProps {
  className?: string;
  src?: string;
  artboard?: string;
  stateMachines?: readonly string[];
  ariaLabel?: string;
}

const DEFAULT_STATE_MACHINES = ["State Machine 2", "State Machine 1"];

export function PencilRive({
  className,
  src = "/images/lapicito.riv?v=20261022b",
  artboard = "Desktop - 1",
  stateMachines = DEFAULT_STATE_MACHINES,
  ariaLabel = "Lápiz sonriente, avatar de la Fábrica de Contenidos",
}: PencilRiveProps) {
  const { rive, RiveComponent } = useRive(
    {
      src,
      artboard,
      // Preferimos SM2 (export reciente); si no existe, el effect hace fallback.
      stateMachine: stateMachines[0],
      autoplay: true,
      layout: new Layout({
        fit: Fit.Contain,
        alignment: Alignment.Center,
      }),
    },
    {
      shouldResizeCanvasToContainer: true,
      useDevicePixelRatio: true,
    },
  );

  useEffect(() => {
    if (!rive) return;

    const playBestMachine = () => {
      const machines = rive.stateMachineNames;
      const target =
        stateMachines.find((name) => machines.includes(name)) ?? machines[0];

      if (target) {
        rive.play(target);
      }
      rive.resizeDrawingSurfaceToCanvas();
    };

    playBestMachine();

    // El panel del login a veces monta con tamaño 0 y luego crece.
    const frame = requestAnimationFrame(playBestMachine);
    const timeout = window.setTimeout(playBestMachine, 100);

    const onResize = () => rive.resizeDrawingSurfaceToCanvas();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };
  }, [rive, stateMachines]);

  return (
    <div className={className}>
      <RiveComponent
        className="h-full w-full touch-none"
        role="img"
        aria-label={ariaLabel}
      />
    </div>
  );
}
