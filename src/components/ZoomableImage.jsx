import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_ZOOM = 2.8;
const INITIAL_ZOOM = 2.8;

const ZoomableImage = ({ src, alt = "Product", onDragStart, onDragEnd }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const didDragRef = useRef(false);

  const getBoundaries = useCallback(() => {
    if (!containerRef.current ||!imgRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const container = containerRef.current.getBoundingClientRect();
    const img = imgRef.current.getBoundingClientRect();
    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;
    const maxX = Math.max(0, (scaledWidth - container.width) / 2);
    const maxY = Math.max(0, (scaledHeight - container.height) / 2);
    return { minX: -maxX, maxX: maxX, minY: -maxY, maxY: maxY };
  }, [zoom]);

  const clampPan = useCallback((x, y) => {
    const { minX, maxX, minY, maxY } = getBoundaries();
    return { x: Math.min(Math.max(x, minX), maxX), y: Math.min(Math.max(y, minY), maxY) };
  }, [getBoundaries]);

  const handlePointerDown = (e) => {
    if (!containerRef.current || zoom <= 1.01 || e.button!== 0) return;
    e.preventDefault();
    try { containerRef.current.setPointerCapture(e.pointerId) } catch {}
    isMouseDownRef.current = true;
    didDragRef.current = false;
    setIsDragging(true);
    onDragStart?.();
    startPosRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e) => {
    if (!isMouseDownRef.current) return;
    didDragRef.current = true;
    e.preventDefault();
    const newX = e.clientX - startPosRef.current.x;
    const newY = e.clientY - startPosRef.current.y;
    setPan(clampPan(newX, newY));
  };

  const handlePointerUp = (e) => {
    if (!containerRef.current || e.button!== 0) return;
    isMouseDownRef.current = false;
    setIsDragging(false);
    onDragEnd?.();
    try { containerRef.current.releasePointerCapture(e.pointerId) } catch {}
    setTimeout(() => { didDragRef.current = false }, 0);
  };

  useEffect(() => {
    if (zoom <= 1.01) {
      setPan({ x: 0, y: 0 });
      isMouseDownRef.current = false;
      setIsDragging(false);
      didDragRef.current = false;
    }
  }, [zoom]);

  const handleClick = (e) => {
    if (didDragRef.current) return;
    e.stopPropagation();

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    if (zoom <= 1.01) {
      const newZoom = INITIAL_ZOOM;
      const newPanX = -mouseX * (newZoom - 1);
      const newPanY = -mouseY * (newZoom - 1);
      setZoom(newZoom);
      setPan(clampPan(newPanX, newPanY));
    } else {
      const zoomRatio = 1 / zoom;
      setPan(prevPan => clampPan(prevPan.x * zoomRatio, prevPan.y * zoomRatio));
      setZoom(1);
    }
  };

  // <-- MANUAL WHEEL LISTENER WITH PASSIVE: FALSE
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;
      const delta = e.deltaY > 0? -0.15 : 0.15;

      setZoom(prevZoom => {
        const newZoom = Math.min(Math.max(prevZoom + delta, 1), MAX_ZOOM);
        const zoomRatio = newZoom / prevZoom;
        setPan(prevPan => {
          const newPanX = (prevPan.x - mouseX) * zoomRatio + mouseX;
          const newPanY = (prevPan.y - mouseY) * zoomRatio + mouseY;
          return clampPan(newPanX, newPanY);
        });
        return newZoom;
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false }); // <-- KEY
    return () => el.removeEventListener('wheel', handleWheel);
  }, [zoom, clampPan]);

  const handleContextMenu = (e) => e.preventDefault();

  const getCursor = () => {
    if (zoom <= 1.01) return 'cursor-zoom-in';
    if (isDragging) return 'cursor-grabbing';
    return 'cursor-zoom-out';
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center p-4 select-none overflow-hidden relative group touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      // onWheel REMOVED - we handle it manually now
      onContextMenu={handleContextMenu}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`max-w-full max-h-full object-contain pointer-events-none ${getCursor()}`}
        style={{
          transformOrigin: `center center`,
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transition: isDragging? 'none' : 'transform 150ms cubic-bezier(0.2,0,0.2,1)',
          willChange: 'transform',
          touchAction: 'none'
        }}
        draggable={false}
      />

      <div className="absolute bottom-6 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        {zoom <= 1.01? 'Click to zoom + | Scroll' : 'Click to zoom - | Scroll | Drag to pan'}
      </div>

      {zoom > 1 && (
        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {zoom.toFixed(1)}x
        </div>
      )}
    </div>
  );
};

export default ZoomableImage;