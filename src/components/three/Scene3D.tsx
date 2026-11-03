import { Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { cssVar, useResolvedTheme } from '../../lib/theme';
import { Legend, niceTicks } from '../Chart';

// A small kit for 3-D lab scenes on top of react-three-fiber. Everything takes data coordinates;
// the scene stretches its domain onto a cube, so every axis gets the same length, with z pointing up.
//
//   <Scene3D domain={{ x: [0, 1], y: [0, 1], z: [0, 5] }} labels={{ x: 'θ₀', y: 'θ₁', z: 'J(θ)' }}>
//     <Surface f={(x, y) => x * x + y * y} colormap={{ min: 0, max: 2 }} />
//     <Line3D points={path} color="--c-res" />
//   </Scene3D>
//
// Colours are CSS custom properties ('--c-fit') or literal colours, and follow the site theme.
// Only modules loaded through lazy3D (components/View3D) should import this file: it pulls in three.js.

export type Range = [number, number];
export type V3 = [number, number, number];
export interface Domain {
  x: Range;
  y: Range;
  z: Range;
}

interface SceneState {
  domain: Domain;
  /** data → world, each axis onto [-1, 1] */
  w: (p: V3) => V3;
  /** world → data */
  d: (p: V3) => V3;
  /** CSS custom property or colour → colour */
  col: (c: string) => string;
  /** keeps geometry inside the box */
  clip: THREE.Plane[];
  /** show a hover tip at a data point, or hide it */
  setTip: (tip: { at: V3; content: ReactNode } | null) => void;
}

/**
 * Labels are ordinary DOM in an overlay above the canvas (rendered by the page's React tree);
 * <Projector> moves each one to the screen position of its 3-D point whenever a frame is drawn.
 */
interface Overlay {
  pins: Map<HTMLElement, V3>;
  invalidate: () => void;
}
const v3 = new THREE.Vector3();
function Projector({ overlay }: { overlay: Overlay }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    overlay.invalidate = invalidate;
    invalidate();
  }, [overlay, invalidate]);
  useFrame(({ camera, size }) => {
    for (const [el, p] of overlay.pins) {
      v3.set(p[0], p[1], p[2]).project(camera);
      const x = ((v3.x + 1) / 2) * size.width;
      const y = ((1 - v3.y) / 2) * size.height;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      el.style.visibility = v3.z < 1 ? 'visible' : 'hidden';
    }
  });
  return null;
}

/** An overlay label pinned to a world point. */
function Pin({ overlay, at, cls, children }: { overlay: Overlay; at: V3; cls: string; children: ReactNode }) {
  const [x, y, z] = at;
  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      overlay.pins.set(el, [x, y, z]);
      overlay.invalidate();
      return () => {
        overlay.pins.delete(el);
      };
    },
    [overlay, x, y, z],
  );
  return (
    <span ref={ref} className="pin3">
      <span className={cls}>{children}</span>
    </span>
  );
}
const SceneContext = createContext<SceneState | null>(null);
function useScene() {
  const s = useContext(SceneContext);
  if (!s) throw new Error('3-D primitives must be inside <Scene3D>.');
  return s;
}

const lerp = (r: Range, t: number) => r[0] + (r[1] - r[0]) * t;
const unit = (r: Range, v: number) => (2 * (v - r[0])) / (r[1] - r[0]) - 1;
const fmtTick = (v: number) => String(Number(v.toPrecision(6))).replace('-', '−');

/* ---------------- scene ---------------- */

