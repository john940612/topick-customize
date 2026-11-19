"use client";

import { ContactShadows, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import * as THREE from "three";
import { drawLabelCanvas, drawNamePlate, drawPhotoCanvas, drawSideAccent, loadImage } from "@/lib/packArt";
import type { ArtworkSlot } from "@/lib/orderRecord";
import type { DesignState } from "@/lib/types";

export type SavedArtwork = Partial<Record<ArtworkSlot, string>>;

const MODEL = "/models/topick-pack.glb";

useGLTF.preload(MODEL);

export function PackViewer({
  design,
  artwork,
  className,
}: {
  design: DesignState;
  artwork?: SavedArtwork;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? "h-[68vh] min-h-[420px] w-full touch-none bg-[#e0d8ce]"}`}>
      <PackStatus />
      <Canvas
        camera={{ position: [0.03, 0.1, 0.36], fov: 28, near: 0.01, far: 10 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping }}
        onCreated={({ gl, scene, camera }) => {
          const pmrem = new THREE.PMREMGenerator(gl);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          scene.environmentIntensity = 0.62;
          gl.toneMappingExposure = 0.86;
          camera.lookAt(0.004, 0.05, 0);
        }}
      >
        <color attach="background" args={["#e0d8ce"]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.12} />
          <directionalLight position={[1.2, 1.8, 1.4]} intensity={0.9} />
          <directionalLight position={[-1.4, 0.8, 0.6]} intensity={0.3} />
          <PackModel design={design} artwork={artwork} />
          <ContactShadows position={[0.004, 0, 0]} opacity={0.35} scale={0.45} blur={2.4} far={0.25} color="#6d6458" />
        </Suspense>
        <OrbitControls
          makeDefault
          target={[0.004, 0.05, 0]}
          enablePan={false}
          minDistance={0.18}
          maxDistance={0.7}
          minPolarAngle={0.45}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </div>
  );
}

function PackStatus() {
  const { active, progress } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#e0d8ce] text-sm text-muted" role="status">
      瓶身載入中
    </div>
  );
}

const CAP_HEX: Record<string, string> = {
  pink: "#e7a8b8",
  purple: "#6d4b86",
  green: "#3f6d52",
  white: "#f6f3ee",
};

function PackModel({ design, artwork }: { design: DesignState; artwork?: SavedArtwork }) {
  const { materials, scene } = useGLTF(MODEL);
  useEffect(() => {
    const label = mapped(materials.Mat_BottleLabel);
    const photo = mapped(materials.Mat_BoxFrontPhoto);
    const name = mapped(materials.Mat_BoxFrontName);
    const side = mapped(materials.Mat_BoxSideAccent);
    const cap = mapped(materials.Mat_BottleCap);
    const originals = new Map<THREE.MeshStandardMaterial, THREE.Texture | null>();
    const originalCap = cap ? cap.color.clone() : null;
    for (const material of [label, photo, name, side]) {
      if (material && !originals.has(material)) originals.set(material, material.map);
    }
    let alive = true;
    const created: THREE.Texture[] = [];

    const apply = (material: THREE.MeshStandardMaterial | null, canvas: HTMLCanvasElement | null) => {
      if (!material) return;
      material.color.set("#ffffff");
      if (!canvas) {
        material.map = originals.get(material) ?? null;
        material.needsUpdate = true;
        return;
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
      created.push(texture);
      material.map = texture;
      material.needsUpdate = true;
    };

    async function paintSlot(
      material: THREE.MeshStandardMaterial | null,
      savedUrl: string | undefined,
      drawn: HTMLCanvasElement | null,
    ) {
      if (!alive) return;
      if (savedUrl) {
        try {
          const image = await loadImage(savedUrl);
          if (!alive) return;
          apply(material, imageToCanvas(image));
          return;
        } catch {
          apply(material, null);
          return;
        }
      }
      apply(material, drawn);
    }

    if (cap) {
      cap.color.set(CAP_HEX[design.capColor] ?? CAP_HEX.white);
      cap.needsUpdate = true;
    }

    async function paint() {
      await document.fonts.ready;
      if (!alive) return;
      await paintSlot(label, artwork?.label, design.labelName.trim() ? drawLabelCanvas(design.labelName) : null);
      await paintSlot(name, artwork?.name, design.boxName.trim() ? drawNamePlate(design.boxName) : null);
      await paintSlot(side, artwork?.side, design.sideTitle.trim() ? drawSideAccent(design.sideTitle) : null);
      if (artwork?.photo) {
        await paintSlot(photo, artwork.photo, null);
        return;
      }
      try {
        const image = await loadImage(design.photo.src);
        if (!alive) return;
        apply(photo, drawPhotoCanvas(image, design.photo));
      } catch {
        apply(photo, null);
      }
    }

    void paint();
    return () => {
      alive = false;
      for (const [material, map] of originals) {
        material.map = map;
        material.needsUpdate = true;
      }
      for (const texture of created) texture.dispose();
      if (cap && originalCap) {
        cap.color.copy(originalCap);
        cap.needsUpdate = true;
      }
    };
  }, [
    design.capColor,
    design.boxName,
    design.labelName,
    design.photo,
    design.sideTitle,
    artwork?.label,
    artwork?.name,
    artwork?.photo,
    artwork?.side,
    materials.Mat_BottleCap,
    materials.Mat_BottleLabel,
    materials.Mat_BoxFrontName,
    materials.Mat_BoxFrontPhoto,
    materials.Mat_BoxSideAccent,
  ]);

  return <primitive object={scene} />;
}

function imageToCanvas(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || 1;
  canvas.height = image.naturalHeight || 1;
  canvas.getContext("2d")?.drawImage(image, 0, 0);
  return canvas;
}

function mapped(material: THREE.Material | THREE.Material[] | undefined) {
  const value = Array.isArray(material) ? material[0] : material;
  if (value && "map" in value) return value as THREE.MeshStandardMaterial;
  return null;
}
