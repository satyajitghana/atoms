"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitalScene } from "./orbital-scene";
import { SceneControls } from "./scene-controls";
import {
  getMoleculeGeometry,
  getAtomColor,
  getAtomRadius,
  type MoleculeGeometry,
} from "@/lib/data/molecular-geometry";
import { ELEMENTS } from "@/lib/data/elements";

interface CompoundViewerProps {
  formula: string;
  className?: string;
}

// Nucleus: show protons (red) and neutrons (gray) packed into a sphere
function Nucleus({
  symbol,
  position,
}: {
  symbol: string;
  position: [number, number, number];
}) {
  const element = ELEMENTS.find((e) => e.symbol === symbol);
  const atomicNumber = element?.number ?? 1;
  const massNumber = Math.round(element?.mass ?? 1);
  const protons = atomicNumber;
  const neutrons = Math.max(0, massNumber - protons);

  const nucleonPositions = useMemo(() => {
    const total = Math.min(protons + neutrons, 40); // cap for performance
    const pCount = Math.min(protons, total);
    const nCount = total - pCount;
    const positions: { pos: [number, number, number]; isProton: boolean }[] = [];

    // Pack nucleons in a sphere using Fibonacci spiral
    const nucleonRadius = 0.08;
    const packRadius =
      total <= 1
        ? 0
        : nucleonRadius * Math.pow(total, 1 / 3) * 1.1;

    for (let i = 0; i < total; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = packRadius * Math.cbrt((i + 0.5) / total);

      positions.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        isProton: i < pCount,
      });
    }

    return positions;
  }, [protons, neutrons]);

  return (
    <group position={position}>
      {nucleonPositions.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color={n.isProton ? "#ff3333" : "#999999"}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Electron cloud around an atom using instanced points
function ElectronCloud({
  symbol,
  position,
  valenceElectrons,
}: {
  symbol: string;
  position: [number, number, number];
  valenceElectrons: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const color = getAtomColor(symbol);
  const radius = getAtomRadius(symbol);

  const { matrices, opacities } = useMemo(() => {
    const count = Math.min(valenceElectrons * 60, 400);
    const mats: THREE.Matrix4[] = [];
    const ops: number[] = [];
    const cloudRadius = radius * 2.5;

    for (let i = 0; i < count; i++) {
      // Random position in shell
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      // Concentrate in shell region
      const r = cloudRadius * (0.5 + 0.5 * Math.cbrt(Math.random()));

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const mat = new THREE.Matrix4();
      const scale = 0.03 + Math.random() * 0.02;
      mat.makeScale(scale, scale, scale);
      mat.setPosition(x, y, z);
      mats.push(mat);
      ops.push(0.3 + Math.random() * 0.5);
    }
    return { matrices: mats, opacities: ops };
  }, [valenceElectrons, radius]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * 0.3;
    for (let i = 0; i < matrices.length; i++) {
      const mat = matrices[i].clone();
      const pos = new THREE.Vector3();
      pos.setFromMatrixPosition(mat);
      // Gentle orbital motion
      const angle = t + i * 0.1;
      const drift = 0.1 * Math.sin(angle);
      pos.x += drift * Math.cos(i);
      pos.y += drift * Math.sin(i);
      const scale = new THREE.Vector3();
      scale.setFromMatrixScale(mat);
      const newMat = new THREE.Matrix4();
      newMat.makeScale(scale.x, scale.y, scale.z);
      newMat.setPosition(pos.x, pos.y, pos.z);
      meshRef.current.setMatrixAt(i, newMat);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (matrices.length === 0) return null;

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, matrices.length]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}

// Bond connection between two atoms
function Bond({
  start,
  end,
  bondType,
}: {
  start: [number, number, number];
  end: [number, number, number];
  bondType: "ionic" | "covalent" | "metallic";
}) {
  const { midpoint, length, quaternion } = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = s.clone().add(e).multiplyScalar(0.5);
    const len = s.distanceTo(e);
    const dir = e.clone().sub(s).normalize();
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return { midpoint: mid, length: len, quaternion: quat };
  }, [start, end]);

  const color = bondType === "ionic" ? "#88aaff" : bondType === "metallic" ? "#ccaa44" : "#aaaaaa";
  const radius = bondType === "ionic" ? 0.04 : 0.06;

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={bondType === "ionic" ? 0.5 : 0.8}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

// Label for each atom
function AtomLabel({
  symbol,
  position,
}: {
  symbol: string;
  position: [number, number, number];
}) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Sprite>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 128, 64);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, 64, 32);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [symbol]);

  return (
    <sprite
      ref={meshRef}
      position={[position[0], position[1] + getAtomRadius(symbol) * 3 + 0.5, position[2]]}
      scale={[1.2, 0.6, 1]}
    >
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </sprite>
  );
}