export function Scene3D({
  domain,
  labels,
  eye = [1.6, -1.5, 0.8],
  legend,
  notes,
  children,
}: {
  domain: Domain;
  labels: { x: ReactNode; y: ReactNode; z: ReactNode };
  /** camera direction from the centre, in cube units */
  eye?: V3;
  legend?: Parameters<typeof Legend>[0]['items'];
  /** text pinned to data points, e.g. names next to arrow tips; `color` is a CSS variable or colour */
  notes?: { at: V3; text: ReactNode; color?: string }[];
  children: ReactNode;
}) {
  const theme = useResolvedTheme();
  const [view, setView] = useState(0);
  const [tip, setTip] = useState<{ at: V3; content: ReactNode } | null>(null);
  const overlay = useMemo<Overlay>(() => ({ pins: new Map(), invalidate: () => {} }), []);
  const state = useMemo<SceneState>(() => {
    const { x, y, z } = domain;
    return {
      domain,
      w: (p) => [unit(x, p[0]), unit(y, p[1]), unit(z, p[2])],
      d: (p) => [lerp(x, (p[0] + 1) / 2), lerp(y, (p[1] + 1) / 2), lerp(z, (p[2] + 1) / 2)],
      col: (c) => (c.startsWith('--') ? cssVar(c) || '#888' : c),
      clip: [
        [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
      ].map(([a, b, c]) => new THREE.Plane(new THREE.Vector3(a, b, c), 1.0001)),
      setTip,
    };
    // theme: colours are read from CSS when the theme changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.x[0], domain.x[1], domain.y[0], domain.y[1], domain.z[0], domain.z[1], theme]);
  const ticks = useMemo(() => axisTicks(domain), [domain]);
  const k = 5.5 / Math.hypot(...eye);
  const off = 0.16;
  // the side the camera starts on: grid walls go behind, tick labels in front
  const sx = eye[0] < 0 ? -1 : 1;
  const sy = eye[1] > 0 ? 1 : -1;

  return (
    <div className="scene3d">
      <div className="scene3d-canvas">
        <Canvas
          key={view}
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ position: [eye[0] * k, eye[1] * k, eye[2] * k], up: [0, 0, 1], fov: 34, near: 0.05, far: 50 }}
          onCreated={({ gl }) => {
            gl.localClippingEnabled = true;
          }}
          onPointerMissed={() => setTip(null)}
        >
          <SceneContext.Provider value={state}>
            <ambientLight intensity={1.4} />
            <directionalLight position={[2, -3, 4]} intensity={1.6} />
            <directionalLight position={[-3, 2, 1]} intensity={0.5} />
            <Axes ticks={ticks} sx={sx} sy={sy} />
            {children}
          </SceneContext.Provider>
          <Projector overlay={overlay} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.12} minDistance={1.6} maxDistance={10} target={[0, 0, -0.12]} />
        </Canvas>
        <div className="scene3d-labels" aria-hidden>
          {ticks.x.map((v) => (
            <Pin key={`x${v}`} overlay={overlay} at={[unit(domain.x, v), sy * (1 + off), -1]} cls="ax3-tick">
              {fmtTick(v)}
            </Pin>
          ))}
          {ticks.y.map((v) => (
            <Pin key={`y${v}`} overlay={overlay} at={[sx * (1 + off), unit(domain.y, v), -1]} cls="ax3-tick">
              {fmtTick(v)}
            </Pin>
          ))}
          {ticks.z.map((v) => (
            <Pin key={`z${v}`} overlay={overlay} at={[-sx * (1 + off * 0.7), sy * (1 + off * 0.7), unit(domain.z, v)]} cls="ax3-tick">
              {fmtTick(v)}
            </Pin>
          ))}
          <Pin overlay={overlay} at={[0, sy * (1 + 3.4 * off), -1]} cls="ax3-title">
            {labels.x}
          </Pin>
          <Pin overlay={overlay} at={[sx * (1 + 3.4 * off), 0, -1]} cls="ax3-title">
            {labels.y}
          </Pin>
          <Pin overlay={overlay} at={[-sx, sy, 1 + off]} cls="ax3-title">
            {labels.z}
          </Pin>
          {notes?.map((n, i) => (
            <Pin key={`n${i}`} overlay={overlay} at={state.w(n.at)} cls="ax3-note">
              <span style={n.color ? { color: state.col(n.color) } : undefined}>{n.text}</span>
            </Pin>
          ))}
          {tip && (
            <Pin overlay={overlay} at={tip.at} cls="tip3">
              {tip.content}
            </Pin>
          )}
        </div>
        <button className="btn btn-ghost scene3d-reset" onClick={() => setView((v) => v + 1)}>
          Reset view
        </button>
      </div>
      <div className="scene3d-foot">
        {legend ? <Legend items={legend} /> : <span />}
        <span className="kbd-hint">drag to rotate · scroll to zoom · right-drag to pan</span>
      </div>
    </div>
  );
}

