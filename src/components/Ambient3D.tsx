import {useEffect, useRef} from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TorusGeometry,
  WebGLRenderer,
} from 'three';

export function Ambient3D() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) return;

    let disposed = false;
    let frame = 0;

    const geometries: BufferGeometry[] = [];
    const materials: Array<
      MeshBasicMaterial | PointsMaterial
    > = [];

    const scene = new Scene();

    const camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );

    camera.position.z = 4.8;

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });

    renderer.setClearColor(
      0x000000,
      0,
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        1.5,
      ),
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight,
      false,
    );

    host.appendChild(
      renderer.domElement,
    );

    const group = new Group();

    group.position.x = 0.8;
    group.position.y = -0.1;

    scene.add(group);


    const starsGeometry =
      new BufferGeometry();

    geometries.push(
      starsGeometry,
    );

    const count = 280;

    const positions =
      new Float32Array(
        count * 3,
      );

    for (
      let index = 0;
      index < count;
      index++
    ) {

      const i =
        index * 3;

      const radius =
        1.25 +
        Math.random() * 1.6;

      const theta =
        Math.random() *
        Math.PI *
        2;

      const phi =
        Math.acos(
          2 * Math.random() - 1,
        );

      positions[i] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

      positions[i + 1] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);

      positions[i + 2] =
        radius *
        Math.cos(phi);
    }

    starsGeometry.setAttribute(
      'position',
      new BufferAttribute(
        positions,
        3,
      ),
    );


    const starsMaterial =
      new PointsMaterial({
        color: 0xef4444,
        size: 0.018,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });

    materials.push(
      starsMaterial,
    );

    const stars =
      new Points(
        starsGeometry,
        starsMaterial,
      );

    group.add(stars);


    const globeGeometry =
      new IcosahedronGeometry(
        1.04,
        2,
      );

    geometries.push(
      globeGeometry,
    );

    const globeMaterial =
      new MeshBasicMaterial({
        color: 0xa855f7,
        wireframe: true,
        transparent: true,
        opacity: 0.09,
        depthWrite: false,
      });

    materials.push(
      globeMaterial,
    );

    const globe =
      new Mesh(
        globeGeometry,
        globeMaterial,
      );

    group.add(globe);


    const ringGeometry =
      new TorusGeometry(
        1.46,
        0.011,
        8,
        180,
      );

    geometries.push(
      ringGeometry,
    );

    const ringMaterial =
      new MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      });

    materials.push(
      ringMaterial,
    );

    const ring =
      new Mesh(
        ringGeometry,
        ringMaterial,
      );

    ring.rotation.x =
      Math.PI * 0.4;

    ring.rotation.y =
      Math.PI * 0.12;

    group.add(ring);


    const ring2Geometry =
      new TorusGeometry(
        1.74,
        0.007,
        8,
        180,
      );

    geometries.push(
      ring2Geometry,
    );

    const ring2Material =
      new MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      });

    materials.push(
      ring2Material,
    );

    const ring2 =
      new Mesh(
        ring2Geometry,
        ring2Material,
      );

    ring2.rotation.x =
      Math.PI * 0.65;

    ring2.rotation.z =
      Math.PI * 0.23;

    group.add(ring2);


    const pointer = {
      x: 0,
      y: 0,
    };


    const onPointerMove =
      (event: PointerEvent) => {

        pointer.x =
          event.clientX /
          window.innerWidth -
          0.5;

        pointer.y =
          event.clientY /
          window.innerHeight -
          0.5;
      };


    const onResize = () => {

      camera.aspect =
        window.innerWidth /
        window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight,
        false,
      );
    };


    window.addEventListener(
      'pointermove',
      onPointerMove,
      {passive: true},
    );

    window.addEventListener(
      'resize',
      onResize,
      {passive: true},
    );


    const started =
      performance.now();


    const animate =
      (time: number) => {

        if (disposed) return;

        const elapsed =
          (time - started) /
          1000;

        group.rotation.y =
          elapsed * 0.045 +
          pointer.x * 0.13;

        group.rotation.x =
          Math.sin(
            elapsed * 0.25,
          ) * 0.04 -
          pointer.y * 0.08;

        globe.rotation.x =
          elapsed * 0.035;

        globe.rotation.y =
          elapsed * 0.06;

        ring.rotation.z =
          elapsed * 0.035;

        ring2.rotation.y =
          elapsed * -0.03;

        stars.rotation.y =
          elapsed * -0.012;

        renderer.render(
          scene,
          camera,
        );

        frame =
          requestAnimationFrame(
            animate,
          );
      };


    frame =
      requestAnimationFrame(
        animate,
      );


    return () => {

      disposed = true;

      cancelAnimationFrame(
        frame,
      );

      window.removeEventListener(
        'pointermove',
        onPointerMove,
      );

      window.removeEventListener(
        'resize',
        onResize,
      );

      geometries.forEach(
        (geometry) =>
          geometry.dispose(),
      );

      materials.forEach(
        (material) =>
          material.dispose(),
      );

      renderer.dispose();

      if (
        renderer.domElement
          .parentElement === host
      ) {

        host.removeChild(
          renderer.domElement,
        );
      }
    };
  }, []);


  return (
    <div
      ref={hostRef}
      className="pv2-ambient3d"
      aria-hidden="true"
    />
  );
}
