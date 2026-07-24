"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { clsx } from "clsx";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const STEP = 0.6;

type Point = { x: number; y: number };

function distance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function ZoomableImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const pointers = useRef(new Map<number, Point>());
  const dragStart = useRef<{ pointer: Point; position: Point } | null>(null);
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);

  function clampScale(value: number) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
  }

  function applyScale(next: number) {
    const clamped = clampScale(next);
    setScale(clamped);
    if (clamped === MIN_SCALE) setPosition({ x: 0, y: 0 });
  }

  function reset() {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }

  function handleWheel(event: React.WheelEvent) {
    event.preventDefault();
    applyScale(scale - event.deltaY * 0.0025);
  }

  function handleDoubleClick() {
    if (scale > 1) {
      reset();
    } else {
      applyScale(2.5);
    }
  }

  function handlePointerDown(event: React.PointerEvent) {
    containerRef.current?.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinchStart.current = { distance: distance(a, b), scale };
      dragStart.current = null;
      setDragging(false);
    } else if (pointers.current.size === 1 && scale > 1) {
      dragStart.current = {
        pointer: { x: event.clientX, y: event.clientY },
        position,
      };
      setDragging(true);
    }
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const ratio = distance(a, b) / pinchStart.current.distance;
      applyScale(pinchStart.current.scale * ratio);
    } else if (dragStart.current) {
      const dx = event.clientX - dragStart.current.pointer.x;
      const dy = event.clientY - dragStart.current.pointer.y;
      setPosition({
        x: dragStart.current.position.x + dx,
        y: dragStart.current.position.y + dy,
      });
    }
  }

  function handlePointerUp(event: React.PointerEvent) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      dragStart.current = null;
      setDragging(false);
    }
    if (scale <= 1) setPosition({ x: 0, y: 0 });
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative touch-none select-none overflow-hidden bg-surface-2",
        className,
      )}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
    >
      <div
        className={clsx(
          "h-full w-full",
          !dragging && "transition-transform duration-150 ease-out",
        )}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 512px"
          className="pointer-events-none object-contain"
          draggable={false}
        />
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        {scale > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              reset();
            }}
            aria-label="Repor zoom"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            applyScale(scale - STEP);
          }}
          disabled={scale <= MIN_SCALE}
          aria-label="Diminuir zoom"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            applyScale(scale + STEP);
          }}
          disabled={scale >= MAX_SCALE}
          aria-label="Aumentar zoom"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