/* ---------------- axes ---------------- */

function segmentsGeometry(pairs: V3[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pairs.flat(), 3));
  return g;
}

function axisTicks(domain: Domain) {
  const t = (r: Range) => niceTicks(r[0], r[1], 5).filter((v) => v >= r[0] && v <= r[1]);
  return { x: t(domain.x), y: t(domain.y), z: t(domain.z) };
}

/** Floor grid, the two walls behind the starting camera (side sx, sy) and the three labelled edges. */
function Axes({ ticks: t, sx, sy }: { ticks: ReturnType<typeof axisTicks>; sx: number; sy: number }) {
  const { domain, col } = useScene();
  const grid = useMemo(() => {
    const u = (axis: 'x' | 'y' | 'z', v: number) => unit(domain[axis], v);
    const p: V3[] = [];
    const bx = -sx; // back wall x = bx, back wall y = by
    const by = -sy;
    for (const x of t.x) p.push([u('x', x), -1, -1], [u('x', x), 1, -1], [u('x', x), by, -1], [u('x', x), by, 1]);
    for (const y of t.y) p.push([-1, u('y', y), -1], [1, u('y', y), -1], [bx, u('y', y), -1], [bx, u('y', y), 1]);
    for (const z of t.z) p.push([-1, by, u('z', z)], [1, by, u('z', z)], [bx, -1, u('z', z)], [bx, 1, u('z', z)]);
    return segmentsGeometry(p);
  }, [domain, t, sx, sy]);
  const edges = useMemo(
    () =>
      segmentsGeometry([
        [-1, sy, -1], [1, sy, -1],
        [sx, -1, -1], [sx, 1, -1],
        [-sx, sy, -1], [-sx, sy, 1],
      ]),
    [sx, sy],
  );
  return (
    <group>
      <lineSegments geometry={grid}>
        <lineBasicMaterial color={col('--grid')} />
      </lineSegments>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={col('--muted')} />
      </lineSegments>
    </group>
  );
}

/* ---------------- primitives ---------------- */

const VIRIDIS = ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'].map((c) => new THREE.Color(c));
function viridis(t: number, out: THREE.Color) {
  const s = Math.min(1, Math.max(0, t)) * (VIRIDIS.length - 1);
  const i = Math.min(VIRIDIS.length - 2, Math.floor(s));
  return out.copy(VIRIDIS[i]).lerp(VIRIDIS[i + 1], s - i);
}

/**
 * The graph z = f(x, y) over the x–y domain. Parts outside the box are cut off, so a steep bowl keeps its shape.
 * `colormap` colours by height (viridis from min to max); otherwise one `color`.
 */
