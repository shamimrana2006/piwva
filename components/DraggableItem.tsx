"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface DraggableItemProps {
  children: React.ReactNode;
  initialPosition: [number, number, number];
  initialRotation?: [number, number, number];
  scatterOffset?: [number, number, number];
  isScattered?: boolean;
  floatSpeed?: number;
  floatAmplitude?: number;
  rotFloatAmplitude?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  dragEnabled?: boolean;
  name?: string;
  resetTrigger?: number;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  children,
  initialPosition,
  initialRotation = [0, 0, 0],
  scatterOffset = [0, 0, 0],
  isScattered = false,
  floatSpeed = 1.5,
  floatAmplitude = 0.08,
  rotFloatAmplitude = 0.03,
  onDragStart,
  onDragEnd,
  dragEnabled = true,
  name,
  resetTrigger = 0,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, raycaster, gl } = useThree();

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Position targets for smooth interpolation (Lerp)
  const currentPos = useRef(new THREE.Vector3(...initialPosition));
  const targetPos = useRef(new THREE.Vector3(...initialPosition));
  const basePos = useRef(new THREE.Vector3(...initialPosition));

  // Rotation targets
  const currentRot = useRef(new THREE.Euler(...initialRotation));
  const baseRot = useRef(new THREE.Euler(...initialRotation));

  // Drag plane & offset calculation
  const dragPlane = useRef(new THREE.Plane());
  const planeIntersect = useRef(new THREE.Vector3());
  const dragOffset = useRef(new THREE.Vector3());

  // Random phase for natural de-synchronized floating
  const phase = useRef(Math.random() * Math.PI * 2);

  // Reset when resetTrigger changes
  useEffect(() => {
    basePos.current.set(...initialPosition);
    targetPos.current.set(...initialPosition);
  }, [resetTrigger, initialPosition]);

  // Handle Scatter Mode
  useEffect(() => {
    if (isScattered) {
      targetPos.current.set(
        initialPosition[0] + scatterOffset[0],
        initialPosition[1] + scatterOffset[1],
        initialPosition[2] + scatterOffset[2]
      );
    } else {
      targetPos.current.copy(basePos.current);
    }
  }, [isScattered, initialPosition, scatterOffset]);

  const handlePointerDown = (e: any) => {
    if (!dragEnabled) return;
    e.stopPropagation();

    // Create a plane perpendicular to camera direction passing through object
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    dragPlane.current.setFromNormalAndCoplanarPoint(
      cameraDir.negate(),
      groupRef.current ? groupRef.current.position : new THREE.Vector3()
    );

    // Calculate intersection
    if (raycaster.ray.intersectPlane(dragPlane.current, planeIntersect.current)) {
      if (groupRef.current) {
        dragOffset.current.copy(groupRef.current.position).sub(planeIntersect.current);
      }
    }

    setIsDragging(true);
    if (onDragStart) onDragStart();
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || !dragEnabled) return;
    e.stopPropagation();

    if (raycaster.ray.intersectPlane(dragPlane.current, planeIntersect.current)) {
      const newTarget = planeIntersect.current.clone().add(dragOffset.current);
      targetPos.current.copy(newTarget);
      basePos.current.copy(newTarget);
    }
  };

  const handlePointerUp = (e: any) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      if (onDragEnd) onDragEnd();
      (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
    }
  };

  // Cursor styling
  useEffect(() => {
    if (isDragging) {
      gl.domElement.style.cursor = "grabbing";
    } else if (isHovered && dragEnabled) {
      gl.domElement.style.cursor = "grab";
    } else {
      gl.domElement.style.cursor = "default";
    }
    return () => {
      gl.domElement.style.cursor = "default";
    };
  }, [isDragging, isHovered, dragEnabled, gl]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const floatY = isDragging
      ? 0
      : Math.sin(time * floatSpeed + phase.current) * floatAmplitude;
    const floatRotZ = isDragging
      ? 0
      : Math.cos(time * floatSpeed * 0.8 + phase.current) * rotFloatAmplitude;
    const floatRotX = isDragging
      ? 0
      : Math.sin(time * floatSpeed * 0.7 + phase.current) * (rotFloatAmplitude * 0.6);

    // Lerp position smoothly
    const destination = targetPos.current.clone();
    destination.y += floatY;

    // Slight lift when hovered
    if (isHovered && !isDragging) {
      destination.z += 0.15;
    }

    currentPos.current.lerp(destination, Math.min(1, delta * 10));
    groupRef.current.position.copy(currentPos.current);

    // Rotation interpolation
    const targetEulerZ = baseRot.current.z + floatRotZ;
    const targetEulerX = baseRot.current.x + floatRotX;
    const targetEulerY = baseRot.current.y;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetEulerX,
      delta * 8
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetEulerY,
      delta * 8
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetEulerZ,
      delta * 8
    );

    // Hover scale effect
    const targetScale = isHovered && !isDragging ? 1.03 : 1;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 12
    );
  });

  return (
    <group
      ref={groupRef}
      name={name}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
    >
      {children}
    </group>
  );
};
