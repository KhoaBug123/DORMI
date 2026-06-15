import { useState, useCallback } from 'react';
import VirtualTour360 from '../components/VirtualTour360';
import { validateEquirectangularRatio } from '../utils/imageValidation';

// ---------------------------------------------------------------------------
// Sample 360° image URLs for demo (public domain equirectangular panoramas)
// ---------------------------------------------------------------------------

interface DemoScene {
  id: string;
  label: string;
  url: string;
  description: string;
}

const DEMO_SCENES: DemoScene[] = [
  {
    id: 'room-exterior',
    label: 'Panoramic Exterior View',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Polarlicht_2.jpg/2560px-Polarlicht_2.jpg',
    description: 'A sample equirectangular panorama from Wikimedia Commons.',
  },
  {
    id: 'fallback',
    label: 'Procedural Demo (No Image)',
    url: '',
    description: 'Renders the built-in canvas gradient fallback — simulates a night-sky environment.',
  },
  {
    id: 'invalid',
    label: 'Invalid URL (Error Fallback)',
    url: 'https://this-url-does-not-exist-xyz-123.com/panorama.jpg',
    description: 'Tests the error boundary: if the texture fails to load, falls back to procedural.',
  },
];

// ---------------------------------------------------------------------------
// Upload validation demo panel
// ---------------------------------------------------------------------------

interface UploadValidationPanelProps {
  onValidFile: (url: string, name: string) => void;
}

