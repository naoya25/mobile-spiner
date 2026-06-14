import { useMemo, useRef, useState } from 'react';

type InteractionMode = 'idle' | 'primed' | 'spinning' | 'mouse';

interface PointerSnapshot {
  x: number;
  y: number;
  time: number;
}

export interface AnchorPosition {
  x: number;
  y: number;
}

interface UseTwoFingerSpinResult {
  angleRef: React.MutableRefObject<number>;
  angularVelocityRef: React.MutableRefObject<number>;
  anchorPosition: AnchorPosition;
  interactionMode: InteractionMode;
  speed: number;
  activeTouchCount: number;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  stopSpin: () => void;
  boostSpin: () => void;
}

interface UseTwoFingerSpinOptions {
  sensitivity: number;
}

const minimumRadius = 38;
const velocityLimit = 34;
// Each tap of the spin button adds this much angular velocity; rapid taps stack up
// faster than `decay` bleeds them off, so the spinner keeps accelerating.
const boostImpulse = 13;
const boostVelocityLimit = 120;
const initialAnchorPosition: AnchorPosition = { x: 0, y: 0 };
const centerAnchorPosition: AnchorPosition = { x: 0, y: 0 };

function normalizeDeltaRadians(delta: number): number {
  if (delta > Math.PI) {
    return delta - Math.PI * 2;
  }
  if (delta < -Math.PI) {
    return delta + Math.PI * 2;
  }
  return delta;
}

function getNormalizedAnchorPosition(element: HTMLElement, x: number, y: number): AnchorPosition {
  const rect = element.getBoundingClientRect();
  const normalizedX = ((x - rect.left) / rect.width) * 2 - 1;
  const normalizedY = -(((y - rect.top) / rect.height) * 2 - 1);

  return {
    x: Math.max(-0.86, Math.min(0.86, normalizedX)),
    y: Math.max(-0.72, Math.min(0.72, normalizedY))
  };
}

function angleFromAnchor(anchor: PointerSnapshot, x: number, y: number): number {
  return Math.atan2(y - anchor.y, x - anchor.x);
}

function distanceFromAnchor(anchor: PointerSnapshot, x: number, y: number): number {
  return Math.hypot(x - anchor.x, y - anchor.y);
}

