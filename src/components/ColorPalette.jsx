import React, { useState, useEffect, useRef } from 'react';

const COLORS = [
  { name: 'polar-white', value: '#ffffff', label: 'Polar White' },
  { name: 'royal-silver', value: '#cbd5e1', label: 'Royal Silver' },
  { name: 'anthracite-gray', value: '#475569', label: 'Anthracite Gray' },
  { name: 'meteor-black', value: '#1e293b', label: 'Meteor Black' },
  { name: 'texture-black', value: '#0f172a', label: 'Texture Black' },
  { name: 'pure-gold', value: '#c59158', label: 'Pure Gold' },
  { name: 'antique-copper', value: '#b45309', label: 'Antique Copper' },
  { name: 'antique-bronze', value: '#78350f', label: 'Antique Bronze' },
  { name: 'red-cherry', value: '#dc2626', label: 'Red Cherry' },
  { name: 'green-leaf', value: '#16a34a', label: 'Green Leaf' }
];

const TEXTURE_IMAGES = {
  'polar-white': '/images/polar-white.C_BHS7yz.webp',
  'royal-silver': '/images/royal-silver.DCV-2Hhk.webp',
  'anthracite-gray': '/images/anthracite-gray.C5T6qsn_.webp',
  'meteor-black': '/images/meteor-black.gUXuWB01.webp',
  'texture-black': '/images/texture-black.Cm2809Or.webp',
  'pure-gold': '/images/pure-gold.Be-uofrm.webp',
  'antique-copper': '/images/antique-copper.rqO417XN.webp',
  'antique-bronze': '/images/antique-bronze.4-jEtX_3.webp',
  'red-cherry': '/images/red-cherry.Dfq_s_0J.webp',
  'green-leaf': '/images/green-leaf.DRw9hQSI.webp'
};