export function Surface({
  f,
  n = 48,
  color = '--c-fit',
  colormap,
  opacity = 1,
  grid = 0,
  tooltip,
}: {
  f: (x: number, y: number) => number;
  n?: number;
  color?: string;
  colormap?: { min: number; max: number };
  opacity?: number;
  /** draw this many grid lines across the surface in each direction */
  grid?: number;
  /** contents of a hover tip at data point (x, y, f(x, y)) */
  tooltip?: (x: number, y: number, z: number) => ReactNode;
}) {
  const { domain, w, d, col, clip, setTip } = useScene();
  const { geom, lines } = useMemo(() => {
    const pos: number[] = [];
    const colors: number[] = [];
    const c = new THREE.Color();
    const zw = (x: number, y: number) => {
      const z = f(x, y);
      return Number.isFinite(z) ? w([x, y, z])[2] : 10;
    };
    for (let j = 0; j <= n; j++)
      for (let i = 0; i <= n; i++) {
        const x = lerp(domain.x, i / n);
        const y = lerp(domain.y, j / n);
        const z = f(x, y);
        pos.push(unit(domain.x, x), unit(domain.y, y), zw(x, y));
        if (colormap) {
          viridis((z - colormap.min) / (colormap.max - colormap.min), c);
          colors.push(c.r, c.g, c.b);
        }
      }
    const idx: number[] = [];
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const a = j * (n + 1) + i;
        idx.push(a, a + 1, a + n + 1, a + 1, a + n + 2, a + n + 1);
      }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    if (colormap) geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(idx);
    geom.computeVertexNormals();
    let lines: THREE.BufferGeometry | null = null;
    if (grid > 0) {
      const p: V3[] = [];
      const m = 4 * n; // finer sampling along each grid line
      for (let g = 0; g <= grid; g++) {
        const s = g / grid;
        for (let k = 0; k < m; k++) {
          const t0 = k / m;
          const t1 = (k + 1) / m;
          const xa = lerp(domain.x, s);
          const ya = lerp(domain.y, s);
          p.push([unit(domain.x, xa), 2 * t0 - 1, zw(xa, lerp(domain.y, t0))], [unit(domain.x, xa), 2 * t1 - 1, zw(xa, lerp(domain.y, t1))]);
          p.push([2 * t0 - 1, unit(domain.y, ya), zw(lerp(domain.x, t0), ya)], [2 * t1 - 1, unit(domain.y, ya), zw(lerp(domain.x, t1), ya)]);
        }
      }
      lines = segmentsGeometry(p);
    }
    return { geom, lines };
  }, [f, n, colormap?.min, colormap?.max, grid, domain, w]);

  const onMove = tooltip
    ? (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        // rays also hit the part cut off above the box: use the first visible hit
        const hit = e.intersections.find((i) => i.object === e.eventObject && i.point.z <= 1.0001);
        if (!hit) return setTip(null);
        const [x, y] = d([hit.point.x, hit.point.y, hit.point.z]);
        const z = f(x, y);
        setTip({ at: w([x, y, z]), content: tooltip(x, y, z) });
      }
    : undefined;

  return (
    <group>
      <mesh geometry={geom} onPointerMove={onMove} onPointerOut={tooltip ? () => setTip(null) : undefined}>
        <meshStandardMaterial
          color={colormap ? '#ffffff' : col(color)}
          vertexColors={!!colormap}
          side={THREE.DoubleSide}
          transparent={opacity < 1}
          opacity={opacity}
          depthWrite={opacity >= 1}
          roughness={0.85}
          metalness={0}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
          clippingPlanes={clip}
        />
      </mesh>
      {lines && (
        <lineSegments geometry={lines}>
          <lineBasicMaterial color={col('--ink')} transparent opacity={0.22} clippingPlanes={clip} />
        </lineSegments>
      )}
    </group>
  );
}

const inside = ({ x, y, z }: Domain, p: V3) => p.every(Number.isFinite) && p[0] >= x[0] && p[0] <= x[1] && p[1] >= y[0] && p[1] <= y[1] && p[2] >= z[0] && p[2] <= z[1];

/** A polyline through data points; pieces that leave the box are dropped. With `segments`, consecutive pairs are separate segments. */
export function Line3D({
  points,
  color = '--c-res',
  width = 2,
  dashed = false,
  segments = false,
  opacity = 1,
}: {
  points: V3[];
  color?: string;
  width?: number;
  dashed?: boolean;
  segments?: boolean;
  opacity?: number;
}) {
  const { domain, w, col } = useScene();
  const runs = useMemo(() => {
    if (segments) {
      const out: V3[] = [];
      for (let i = 0; i + 1 < points.length; i += 2) if (inside(domain, points[i]) && inside(domain, points[i + 1])) out.push(w(points[i]), w(points[i + 1]));
      return out.length ? [out] : [];
    }
    const out: V3[][] = [];
    let cur: V3[] = [];
    for (const p of points) {
      if (inside(domain, p)) cur.push(w(p));
      else {
        if (cur.length > 1) out.push(cur);
        cur = [];
      }
    }
    if (cur.length > 1) out.push(cur);
    return out;
  }, [points, segments, domain, w]);
  return (
    <>
      {runs.map((r, i) => (
        <Line
          key={i}
          points={r}
          segments={segments}
          color={col(color)}
          lineWidth={width}
          dashed={dashed}
          dashSize={0.05}
          gapSize={0.035}
          transparent={opacity < 1}
          opacity={opacity}
        />
      ))}
    </>
  );
}