export function useTwoFingerSpin({ sensitivity }: UseTwoFingerSpinOptions): UseTwoFingerSpinResult {
  const angleRef = useRef(0);
  const angularVelocityRef = useRef(0);
  const pointersRef = useRef(new Map<number, PointerSnapshot>());
  const anchorSnapshotRef = useRef<PointerSnapshot | null>(null);
  const anchorPointerIdRef = useRef<number | null>(null);
  const swipePointerIdRef = useRef<number | null>(null);
  const previousSwipeAngleRef = useRef<number | null>(null);
  const previousSwipeTimeRef = useRef<number | null>(null);
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>(initialAnchorPosition);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('idle');
  const [activeTouchCount, setActiveTouchCount] = useState(0);
  const [speed, setSpeed] = useState(0);

  const updateSpeed = () => {
    setSpeed(Math.abs(angularVelocityRef.current));
  };

  const clearSwipeTracking = () => {
    previousSwipeAngleRef.current = null;
    previousSwipeTimeRef.current = null;
    swipePointerIdRef.current = null;
  };

  return useMemo(
    () => ({
      angleRef,
      angularVelocityRef,
      anchorPosition,
      interactionMode,
      speed,
      activeTouchCount,
      onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
        const snapshot = {
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp
        };

        event.currentTarget.setPointerCapture(event.pointerId);
        pointersRef.current.set(event.pointerId, snapshot);
        setActiveTouchCount(pointersRef.current.size);

        if (event.pointerType === 'mouse') {
          anchorPointerIdRef.current = event.pointerId;
          anchorSnapshotRef.current = snapshot;
          setAnchorPosition(
            getNormalizedAnchorPosition(event.currentTarget, event.clientX, event.clientY)
          );
          setInteractionMode('mouse');
          return;
        }

        if (anchorPointerIdRef.current === null) {
          anchorPointerIdRef.current = event.pointerId;
          anchorSnapshotRef.current = snapshot;
          setAnchorPosition(
            getNormalizedAnchorPosition(event.currentTarget, event.clientX, event.clientY)
          );
          setInteractionMode('primed');
          return;
        }

        if (
          swipePointerIdRef.current === null &&
          event.pointerId !== anchorPointerIdRef.current &&
          anchorSnapshotRef.current !== null
        ) {
          swipePointerIdRef.current = event.pointerId;
          previousSwipeAngleRef.current = angleFromAnchor(
            anchorSnapshotRef.current,
            event.clientX,
            event.clientY
          );
          previousSwipeTimeRef.current = event.timeStamp;
          setInteractionMode('spinning');
        }
      },
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
        if (!pointersRef.current.has(event.pointerId)) {
          return;
        }

        pointersRef.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp
        });

        const isMouseDrag =
          event.pointerType === 'mouse' && anchorPointerIdRef.current === event.pointerId;
        const isTwoFingerSwipe = swipePointerIdRef.current === event.pointerId;

        if (
          isMouseDrag ||
          (event.pointerId === anchorPointerIdRef.current && swipePointerIdRef.current === null)
        ) {
          const snapshot = pointersRef.current.get(event.pointerId);
          if (!snapshot) {
            return;
          }

          anchorSnapshotRef.current = snapshot;
          setAnchorPosition(
            getNormalizedAnchorPosition(event.currentTarget, event.clientX, event.clientY)
          );
          setInteractionMode(event.pointerType === 'mouse' ? 'mouse' : 'primed');
          return;
        }

        if (!isTwoFingerSwipe || anchorSnapshotRef.current === null) {
          return;
        }

        const radius = distanceFromAnchor(anchorSnapshotRef.current, event.clientX, event.clientY);
        if (radius < minimumRadius) {
          return;
        }

        const nextAngle = angleFromAnchor(anchorSnapshotRef.current, event.clientX, event.clientY);
        const previousAngle = previousSwipeAngleRef.current;
        const previousTime = previousSwipeTimeRef.current;

        previousSwipeAngleRef.current = nextAngle;
        previousSwipeTimeRef.current = event.timeStamp;

        if (previousAngle === null || previousTime === null) {
          return;
        }

        const delta = -normalizeDeltaRadians(nextAngle - previousAngle) * sensitivity;
        const elapsedSeconds = Math.max((event.timeStamp - previousTime) / 1000, 0.001);
        const nextVelocity = Math.max(
          -velocityLimit,
          Math.min(velocityLimit, delta / elapsedSeconds)
        );

        angleRef.current += delta;
        angularVelocityRef.current = nextVelocity;
        updateSpeed();
        setInteractionMode(event.pointerType === 'mouse' ? 'mouse' : 'spinning');
      },
      onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
        pointersRef.current.delete(event.pointerId);
        setActiveTouchCount(pointersRef.current.size);

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }

        if (event.pointerId === anchorPointerIdRef.current) {
          anchorPointerIdRef.current = null;
          anchorSnapshotRef.current = null;
          clearSwipeTracking();
        }

        if (event.pointerId === swipePointerIdRef.current) {
          clearSwipeTracking();
        }

        if (pointersRef.current.size === 0) {
          anchorSnapshotRef.current = null;
          anchorPointerIdRef.current = null;
          clearSwipeTracking();
          setAnchorPosition(centerAnchorPosition);
          setInteractionMode(Math.abs(angularVelocityRef.current) > 0.2 ? 'spinning' : 'idle');
          return;
        }

        setInteractionMode(Math.abs(angularVelocityRef.current) > 0.2 ? 'spinning' : 'primed');
      },
      stopSpin: () => {
        angleRef.current = 0;
        angularVelocityRef.current = 0;
        pointersRef.current.clear();
        anchorPointerIdRef.current = null;
        anchorSnapshotRef.current = null;
        clearSwipeTracking();
        setActiveTouchCount(0);
        setSpeed(0);
        setAnchorPosition(centerAnchorPosition);
        setInteractionMode('idle');
      },
      boostSpin: () => {
        const current = angularVelocityRef.current;
        const direction = current < -0.05 ? -1 : 1;
        const next = current + direction * boostImpulse;
        angularVelocityRef.current = Math.max(
          -boostVelocityLimit,
          Math.min(boostVelocityLimit, next)
        );
        updateSpeed();
        setInteractionMode('spinning');
      }
    }),
    [activeTouchCount, anchorPosition, interactionMode, sensitivity, speed]
  );
}
