import { useRef } from 'react';
import { TessellatorCanvas } from '../Canvas/TessellatorCanvas';
import { ControlsPanel } from '../Controls/ControlsPanel';
import { AppMenu } from '../Menu/AppMenu';
import styles from './AppLayout.module.scss';

export const AppLayout = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className={styles.appLayout}>
      <div className={styles.menuBar}>
        <AppMenu canvasRef={canvasRef} />
        <h1 className={styles.title}>Tessellator</h1>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.canvasSection}>
          <TessellatorCanvas canvasRef={canvasRef} />
        </div>
        <div className={styles.controlsSection}>
          <ControlsPanel />
        </div>
      </div>
    </div>
  );
};
