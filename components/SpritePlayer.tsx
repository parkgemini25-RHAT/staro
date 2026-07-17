import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type Key,
} from 'react';

interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface AnimationRow {
  frames: number;
  fps: number;
  loop: boolean;
}

interface SpriteManifest {
  game_input: string;
  animation: {
    rows: Record<string, AnimationRow>;
  };
  frame_layout: {
    sheetWidth: number;
    sheetHeight: number;
    rows: Record<string, FrameRect[]>;
  };
}

interface SpritePlayerProps {
  manifestUrl: string;
  state: string;
  width: number;
  height: number;
  className?: string;
  playKey?: Key;
  label?: string;
  decorative?: boolean;
}

interface LoadedSprite {
  manifestUrl: string;
  manifest: SpriteManifest;
  atlasUrl: string;
}

interface FrameState {
  animationKey: string;
  index: number;
}

const manifestCache = new Map<string, Promise<LoadedSprite>>();

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
);

const assertPositiveNumber = (value: unknown, path: string): number => {
  if (!isFiniteNumber(value) || value <= 0) {
    throw new Error(`Invalid sprite manifest: ${path} must be a positive number.`);
  }
  return value;
};

const parseFrame = (
  value: unknown,
  path: string,
  sheetWidth: number,
  sheetHeight: number,
): FrameRect => {
  if (!isRecord(value)) {
    throw new Error(`Invalid sprite manifest: ${path} must be an object.`);
  }

  const x = value.x;
  const y = value.y;
  const w = assertPositiveNumber(value.w, `${path}.w`);
  const h = assertPositiveNumber(value.h, `${path}.h`);

  if (!isFiniteNumber(x) || x < 0 || !isFiniteNumber(y) || y < 0) {
    throw new Error(`Invalid sprite manifest: ${path} has an invalid origin.`);
  }
  if (x + w > sheetWidth || y + h > sheetHeight) {
    throw new Error(`Invalid sprite manifest: ${path} exceeds the atlas bounds.`);
  }

  return { x, y, w, h };
};

const parseManifest = (value: unknown): SpriteManifest => {
  if (!isRecord(value)) {
    throw new Error('Invalid sprite manifest: root must be an object.');
  }

  const gameInput = value.game_input;
  const animation = value.animation;
  const frameLayout = value.frame_layout;
  if (typeof gameInput !== 'string' || gameInput.trim() === '') {
    throw new Error('Invalid sprite manifest: game_input is required.');
  }
  if (!isRecord(animation) || !isRecord(animation.rows)) {
    throw new Error('Invalid sprite manifest: animation.rows is required.');
  }
  if (!isRecord(frameLayout) || !isRecord(frameLayout.rows)) {
    throw new Error('Invalid sprite manifest: frame_layout.rows is required.');
  }

  const sheetWidth = assertPositiveNumber(
    frameLayout.sheetWidth,
    'frame_layout.sheetWidth',
  );
  const sheetHeight = assertPositiveNumber(
    frameLayout.sheetHeight,
    'frame_layout.sheetHeight',
  );
  const rows: Record<string, FrameRect[]> = {};
  const animationRows: Record<string, AnimationRow> = {};

  for (const [stateName, rawAnimationRow] of Object.entries(animation.rows)) {
    if (!isRecord(rawAnimationRow)) {
      throw new Error(`Invalid sprite manifest: animation.rows.${stateName} must be an object.`);
    }

    const rawFrames = frameLayout.rows[stateName];
    if (!Array.isArray(rawFrames) || rawFrames.length === 0) {
      throw new Error(`Invalid sprite manifest: frame_layout.rows.${stateName} is empty.`);
    }

    const declaredFrameCount = rawAnimationRow.frames;
    const fps = rawAnimationRow.fps;
    const loop = rawAnimationRow.loop;
    if (
      !Number.isInteger(declaredFrameCount)
      || (declaredFrameCount as number) <= 0
      || declaredFrameCount !== rawFrames.length
    ) {
      throw new Error(`Invalid sprite manifest: ${stateName} frame counts do not match.`);
    }
    if (!isFiniteNumber(fps) || fps <= 0 || typeof loop !== 'boolean') {
      throw new Error(`Invalid sprite manifest: ${stateName} animation metadata is invalid.`);
    }

    rows[stateName] = rawFrames.map((frame, index) => (
      parseFrame(
        frame,
        `frame_layout.rows.${stateName}[${index}]`,
        sheetWidth,
        sheetHeight,
      )
    ));
    animationRows[stateName] = {
      frames: declaredFrameCount as number,
      fps,
      loop,
    };
  }

  return {
    game_input: gameInput,
    animation: { rows: animationRows },
    frame_layout: {
      sheetWidth,
      sheetHeight,
      rows,
    },
  };
};