/** Spheres at data points (outside the box: hidden), with an optional hover tip. */
export function Points3D({
  points,
  color = '--c-data',
  size = 0.035,
  tooltip,
}: {
  points: V3[];
  color?: string;
  /** radius in cube units (the box is 2 wide) */
  size?: number;
  tooltip?: (i: number) => ReactNode;
}) {
  const { domain, w, col, setTip } = useScene();
  const ref = useRef<THREE.InstancedMesh>(null);
  const [hover, setHover] = useState<number | null>(null);
  const shown = useMemo(() => points.map((p, i) => [p, i] as const).filter(([p]) => inside(domain, p)), [points, domain]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    shown.forEach(([p], k) => {
      o.position.set(...w(p));
      o.scale.setScalar(shown[k][1] === hover ? 1.5 : 1);
      o.updateMatrix();
      m.setMatrixAt(k, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [shown, w, hover]);
  return (
    <group>
      <instancedMesh
        key={shown.length}
        ref={ref}
        args={[undefined, undefined, shown.length]}
        onPointerMove={
          tooltip
            ? (e) => {
                e.stopPropagation();
                if (e.instanceId === undefined) return;
                const i = shown[e.instanceId][1];
                setHover(i);
                setTip({ at: w(points[i]), content: tooltip(i) });
              }
            : undefined
        }
        onPointerOut={
          tooltip
            ? () => {
                setHover(null);
                setTip(null);
              }
            : undefined
        }
      >
        <sphereGeometry args={[size, 16, 12]} />
        <meshStandardMaterial color={col(color)} roughness={0.5} />
      </instancedMesh>
    </group>
  );
}

/** A flat polygon through data points (e.g. a patch of a plane), cut off at the faces of the box. */
export function Patch3D({ corners, color = '--c-fit', opacity = 0.35, edges = true }: { corners: V3[]; color?: string; opacity?: number; edges?: boolean }) {
  const { w, col, clip } = useScene();
  const { geom, outline } = useMemo(() => {
    const pts = corners.map(w);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3));
    geom.setIndex(pts.slice(1, -1).flatMap((_, i) => [0, i + 1, i + 2]));
    geom.computeVertexNormals();
    const outline = segmentsGeometry(pts.flatMap((p, i) => [p, pts[(i + 1) % pts.length]]));
    return { geom, outline };
  }, [corners, w]);
  return (
    <group>
      <mesh geometry={geom}>
        <meshBasicMaterial color={col(color)} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} clippingPlanes={clip} />
      </mesh>
      {edges && (
        <lineSegments geometry={outline}>
          <lineBasicMaterial color={col(color)} transparent opacity={0.7} clippingPlanes={clip} />
        </lineSegments>
      )}
    </group>
  );
}

const UP = new THREE.Vector3(0, 1, 0);

/** An arrow between two data points: a line and a cone at `to`. Hidden if either end is outside the box. */
export function Arrow3D({
  from,
  to,
  color = '--ink-soft',
  width = 2.5,
  dashed = false,
  head = 0.09,
}: {
  from: V3;
  to: V3;
  color?: string;
  width?: number;
  dashed?: boolean;
  /** cone length in cube units */
  head?: number;
}) {
  const { domain, w, col } = useScene();
  const g = useMemo(() => {
    if (!inside(domain, from) || !inside(domain, to)) return null;
    const a = new THREE.Vector3(...w(from));
    const b = new THREE.Vector3(...w(to));
    const len = a.distanceTo(b);
    if (len < 1e-6) return null;
    const dir = b.clone().sub(a).divideScalar(len);
    const h = Math.min(head, len * 0.5);
    const base = b.clone().addScaledVector(dir, -h);
    return {
      shaft: [a.toArray(), base.toArray()] as V3[],
      pos: b.clone().addScaledVector(dir, -h / 2).toArray() as V3,
      quat: new THREE.Quaternion().setFromUnitVectors(UP, dir),
      h,
    };
  }, [from, to, head, domain, w]);
  if (!g) return null;
  const c = col(color);
  return (
    <group>
      <Line points={g.shaft} color={c} lineWidth={width} dashed={dashed} dashSize={0.05} gapSize={0.035} />
      <mesh position={g.pos} quaternion={g.quat}>
        <coneGeometry args={[g.h * 0.38, g.h, 18]} />
        <meshBasicMaterial color={c} />
      </mesh>
    </group>
  );
}
