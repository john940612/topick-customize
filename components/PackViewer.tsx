"use client";

import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import * as THREE from "three";
import { drawLabelCanvas, drawNamePlate, drawPhotoCanvas, drawSideAccent, loadImage } from "@/lib/packArt";
import type { DesignState } from "@/lib/types";

const MODEL = "/models/topick-pack.glb";

useGLTF.preload(MODEL);

export function PackViewer({ design }: { design: DesignState }) {
  return (
    <div className="h-[68vh] min-h-[420px] w-full touch-none bg-[#ece7df]">
      <Canvas
        camera={{ position: [0.03, 0.1, 0.36], fov: 28, near: 0.01, far: 10 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl, scene, camera }) => {
          const pmrem = new THREE.PMREMGenerator(gl);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          gl.toneMappingExposure = 1.05;
          camera.lookAt(0.004, 0.05, 0);
        }}
      >
        <color attach="background" args={["#ece7df"]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[1.2, 1.8, 1.4]} intensity={2.2} />
          <directionalLight position={[-1.4, 0.8, 0.6]} intensity={0.7} />
          <PackModel design={design} />
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

function PackModel({ design }: { design: DesignState }) {
  const { materials, scene } = useGLTF(MODEL);
  useEffect(() => {
    const label = mapped(materials.Mat_BottleLabel);
    const photo = mapped(materials.Mat_BoxFrontPhoto);
    const name = mapped(materials.Mat_BoxFrontName);
    const side = mapped(materials.Mat_BoxSideAccent);
    const originals = new Map<THREE.MeshStandardMaterial, THREE.Texture | null>();
    for (const material of [label, photo, name, side]) {
      if (material && !originals.has(material)) originals.set(material, material.map);
    }
    let alive = true;
    const created: THREE.Texture[] = [];

    const apply = (material: THREE.MeshStandardMaterial | null, canvas: HTMLCanvasElement | null) => {
      if (!material) return;
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

    async function paint() {
      await document.fonts.ready;
      if (!alive) return;
      apply(label, design.labelName.trim() ? drawLabelCanvas(design.labelName) : null);
      apply(name, design.boxName.trim() ? drawNamePlate(design.boxName) : null);
      apply(side, design.sideTitle.trim() ? drawSideAccent(design.sideTitle) : null);
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
    };
  }, [
    design.boxName,
    design.labelName,
    design.photo,
    design.sideTitle,
    materials.Mat_BottleLabel,
    materials.Mat_BoxFrontName,
    materials.Mat_BoxFrontPhoto,
    materials.Mat_BoxSideAccent,
  ]);

  return <primitive object={scene} />;
}

function mapped(material: THREE.Material | THREE.Material[] | undefined) {
  const value = Array.isArray(material) ? material[0] : material;
  if (value && "map" in value) return value as THREE.MeshStandardMaterial;
  return null;
}
