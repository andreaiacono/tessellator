import toast from 'react-hot-toast';
import { useTessellatorStore } from '../../store/useTessellatorStore';
import styles from './ControlsPanel.module.scss';

export const ControlsPanel = () => {
  const zoom = useTessellatorStore((state) => state.zoom);
  const thickness = useTessellatorStore((state) => state.thickness);
  const drawGrid = useTessellatorStore((state) => state.drawGrid);
  const drawColors = useTessellatorStore((state) => state.drawColors);
  const color1 = useTessellatorStore((state) => state.color1);
  const color2 = useTessellatorStore((state) => state.color2);

  const updateZoom = useTessellatorStore((state) => state.updateZoom);
  const updateThickness = useTessellatorStore((state) => state.updateThickness);
  const toggleGrid = useTessellatorStore((state) => state.toggleGrid);
  const toggleColors = useTessellatorStore((state) => state.toggleColors);
  const setColor1 = useTessellatorStore((state) => state.setColor1);
  const setColor2 = useTessellatorStore((state) => state.setColor2);
  const resetCanvas = useTessellatorStore((state) => state.resetCanvas);

  const handleReset = () => {
    resetCanvas();
    toast.success('Canvas reset to default');
  };

  return (
    <div className={styles.controlsPanel}>
      <button className={styles.resetButton} onClick={handleReset}>
        Reset
      </button>

      <div className={styles.checkboxGroup}>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={drawGrid} onChange={toggleGrid} />
          <span>Draw Grid</span>
        </label>

        <label className={styles.checkbox}>
          <input type="checkbox" checked={drawColors} onChange={toggleColors} />
          <span>Draw Colors</span>
        </label>
      </div>

      <div className={styles.colorControl}>
        <label>Color 1</label>
        <div className={styles.colorRow}>
          <input
            type="color"
            value={color1}
            onChange={(e) => setColor1(e.target.value)}
            className={styles.colorInput}
          />
          <div className={styles.colorPreview} style={{ backgroundColor: color1 }} />
        </div>
      </div>

      <div className={styles.colorControl}>
        <label>Color 2</label>
        <div className={styles.colorRow}>
          <input
            type="color"
            value={color2}
            onChange={(e) => setColor2(e.target.value)}
            className={styles.colorInput}
          />
          <div className={styles.colorPreview} style={{ backgroundColor: color2 }} />
        </div>
      </div>

      <div className={styles.sliderControl}>
        <label>Line Thickness: {thickness}</label>
        <input
          type="range"
          min="1"
          max="10"
          value={thickness}
          onChange={(e) => updateThickness(Number(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.sliderControl}>
        <label>Zoom: {zoom}</label>
        <input
          type="range"
          min="2"
          max="20"
          value={zoom}
          onChange={(e) => updateZoom(Number(e.target.value))}
          className={styles.slider}
        />
      </div>
    </div>
  );
};