const loadSprite = (manifestUrl: string): Promise<LoadedSprite> => {
  const cached = manifestCache.get(manifestUrl);
  if (cached) return cached;

  const request = fetch(manifestUrl, { credentials: 'same-origin' })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Unable to load sprite manifest (${response.status}): ${manifestUrl}`);
      }

      const manifest = parseManifest(await response.json());
      return {
        manifestUrl,
        manifest,
        atlasUrl: new URL(manifest.game_input, manifestUrl).href,
      };
    })
    .catch((error: unknown) => {
      // A transient deployment/network failure must be retryable on a future mount.
      manifestCache.delete(manifestUrl);
      throw error;
    });

  manifestCache.set(manifestUrl, request);
  return request;
};

const usePrefersReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
};

const SpritePlayer = ({
  manifestUrl,
  state,
  width,
  height,
  className,
  playKey = 0,
  label,
  decorative = label == null,
}: SpritePlayerProps) => {
  const resolvedManifestUrl = useMemo(() => {
    if (typeof window === 'undefined') return manifestUrl;
    try {
      return new URL(manifestUrl, window.location.href).href;
    } catch {
      return manifestUrl;
    }
  }, [manifestUrl]);
  const [loadedSprite, setLoadedSprite] = useState<LoadedSprite | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [atlasError, setAtlasError] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const animationKey = `${resolvedManifestUrl}\u0000${state}\u0000${String(playKey)}`;
  const [frameState, setFrameState] = useState<FrameState>({
    animationKey,
    index: 0,
  });

  useEffect(() => {
    let isActive = true;
    setLoadedSprite(null);
    setLoadError(false);
    setAtlasError(false);

    loadSprite(resolvedManifestUrl)
      .then((sprite) => {
        if (isActive) setLoadedSprite(sprite);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadError(true);
        console.error(error);
      });

    return () => {
      isActive = false;
    };
  }, [resolvedManifestUrl]);

  const activeSprite = loadedSprite?.manifestUrl === resolvedManifestUrl
    ? loadedSprite
    : null;
  const animationRow = activeSprite?.manifest.animation.rows[state];
  const frames = activeSprite?.manifest.frame_layout.rows[state];

  useEffect(() => {
    if (!animationRow || !frames?.length) return undefined;

    const restingFrame = prefersReducedMotion && !animationRow.loop
      ? frames.length - 1
      : 0;
    setFrameState({ animationKey, index: restingFrame });

    if (prefersReducedMotion || frames.length === 1) return undefined;

    let animationFrameId = 0;
    const startedAt = performance.now();
    const millisecondsPerFrame = 1000 / animationRow.fps;

    const advance = (now: number) => {
      const elapsedFrames = Math.floor((now - startedAt) / millisecondsPerFrame);
      const nextFrame = animationRow.loop
        ? elapsedFrames % frames.length
        : Math.min(elapsedFrames, frames.length - 1);

      setFrameState((current) => (
        current.animationKey === animationKey && current.index === nextFrame
          ? current
          : { animationKey, index: nextFrame }
      ));

      if (animationRow.loop || nextFrame < frames.length - 1) {
        animationFrameId = requestAnimationFrame(advance);
      }
    };

    animationFrameId = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(animationFrameId);
  }, [animationKey, animationRow, frames, prefersReducedMotion]);

  const defaultFrameIndex = prefersReducedMotion && animationRow && !animationRow.loop && frames
    ? frames.length - 1
    : 0;
  const activeFrameIndex = frameState.animationKey === animationKey
    ? frameState.index
    : defaultFrameIndex;
  const frame = frames?.[Math.min(activeFrameIndex, frames.length - 1)];
  const isReady = Boolean(activeSprite && animationRow && frame);
  const status = loadError || atlasError || (activeSprite != null && !isReady)
    ? 'error'
    : isReady
      ? 'ready'
      : 'loading';
  const isDecorative = decorative || !label;
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 0;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 0;

  let atlasStyle: CSSProperties | undefined;
  if (activeSprite && frame) {
    const scaleX = safeWidth / frame.w;
    const scaleY = safeHeight / frame.h;
    atlasStyle = {
      position: 'absolute',
      left: -frame.x * scaleX,
      top: -frame.y * scaleY,
      width: activeSprite.manifest.frame_layout.sheetWidth * scaleX,
      height: activeSprite.manifest.frame_layout.sheetHeight * scaleY,
      maxWidth: 'none',
      userSelect: 'none',
      pointerEvents: 'none',
    };
  }

  return (
    <div
      className={className}
      role={isDecorative ? undefined : 'img'}
      aria-label={isDecorative ? undefined : label}
      aria-hidden={isDecorative ? true : undefined}
      data-sprite-state={state}
      data-sprite-status={status}
      data-sprite-frame={isReady ? activeFrameIndex : undefined}
      style={{
        position: 'relative',
        width: safeWidth,
        height: safeHeight,
        flex: '0 0 auto',
        overflow: 'hidden',
      }}
    >
      {activeSprite && frame && !atlasError && (
        <img
          src={activeSprite.atlasUrl}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={atlasStyle}
          onError={() => setAtlasError(true)}
        />
      )}
    </div>
  );
};

export type { SpritePlayerProps };
export default SpritePlayer;