function UploadValidationPanel({ onValidFile }: UploadValidationPanelProps) {
  const [validationState, setValidationState] = useState<
    'idle' | 'validating' | 'valid' | 'invalid' | 'error'
  >('idle');
  const [fileName, setFileName] = useState('');
  const [ratio, setRatio] = useState<number | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setValidationState('validating');
      setRatio(null);

      // Compute actual ratio for UI feedback
      const computeRatio = (): Promise<number> =>
        new Promise((resolve) => {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img.naturalWidth / img.naturalHeight);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(-1);
          };
          img.src = url;
        });

      try {
        const [isValid, computedRatio] = await Promise.all([
          validateEquirectangularRatio(file),
          computeRatio(),
        ]);

        setRatio(computedRatio);

        if (isValid) {
          setValidationState('valid');
          const objectUrl = URL.createObjectURL(file);
          onValidFile(objectUrl, file.name);
        } else {
          setValidationState('invalid');
        }
      } catch {
        setValidationState('error');
      }

      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    [onValidFile],
  );

  const stateConfig = {
    idle: { color: 'rgba(148, 163, 184, 0.6)', icon: '📁', text: 'No file selected' },
    validating: { color: '#fbbf24', icon: '⏳', text: 'Validating ratio…' },
    valid: { color: '#34d399', icon: '✅', text: `Valid equirectangular (2:1 ratio)` },
    invalid: {
      color: '#f87171',
      icon: '❌',
      text: `Invalid ratio${ratio !== null ? ` — detected ${ratio.toFixed(3)}:1 (need ~2:1)` : ''}`,
    },
    error: { color: '#fb923c', icon: '⚠️', text: 'Could not read file' },
  }[validationState];

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: '20px 24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <h3
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#e2e8f0',
          marginBottom: 4,
          letterSpacing: '0.02em',
        }}
      >
        📤 Upload Your 360° Image
      </h3>
      <p
        style={{
          fontSize: 12,
          color: 'rgba(148, 163, 184, 0.7)',
          marginBottom: 16,
          lineHeight: 1.5,
        }}
      >
        Must be equirectangular format (2:1 aspect ratio, e.g. 4096×2048px).
        The validator will reject non-panoramic images before upload.
      </p>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          padding: '10px 16px',
          background: 'rgba(96, 165, 250, 0.08)',
          border: '1px dashed rgba(96, 165, 250, 0.35)',
          borderRadius: 10,
          color: '#93c5fd',
          fontSize: 13,
          fontWeight: 500,
          transition: 'all 0.2s ease',
        }}
      >
        <span>📂</span>
        <span>{fileName || 'Choose 360° Image File…'}</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="tour-file-upload"
        />
      </label>

      {/* Validation status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          padding: '8px 12px',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.2)',
          border: `1px solid ${stateConfig.color}30`,
          minHeight: 36,
        }}
      >
        <span style={{ fontSize: 16 }}>{stateConfig.icon}</span>
        <span style={{ fontSize: 12, color: stateConfig.color, fontWeight: 500 }}>
          {stateConfig.text}
        </span>
        {validationState === 'valid' && ratio !== null && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: 'rgba(52, 211, 153, 0.7)',
            }}
          >
            {ratio.toFixed(2)}:1
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TourDemoPage — main 360 demo page
// ---------------------------------------------------------------------------

export default function TourDemoPage() {
  const [activeScene, setActiveScene] = useState<DemoScene>(DEMO_SCENES[0]);
  const [customLabel, setCustomLabel] = useState(DEMO_SCENES[0].label);

  const handleValidFile = useCallback((objectUrl: string, name: string) => {
    const customScene: DemoScene = {
      id: 'custom-upload',
      label: name,
      url: objectUrl,
      description: 'Your uploaded equirectangular panorama.',
    };
    setActiveScene(customScene);
    setCustomLabel(name);
  }, []);

  const handleSceneSelect = (scene: DemoScene) => {
    setActiveScene(scene);
    setCustomLabel(scene.label);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080c14',
        fontFamily: 'Inter, system-ui, sans-serif',
        paddingTop: 60, // NavBar height
      }}
    >
      {/* Page header */}
      <div
        style={{
          padding: '32px 32px 0',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.25)',
            borderRadius: 20,
            padding: '4px 14px',
            marginBottom: 16,
            fontSize: 11,
            color: '#c4b5fd',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          <span>🔮</span>
          <span>Feature Preview</span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            color: '#f1f5f9',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          360° Virtual Tour Viewer
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(148, 163, 184, 0.75)', marginBottom: 28 }}>
          Powered by{' '}
          <span style={{ color: '#60a5fa', fontWeight: 600 }}>React Three Fiber</span> &amp;{' '}
          <span style={{ color: '#a78bfa', fontWeight: 600 }}>@react-three/drei</span>.
          Drag to look around. Scroll locked to prevent zoom breakout.
        </p>
      </div>

      {/* Main layout: canvas + sidebar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 24,
          padding: '0 32px 40px',
          maxWidth: 1200,
          margin: '0 auto',
          alignItems: 'start',
        }}
      >
        {/* 360° Canvas */}
        <div
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
          }}
        >
          <VirtualTour360
            imageUrl={activeScene.url}
            height="520px"
            label={customLabel}
          />
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Scene description */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: '20px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: '#a78bfa',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Active Scene
            </div>
            <div
              style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}
            >
              {activeScene.label}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(148, 163, 184, 0.7)', lineHeight: 1.6 }}>
              {activeScene.description}
            </p>
          </div>

          {/* Scene selector */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: '20px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: '#60a5fa',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              🎬 Demo Scenes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_SCENES.map((scene) => {
                const isActive = activeScene.id === scene.id;
                return (
                  <button
                    key={scene.id}
                    id={`scene-btn-${scene.id}`}
                    onClick={() => handleSceneSelect(scene)}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: isActive ? 'rgba(96, 165, 250, 0.12)' : 'rgba(0,0,0,0.2)',
                      border: isActive
                        ? '1px solid rgba(96, 165, 250, 0.3)'
                        : '1px solid rgba(255,255,255,0.06)',
                      color: isActive ? '#93c5fd' : 'rgba(148, 163, 184, 0.8)',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>
                      {scene.url === ''
                        ? '🌌'
                        : scene.id === 'invalid'
                        ? '💥'
                        : '🏙️'}
                    </span>
                    <span>{scene.label}</span>
                    {isActive && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: 10,
                          color: '#60a5fa',
                          background: 'rgba(96, 165, 250, 0.15)',
                          borderRadius: 8,
                          padding: '2px 8px',
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload validation panel */}
          <UploadValidationPanel onValidFile={handleValidFile} />

          {/* Tech stack info */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 16,
              padding: '16px 20px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: 'rgba(148, 163, 184, 0.5)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Tech Stack
            </div>
            {[
              ['@react-three/fiber', 'React renderer for Three.js'],
              ['@react-three/drei', 'OrbitControls, helpers'],
              ['THREE.TextureLoader', 'R3F cached texture loading'],
              ['CanvasTexture', 'Procedural fallback generator'],
            ].map(([pkg, desc]) => (
              <div
                key={pkg}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <code
                  style={{
                    fontSize: 11,
                    color: '#34d399',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {pkg}
                </code>
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(148, 163, 184, 0.5)',
                    textAlign: 'right',
                  }}
                >
                  {desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
