import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Interactive 3D constellation. Nodes fire in sequence like a pipeline
// executing. Drag to orbit with real inertia: grab is 1:1, release flings,
// spin decays back to a slow idle drift. Hovering a node lights it up.
// Pauses rendering entirely when the hero is off-screen or the tab is hidden.
// Falls back to a static frame when prefers-reduced-motion is set.
export default function NeuralScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // --- nodes on a fibonacci sphere, slightly jittered
    const NODE_COUNT = 42;
    const nodes = [];
    const nodeGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const baseMat = () => new THREE.MeshBasicMaterial({ color: 0x5c6a94, transparent: true, opacity: 0.85 });

    for (let i = 0; i < NODE_COUNT; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.6 + (Math.sin(i * 7.3) * 0.25);
      const pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.82,
        r * Math.sin(phi) * Math.sin(theta)
      );
      const mesh = new THREE.Mesh(nodeGeo, baseMat());
      mesh.position.copy(pos);
      group.add(mesh);
      nodes.push(mesh);
    }

    // --- connect each node to its 2 nearest neighbours
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7c8cff, transparent: true, opacity: 0.14 });
    const edges = [];
    nodes.forEach((a, i) => {
      const dists = nodes
        .map((b, j) => ({ j, d: a.position.distanceTo(b.position) }))
        .filter((x) => x.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);
      dists.forEach(({ j }) => {
        if (j > i) {
          const geo = new THREE.BufferGeometry().setFromPoints([a.position, nodes[j].position]);
          const line = new THREE.Line(geo, lineMat);
          group.add(line);
          edges.push({ line, a: i, b: j });
        }
      });
    });

    // --- preallocated (never allocate inside the frame loop — GC hitches)
    const peri = new THREE.Color(0x7c8cff);
    const cyan = new THREE.Color(0x4fd1e0);
    const dim = new THREE.Color(0x5c6a94);
    const SCALE_ONE = new THREE.Vector3(1, 1, 1);
    const ndc = new THREE.Vector2(2, 2); // off-screen until first hover
    const raycaster = new THREE.Raycaster();

    let pulseIndex = 0;
    let pulseTimer = 0;
    let hovered = -1;

    // --- orbit state: 1:1 grab, fling on release, decay to idle drift
    const IDLE_SPIN = 0.12;      // rad/s baseline drift
    const MAX_FLING = 3.2;       // rad/s cap on release velocity
    let spinVel = IDLE_SPIN;     // current y-velocity (rad/s)
    let tiltTarget = 0.18;       // desired x-rotation
    group.rotation.x = tiltTarget;
    let dragging = false;
    let prevX = 0, prevY = 0;
    let lastMoveT = 0;
    let lastMoveVel = IDLE_SPIN;

    const DRAG_SENS = 0.005;     // rad per px

    const onDown = (e) => {
      dragging = true;
      prevX = e.clientX; prevY = e.clientY;
      lastMoveT = performance.now();
      lastMoveVel = 0;
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };

    const onMove = (e) => {
      // hover raycast coords (also while not dragging)
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;

      // 1:1 grab — the sphere follows the pointer directly
      group.rotation.y += dx * DRAG_SENS;
      tiltTarget = Math.max(-0.9, Math.min(0.9, tiltTarget + dy * 0.004));

      // track instantaneous velocity for the fling
      const dtm = Math.max(8, now - lastMoveT) / 1000;
      lastMoveVel = (dx * DRAG_SENS) / dtm;
      lastMoveT = now;
      prevX = e.clientX; prevY = e.clientY;
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      // fling: inherit release velocity, capped; it decays back to idle in tick()
      spinVel = Math.max(-MAX_FLING, Math.min(MAX_FLING, lastMoveVel));
    };

    const onLeave = () => { ndc.set(2, 2); };

    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    let running = false;

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05); // clamp: tab-switch spikes

      // --- rotation physics (frame-rate independent)
      if (!dragging) {
        // exponential decay of fling velocity back toward idle drift
        spinVel += (IDLE_SPIN - spinVel) * (1 - Math.exp(-1.4 * dt));
        group.rotation.y += spinVel * dt;
      }
      // tilt eases toward target with the same dt-based damping
      group.rotation.x += (tiltTarget - group.rotation.x) * (1 - Math.exp(-8 * dt));

      // --- hover raycast (42 spheres — cheap)
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(nodes, false);
      hovered = hit.length ? nodes.indexOf(hit[0].object) : -1;
      renderer.domElement.style.cursor = dragging ? 'grabbing' : hovered >= 0 ? 'pointer' : 'grab';

      // --- sequential firing
      pulseTimer += dt;
      if (pulseTimer > 0.22) {
        pulseTimer = 0;
        pulseIndex = (pulseIndex + 1) % NODE_COUNT;
      }

      const ease = 1 - Math.exp(-10 * dt);
      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i];
        const distFromPulse = (i - pulseIndex + NODE_COUNT) % NODE_COUNT;
        if (i === hovered) {
          n.material.color.copy(cyan);
          n.scale.setScalar(2.5);
        } else if (distFromPulse === 0) {
          n.material.color.copy(cyan);
          n.scale.setScalar(2.1);
        } else if (distFromPulse === 1 || distFromPulse === 2) {
          n.material.color.copy(peri);
          n.scale.setScalar(1.45);
        } else {
          n.material.color.lerp(dim, ease);
          n.scale.lerp(SCALE_ONE, ease);
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || prefersReduced) return;
      running = true;
      clock.getDelta(); // swallow the pause gap so dt doesn't spike
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Pause when the hero scrolls out of view — no reason to burn the main
    // thread rendering a sphere nobody can see (it was contributing to
    // scroll jank further down the page).
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.01 }
    );
    io.observe(mount);

    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVis);

    if (prefersReduced) {
      renderer.render(scene, camera); // single static frame
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      nodes.forEach((n) => { n.geometry.dispose(); n.material.dispose(); });
      edges.forEach(({ line }) => { line.geometry.dispose(); });
      lineMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="neural-scene" ref={mountRef} aria-hidden="true" />;
}