function ColorPalette({
  selectedColor,
  setSelectedColor,
  applyFrameColor,
  applyFullColor,
  showFeedback,
  applyWallColor,
  wallColor
}) {
  const [activeTab, setActiveTab] = useState('textures');
  const [activeColor, setActiveColor] = useState('royal-silver');
  
  // Color picker state
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [alpha, setAlpha] = useState(1);
  const [hexColor, setHexColor] = useState('#808080');
  const [rgbColor, setRgbColor] = useState({ r: 128, g: 128, b: 128 });
  
  const gradientRef = useRef(null);
  const hueRef = useRef(null);
  const alphaRef = useRef(null);

  const handleColorClick = (colorName) => {
    setSelectedColor(colorName);
    setActiveColor(colorName);
  };

  const handleFrameClick = (colorName) => {
    applyFrameColor(colorName);
  };

  const handleAllClick = (colorName) => {
    applyFullColor(colorName);
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b };
  };

  // Convert RGB to Hex
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Convert Hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
        default: h = 0;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Update color from HSL
  const updateColorFromHsl = (h, s, l, a = alpha) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setRgbColor(rgb);
    setHexColor(hex);
    setHue(h);
    setSaturation(s);
    setBrightness(l);
    setAlpha(a);
    
    // Apply to wall
    const rgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    applyWallColor(rgbaColor);
  };

  // Update color from Hex
  const updateColorFromHex = (hex) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setRgbColor(rgb);
      setHexColor(hex);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setBrightness(hsl.l);
      
      const rgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
      applyWallColor(rgbaColor);
    }
  };

  // Update color from RGB
  const updateColorFromRgb = (r, g, b, a = alpha) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    setRgbColor({ r, g, b });
    setHexColor(hex);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setBrightness(hsl.l);
    setAlpha(a);
    
    const rgbaColor = `rgba(${r}, ${g}, ${b}, ${a})`;
    applyWallColor(rgbaColor);
  };

  // Handle gradient picker
  const handleGradientClick = (e) => {
    if (!gradientRef.current) return;
    const rect = gradientRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    setSaturation(Math.round(x * 100));
    setBrightness(Math.round((1 - y) * 100));
    updateColorFromHsl(hue, x * 100, (1 - y) * 100, alpha);
  };

  // Handle hue slider
  const handleHueClick = (e) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
    setHue(Math.round(h));
    updateColorFromHsl(h, saturation, brightness, alpha);
  };

  // Handle alpha slider
  const handleAlphaClick = (e) => {
    if (!alphaRef.current) return;
    const rect = alphaRef.current.getBoundingClientRect();
    const a = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setAlpha(a);
    const rgb = hslToRgb(hue, saturation, brightness);
    updateColorFromRgb(rgb.r, rgb.g, rgb.b, a);
  };

  // Predefined color swatches
  const colorSwatches = [
    ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff', '#ff0000', '#ff6600'],
    ['#ffcc00', '#ffff00', '#ccff00', '#00ff00', '#00ffcc', '#00ffff', '#0066ff', '#0000ff'],
    ['#6600ff', '#cc00ff', '#ff00cc', '#ff0066', '#800000', '#808000', '#008000', '#008080'],
    ['#000080', '#800080', '#808080', '#c0c0c0', '#ff8080', '#ffcc80', '#ffff80', '#ccff80'],
    ['#80ff80', '#80ffcc', '#80ffff', '#80ccff', '#8080ff', '#cc80ff', '#ff80ff', '#ff80cc'],
    ['#ffcccc', '#ffe6cc', '#ffffcc', '#e6ffcc', '#ccffcc', '#ccffe6', '#ccffff', '#cce6ff']
  ];

  // Initialize from wallColor if it exists (only on mount)
  useEffect(() => {
    if (wallColor) {
      if (wallColor.startsWith('rgba') || wallColor.startsWith('rgb')) {
        const match = wallColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
          const r = parseInt(match[1]);
          const g = parseInt(match[2]);
          const b = parseInt(match[3]);
          const a = match[4] ? parseFloat(match[4]) : 1;
          const hsl = rgbToHsl(r, g, b);
          setHue(hsl.h);
          setSaturation(hsl.s);
          setBrightness(hsl.l);
          setAlpha(a);
          setRgbColor({ r, g, b });
          setHexColor(rgbToHex(r, g, b));
        }
      } else if (wallColor.startsWith('#')) {
        const rgb = hexToRgb(wallColor);
        if (rgb) {
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          setHue(hsl.h);
          setSaturation(hsl.s);
          setBrightness(hsl.l);
          setAlpha(1);
          setRgbColor(rgb);
          setHexColor(wallColor);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount


  return (
    <div className="h-full color-palette-container" style={{  }}>
      <div className="relative x-tab-group">
        <div className="flex relative overflow-hidden max-w-full max-h-full">
          <div className="relative overflow-auto w-full">
            <div className="relative flex min-w-full w-fit border-b border-secondary-200 dark:border-secondary-700">
              <button
                type="button"
                className={`x-tab color-tab ${activeTab === 'textures' ? 'active' : ''}`}
                onClick={() => setActiveTab('textures')}
              >
                <div className="font-medium">Textures</div>
              </button>
              <button
                type="button"
                className={`x-tab color-tab ${activeTab === 'wall' ? 'active' : ''}`}
                onClick={() => setActiveTab('wall')}
              >
                <div className="font-medium">Wall Color</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'textures' && (
        <div role="tabpanel" className="py-2" style={{ overflowX: 'visible' }}>
          <div className="flex flex-col gap-2 color-palette-list">
            {COLORS.map(color => (
              <div
                key={color.name}
                className={`pattern-select relative ${activeColor === color.name ? 'active' : ''}`}
                data-color={color.name}
              >
                <button
                  type="button"
                  className={`btn pattern h-9 ${color.name} color-btn ${activeColor === color.name ? 'selected' : ''}`}
                  style={{ 
                    backgroundColor: color.value,
                    backgroundImage: TEXTURE_IMAGES[color.name] ? `url(${TEXTURE_IMAGES[color.name]})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onClick={() => handleColorClick(color.name)}
                  title={color.label}
                  data-color-name={color.name}
                >
                  <span className="color-label">{color.label}</span>
                </button>
                {activeColor === color.name && (
                  <div className="color-actions animate-slide-in">
                    <button
                      type="button"
                      className="frame-color-btn"
                      onClick={() => handleFrameClick(color.name)}
                      data-place="frame"
                      data-color={color.name}
                    >
                      <span>FRAME</span>
                    </button>
                    <button
                      type="button"
                      className="all-color-btn"
                      onClick={() => handleAllClick(color.name)}
                      data-place="full"
                      data-color={color.name}
                    >
                      <span>ALL</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wall' && (
        <div role="tabpanel" className="py-2">
          <div className="flex flex-col gap-2" style={{ maxHeight: 'calc(85vh - 200px)', overflowY: 'auto', overflowX: 'visible' }}>
            {/* Gradient Color Picker */}
            <div className="flex flex-col gap-1">
              <div
                ref={gradientRef}
                style={{
                  width: '100%',
                  height: '120px',
                  background: `linear-gradient(to bottom, 
                    hsl(${hue}, 100%, 100%) 0%,
                    hsl(${hue}, 100%, 50%) 50%,
                    hsl(${hue}, 0%, 0%) 100%
                  ), linear-gradient(to right, 
                    transparent 0%,
                    hsl(${hue}, 100%, 50%) 100%
                  )`,
                  backgroundBlendMode: 'multiply',
                  position: 'relative',
                  cursor: 'crosshair',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 0, 0, 0.12)'
                }}
                onClick={handleGradientClick}
                onMouseMove={(e) => {
                  if (e.buttons === 1) handleGradientClick(e);
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${saturation}%`,
                    top: `${100 - brightness}%`,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Hue Slider */}
              <div className="flex flex-col gap-0.5">
                <label className="text-xs font-medium" style={{ fontSize: '10px' }}>Hue</label>
                <div
                  ref={hueRef}
                  style={{
                    width: '100%',
                    height: '16px',
                    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                    borderRadius: '4px',
                    position: 'relative',
                    cursor: 'pointer',
                    border: '1px solid rgba(0, 0, 0, 0.12)'
                  }}
                  onClick={handleHueClick}
                  onMouseMove={(e) => {
                    if (e.buttons === 1) handleHueClick(e);
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(hue / 360) * 100}%`,
                      top: '50%',
                      width: '3px',
                      height: '100%',
                      background: 'white',
                      border: '1px solid rgba(0,0,0,0.3)',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium">Opacity</label>
                <div
                  ref={alphaRef}
                  style={{
                    width: '100%',
                    height: '20px',
                    background: `linear-gradient(to right, 
                      rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0) 0%,
                      rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 1) 100%
                    )`,
                    backgroundImage: 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 10px 10px',
                    borderRadius: '4px',
                    position: 'relative',
                    cursor: 'pointer',
                    border: '1px solid rgba(0, 0, 0, 0.12)'
                  }}
                  onClick={handleAlphaClick}
                  onMouseMove={(e) => {
                    if (e.buttons === 1) handleAlphaClick(e);
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: `${alpha * 100}%`,
                      top: '50%',
                      width: '3px',
                      height: '100%',
                      background: 'white',
                      border: '1px solid rgba(0,0,0,0.3)',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Current Color Preview */}
              <div className="flex items-center gap-1.5">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${alpha})`,
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                />
                <div className="flex-1" style={{ fontSize: '10px' }}>
                  <div className="font-medium">Current Color</div>
                  <div className="text-secondary-600" style={{ fontSize: '9px', wordBreak: 'break-all' }}>{`rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${alpha})`}</div>
                </div>
              </div>

              {/* Color Value Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs font-medium" style={{ fontSize: '10px' }}>Hex</label>
                  <input
                    type="text"
                    value={hexColor.toUpperCase()}
                    onChange={(e) => {
                      const hex = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(hex) && hex.length === 7) {
                        updateColorFromHex(hex);
                      } else {
                        setHexColor(hex);
                      }
                    }}
                    className="px-1.5 py-0.5 text-xs border rounded"
                    style={{ fontFamily: 'monospace', fontSize: '10px', padding: '4px 6px' }}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs font-medium" style={{ fontSize: '10px' }}>R</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbColor.r}
                    onChange={(e) => {
                      const r = parseInt(e.target.value) || 0;
                      updateColorFromRgb(r, rgbColor.g, rgbColor.b, alpha);
                    }}
                    className="px-1.5 py-0.5 text-xs border rounded"
                    style={{ fontSize: '10px', padding: '4px 6px' }}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs font-medium" style={{ fontSize: '10px' }}>G</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbColor.g}
                    onChange={(e) => {
                      const g = parseInt(e.target.value) || 0;
                      updateColorFromRgb(rgbColor.r, g, rgbColor.b, alpha);
                    }}
                    className="px-1.5 py-0.5 text-xs border rounded"
                    style={{ fontSize: '10px', padding: '4px 6px' }}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs font-medium" style={{ fontSize: '10px' }}>B</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbColor.b}
                    onChange={(e) => {
                      const b = parseInt(e.target.value) || 0;
                      updateColorFromRgb(rgbColor.r, rgbColor.g, b, alpha);
                    }}
                    className="px-1.5 py-0.5 text-xs border rounded"
                    style={{ fontSize: '10px', padding: '4px 6px' }}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs font-medium" style={{ fontSize: '10px' }}>A</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={alpha}
                    onChange={(e) => {
                      const a = parseFloat(e.target.value) || 0;
                      setAlpha(a);
                      updateColorFromRgb(rgbColor.r, rgbColor.g, rgbColor.b, a);
                    }}
                    className="px-1.5 py-0.5 text-xs border rounded"
                    style={{ fontSize: '10px', padding: '4px 6px' }}
                  />
                </div>
              </div>

              {/* Color Swatches */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium">Color Swatches</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                  {colorSwatches.flat().map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => updateColorFromHex(color)}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: color,
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPalette;