// Get valence electrons for an element
function getValenceElectrons(symbol: string): number {
  const valenceMap: Record<string, number> = {
    H: 1, He: 2, Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8,
    Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8,
    K: 1, Ca: 2, Fe: 2, Cu: 1, Zn: 2, Br: 7, Ag: 1, I: 7, Ba: 2,
    Sn: 4, Pb: 4, Co: 2, Ni: 2, Mn: 2, Cr: 1, Ti: 2, As: 5,
  };
  return valenceMap[symbol] ?? 4;
}

// Auto-fit camera to molecule extent
function MoleculeCameraFitter({ geometry }: { geometry: MoleculeGeometry }) {
  const { camera } = useThree();

  useEffect(() => {
    if (geometry.atoms.length === 0) return;
    let maxR2 = 0;
    for (const atom of geometry.atoms) {
      const [x, y, z] = atom.position;
      const r2 = x * x + y * y + z * z;
      if (r2 > maxR2) maxR2 = r2;
    }
    // Add radius of the atom + electron cloud
    const moleculeRadius = Math.sqrt(maxR2) + 1.5;
    const fov = (camera as THREE.PerspectiveCamera).fov;
    const fovRad = (fov * Math.PI) / 180;
    const dist = (moleculeRadius / Math.sin(fovRad / 2)) * 1.4;
    camera.position.set(0, 0, Math.max(dist, 5));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [geometry, camera]);

  return null;
}

function CompoundScene({
  geometry,
  bondType,
}: {
  geometry: MoleculeGeometry;
  bondType: "ionic" | "covalent" | "metallic";
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, -3, 2]} intensity={0.3} />
      <SceneControls />
      <MoleculeCameraFitter geometry={geometry} />

      <group ref={groupRef}>
        {/* Bonds */}
        {geometry.bonds.map(([a, b], i) => (
          <Bond
            key={`bond-${i}`}
            start={geometry.atoms[a].position}
            end={geometry.atoms[b].position}
            bondType={bondType}
          />
        ))}

        {/* Atoms */}
        {geometry.atoms.map((atom, i) => (
          <group key={`atom-${i}`}>
            <Nucleus symbol={atom.symbol} position={atom.position} />
            <ElectronCloud
              symbol={atom.symbol}
              position={atom.position}
              valenceElectrons={getValenceElectrons(atom.symbol)}
            />
            <AtomLabel symbol={atom.symbol} position={atom.position} />
          </group>
        ))}
      </group>
    </>
  );
}

// Fallback for unknown compounds: show atoms in a line
function generateFallbackGeometry(formula: string): MoleculeGeometry | null {
  // Very basic parser: split formula into atoms
  const matches = formula.match(/([A-Z][a-z]?)(\d*)/g);
  if (!matches) return null;

  const atoms: { symbol: string; count: number }[] = [];
  for (const m of matches) {
    const match = m.match(/([A-Z][a-z]?)(\d*)/);
    if (match && match[1]) {
      atoms.push({ symbol: match[1], count: parseInt(match[2] || "1", 10) });
    }
  }

  const BL = 3.0;
  const allAtoms: { symbol: string; position: [number, number, number] }[] = [];
  const bonds: [number, number][] = [];

  let totalCount = 0;
  for (const a of atoms) totalCount += a.count;

  let idx = 0;
  const startX = -((totalCount - 1) * BL) / 2;
  for (const a of atoms) {
    for (let i = 0; i < a.count; i++) {
      allAtoms.push({
        symbol: a.symbol,
        position: [startX + idx * BL, 0, 0],
      });
      if (idx > 0) bonds.push([idx - 1, idx]);
      idx++;
    }
  }

  return {
    shape: "linear",
    atoms: allAtoms,
    bonds,
    bondLength: BL,
  };
}

export function CompoundViewer({ formula, className }: CompoundViewerProps) {
  const geometry = getMoleculeGeometry(formula) ?? generateFallbackGeometry(formula);

  if (!geometry) {
    return (
      <div className={className ?? "w-full h-[300px] flex items-center justify-center"}>
        <p className="text-xs text-muted-foreground">No 3D structure available</p>
      </div>
    );
  }

  // Determine bond type from formula's first two different atoms
  const symbols = [...new Set(geometry.atoms.map((a) => a.symbol))];
  let bondType: "ionic" | "covalent" | "metallic" = "covalent";
  if (symbols.length >= 2) {
    // Simple heuristic: metals + nonmetals = ionic
    const metals = ["Li", "Na", "K", "Ca", "Mg", "Ba", "Fe", "Cu", "Zn", "Ag", "Al", "Sn", "Pb", "Ni", "Co", "Mn", "Cr", "Ti"];
    const hasMetal = symbols.some((s) => metals.includes(s));
    const hasNonmetal = symbols.some((s) => !metals.includes(s));
    if (hasMetal && hasNonmetal) bondType = "ionic";
  }

  return (
    <div className={className ?? "w-full h-[300px]"} style={{ position: "relative" }}>
      <OrbitalScene className="w-full h-full">
        <CompoundScene geometry={geometry} bondType={bondType} />
      </OrbitalScene>
    </div>
  );
}
