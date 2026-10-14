import {
  lazy,
  Suspense,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  motion,
  useReducedMotion,
} from 'motion/react';

const Ambient3D =
  lazy(() =>
    import('./Ambient3D').then(
      (module) => ({
        default:
          module.Ambient3D,
      }),
    ),
  );

type ExtendedNavigator =
  Navigator & {
    deviceMemory?: number;
  };

function canUsePremium3D() {
  if (
    typeof window === 'undefined'
  ) {
    return false;
  }

  if (
    window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
  ) {
    return false;
  }

  if (
    window.innerWidth < 900
  ) {
    return false;
  }

  if (
    /Android|iPhone|iPad|Mobile/i.test(
      navigator.userAgent,
    )
  ) {
    return false;
  }

  const nav =
    navigator as ExtendedNavigator;

  if (
    typeof nav.deviceMemory ===
      'number' &&
    nav.deviceMemory < 4
  ) {
    return false;
  }

  if (
    typeof navigator.hardwareConcurrency ===
      'number' &&
    navigator.hardwareConcurrency < 4
  ) {
    return false;
  }

  return (
    'WebGLRenderingContext'
    in window
  );
}

export function ProfessionalShell({
  children,
}: PropsWithChildren) {

  const reducedMotion =
    useReducedMotion();

  const [
    enable3D,
    setEnable3D,
  ] = useState(false);


  useEffect(() => {
    setEnable3D(
      canUsePremium3D(),
    );
  }, []);


  return (
    <div className="pv2-shell">

      {enable3D && (
        <Suspense fallback={null}>
          <Ambient3D />
        </Suspense>
      )}

      <div
        className="pv2-vignette"
        aria-hidden="true"
      />

      <div
        className="pv2-grid"
        aria-hidden="true"
      />

      {!reducedMotion && (
        <>
          <motion.div
            className="pv2-orb pv2-orb-red"
            aria-hidden="true"
            animate={{
              x: [0, 55, 0],
              y: [0, -32, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="pv2-orb pv2-orb-purple"
            aria-hidden="true"
            animate={{
              x: [0, -42, 0],
              y: [0, 38, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      <motion.div
        className="pv2-content"
        initial={false}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration:
            reducedMotion
              ? 0
              : 0.5,
          ease: 'easeOut',
        }}
      >
        {children}
      </motion.div>

    </div>
  );
}
