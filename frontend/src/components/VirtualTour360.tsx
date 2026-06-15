import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VirtualTour360Props {
  /** Full URL to an equirectangular 360° image. Pass empty string for fallback. */
  imageUrl: string;
  /** Height of the canvas container. Defaults to '100vh'. */
  height?: string;
  /** Optional label shown in the bottom HUD. */
  label?: string;
}

// ---------------------------------------------------------------------------
// Procedural fallback: generates a gradient canvas texture when no URL given
// ---------------------------------------------------------------------------

function createProceduralTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Sky gradient (top → middle)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.55);
  skyGrad.addColorStop(0, '#0a0e1a');     // deep night sky
  skyGrad.addColorStop(0.35, '#1a2a4a');  // dark navy
  skyGrad.addColorStop(0.7, '#2d4a7a');   // dusk blue
  skyGrad.addColorStop(1, '#4a6fa5');     // horizon blue

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.55);

  // Ground gradient (middle → bottom)
  const groundGrad = ctx.createLinearGradient(0, height * 0.55, 0, height);
  groundGrad.addColorStop(0, '#2d3b2d');  // dark green-gray
  groundGrad.addColorStop(0.4, '#1a2a1a');
  groundGrad.addColorStop(1, '#0d1a0d');  // near-black ground

  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  // Horizon glow
  const horizonGrad = ctx.createLinearGradient(0, height * 0.46, 0, height * 0.62);
  horizonGrad.addColorStop(0, 'rgba(100, 160, 255, 0)');
  horizonGrad.addColorStop(0.5, 'rgba(100, 160, 255, 0.12)');
  horizonGrad.addColorStop(1, 'rgba(100, 160, 255, 0)');

  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, height * 0.46, width, height * 0.16);

  // Subtle stars (random white dots in the sky zone)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const rng = (min: number, max: number) => Math.random() * (max - min) + min;
  for (let i = 0; i < 180; i++) {
    const x = rng(0, width);
    const y = rng(0, height * 0.48);
    const r = rng(0.5, 1.8);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grid lines on ground to simulate a floor plane
  ctx.strokeStyle = 'rgba(80, 140, 80, 0.18)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 20; i++) {
    const x = (i / 20) * width;
    ctx.beginPath();
    ctx.moveTo(x, height * 0.55);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let j = 0; j <= 8; j++) {
    const y = height * 0.55 + (j / 8) * height * 0.45;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------------------
// Inner sphere scene: renders the equirectangular texture on inverted sphere
// ---------------------------------------------------------------------------

interface SphereMeshProps {
  texture: THREE.Texture;
}

function SphereMesh({ texture }: SphereMeshProps) {
  return (
    /*
     * CRITICAL GEOMETRY FIX — "Black Poles" prevention:
     * args={[radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength]}
     *   - thetaStart  = 0.087  rad ≈ 5°  → crops 5° from the zenith (top)
     *   - thetaLength = Math.PI - 0.174   → leaves 170° total, cropping 5° from nadir (bottom)
     *
     * scale={[-1, 1, 1]} flips normals to face inward so the texture is
     * visible from inside the sphere.
     */
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry
        args={[15, 64, 64, 0, Math.PI * 2, 0.087, Math.PI - 0.174]}
        dispose={null}
      />
      <meshBasicMaterial
        map={texture}
        side={THREE.FrontSide}
        toneMapped={false}
        dispose={null}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Loader wrapper — uses R3F's useLoader for built-in cache + disposal
// ---------------------------------------------------------------------------

function TexturedSphere({ url }: { url: string }) {
  const texture = useLoader(THREE.TextureLoader, url);

  useEffect(() => {
    // Ensure correct color space for sRGB equirectangular textures
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  return <SphereMesh texture={texture} />;
}

// ---------------------------------------------------------------------------
// Fallback sphere: shows procedural gradient when no URL given
// ---------------------------------------------------------------------------

function FallbackSphere() {
  const texture = useMemo(() => createProceduralTexture(), []);

  // Dispose the canvas texture on unmount
  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return <SphereMesh texture={texture} />;
}

// ---------------------------------------------------------------------------
// Error boundary for texture load failures
// The recommended way to reset an error boundary is via the `key` prop from
// the parent — when the key changes, React unmounts/remounts the boundary.
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

class TextureErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Camera initializer: positions camera at origin facing forward (+Z axis)
// ---------------------------------------------------------------------------

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 0.001); // Tiny offset from center to avoid gimbal lock
    camera.lookAt(0, 0, 1);
  }, [camera]);

  return null;
}

// ---------------------------------------------------------------------------
// Loading placeholder rendered while texture streams in
// ---------------------------------------------------------------------------

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[15, 32, 32, 0, Math.PI * 2, 0.087, Math.PI - 0.174]} dispose={null} />
      <meshBasicMaterial color="#0d1a2a" side={THREE.BackSide} dispose={null} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

