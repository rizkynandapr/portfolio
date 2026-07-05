import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Interactive 3D constellation. Nodes fire in sequence like a pipeline
// executing; user can drag to orbit. Falls back to a static frame when
// prefers-reduced-motion is set.
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

    // --- pipeline pulse: nodes fire in sequence
    const peri = new THREE.Color(0x7c8cff);
    const cyan = new THREE.Color(0x4fd1e0);
    const dim = new THREE.Color(0x5c6a94);
    let pulseIndex = 0;
    let pulseTimer = 0;

    // --- drag to orbit
    let dragging = false;
    let prevX = 0, prevY = 0;
    let velX = 0.0022, velY = 0;
    let rotX = 0.18;

    const onDown = (e) => { dragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onMove = (e) => {
      if (!dragging) return;
      velX = (e.clientX - prevX) * 0.00035 + 0.0008;
      rotX += (e.clientY - prevY) * 0.003;
      rotX = Math.max(-0.9, Math.min(0.9, rotX));
      prevX = e.clientX; prevY = e.clientY;
    };
    const onUp = () => { dragging = false; };

    renderer.domElement.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

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
    let raf;

    const tick = () => {
      const dt = clock.getDelta();

      group.rotation.y += dragging ? velX * 8 * dt * 60 * 0.016 : velX;
      group.rotation.x += (rotX - group.rotation.x) * 0.06;

      // sequential firing
      pulseTimer += dt;
      if (pulseTimer > 0.22) {
        pulseTimer = 0;
        pulseIndex = (pulseIndex + 1) % NODE_COUNT;
      }

      nodes.forEach((n, i) => {
        const distFromPulse = (i - pulseIndex + NODE_COUNT) % NODE_COUNT;
        if (distFromPulse === 0) {
          n.material.color.copy(cyan);
          n.scale.setScalar(2.1);
        } else if (distFromPulse === 1 || distFromPulse === 2) {
          n.material.color.copy(peri);
          n.scale.setScalar(1.45);
        } else {
          n.material.color.lerp(dim, 0.08);
          n.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    if (prefersReduced) {
      // single static frame
      renderer.render(scene, camera);
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      nodes.forEach((n) => { n.geometry.dispose(); n.material.dispose(); });
      edges.forEach(({ line }) => { line.geometry.dispose(); });
      lineMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="neural-scene" ref={mountRef} aria-hidden="true" />;
}