const VirtualTour360: React.FC<VirtualTour360Props> = ({
  imageUrl,
  height = '100vh',
  label,
}) => {
  const hasValidUrl = imageUrl.trim().length > 0;

  const showFallback = !hasValidUrl;

  return (
    <div
      style={{ width: '100%', height, position: 'relative', overflow: 'hidden' }}
      aria-label={label ?? '360° Virtual Tour'}
      role="img"
    >
      {/* HUD Overlay — top-left badge */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          borderRadius: 24,
          padding: '6px 14px',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '0.03em',
          border: '1px solid rgba(255,255,255,0.15)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 16 }}>🔮</span>
        <span>360° Virtual Tour</span>
        {showFallback && (
          <span
            style={{
              marginLeft: 4,
              background: 'rgba(255,180,0,0.25)',
              color: '#fbbf24',
              borderRadius: 12,
              padding: '1px 8px',
              fontSize: 11,
            }}
          >
            DEMO MODE
          </span>
        )}
      </div>

      {/* HUD Overlay — bottom label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: 'rgba(0,0,0,0.60)',
            backdropFilter: 'blur(8px)',
            borderRadius: 20,
            padding: '8px 20px',
            color: '#e2e8f0',
            fontSize: 14,
            fontFamily: 'Inter, system-ui, sans-serif',
            border: '1px solid rgba(255,255,255,0.12)',
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          📍 {label}
        </div>
      )}

      {/* Drag instruction hint */}
      <div
        style={{
          position: 'absolute',
          bottom: label ? 70 : 20,
          right: 16,
          zIndex: 10,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)',
          borderRadius: 12,
          padding: '5px 12px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 12,
          fontFamily: 'Inter, system-ui, sans-serif',
          pointerEvents: 'none',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>🖱</span>
        <span>Drag to look around</span>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 100, position: [0, 0, 0.001] }}
        gl={{
          antialias: true,
          toneMapping: THREE.NoToneMapping, // disable tone mapping for 360° panoramas
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ background: '#080c14' }}
      >
        {/* Position camera at origin */}
        <CameraSetup />

        {/*
         * OrbitControls configuration:
         *   - enableZoom=false: prevents user from zooming out of the sphere
         *   - enablePan=false: prevents panning away from center
         *   - minPolarAngle / maxPolarAngle: clamp vertical look to avoid
         *     the cropped pole regions (5° crop ≈ PI/36, so we allow PI/2.5 → PI/1.5)
         *   - rotateSpeed=-0.4: negative value makes drag direction feel natural
         *     (drag right → scene moves right = look left naturally)
         */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
          rotateSpeed={-0.4}
          autoRotate={false}
          makeDefault
        />

        {/* Render sphere with texture or fallback.
          * The `key={imageUrl}` on TextureErrorBoundary ensures the error
          * boundary resets whenever the URL changes (React key-reset pattern).
          */}
        {showFallback ? (
          <FallbackSphere />
        ) : (
          <TextureErrorBoundary
            key={imageUrl}
            fallback={<FallbackSphere />}
          >
            <Suspense fallback={<LoadingFallback />}>
              <TexturedSphere url={imageUrl} />
            </Suspense>
          </TextureErrorBoundary>
        )}
      </Canvas>
    </div>
  );
};

export default VirtualTour360;
