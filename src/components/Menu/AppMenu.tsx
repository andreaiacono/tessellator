import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTessellatorStore } from '../../store/useTessellatorStore';
import { saveFile, loadFile, exportPNG } from '../../core/utils/fileHandlers';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { Save, FolderOpen, FileImage, X } from 'lucide-react';
import styles from './AppMenu.module.scss';

interface AppMenuProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const AppMenu = ({ canvasRef }: AppMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cell = useTessellatorStore((state) => state.cell);
  const zoom = useTessellatorStore((state) => state.zoom);
  const thickness = useTessellatorStore((state) => state.thickness);
  const drawGrid = useTessellatorStore((state) => state.drawGrid);
  const drawColors = useTessellatorStore((state) => state.drawColors);
  const color1 = useTessellatorStore((state) => state.color1);
  const color2 = useTessellatorStore((state) => state.color2);
  const loadFromFile = useTessellatorStore((state) => state.loadFromFile);

  const handleSave = () => {
    try {
      saveFile(cell, zoom, thickness, drawGrid, drawColors, color1, color2);
      toast.success('File saved successfully');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to save file');
    }
  };

  const handleOpen = () => {
    fileInputRef.current?.click();
    setIsOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await loadFile(file);
        loadFromFile(data);
        toast.success('File loaded successfully');
      } catch (error) {
        toast.error('Failed to load file: ' + (error as Error).message);
      }
    }
    // Reset input
    e.target.value = '';
  };

  const handleExport = () => {
    if (canvasRef.current) {
      try {
        exportPNG(canvasRef.current);
        toast.success('PNG exported successfully');
      } catch (error) {
        toast.error('Failed to export PNG');
      }
    }
    setIsOpen(false);
  };

  useKeyboardShortcuts({
    onSave: handleSave,
    onOpen: handleOpen,
    onExport: handleExport,
  });

  return (
    <div className={styles.appMenu}>
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        File
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            <button className={styles.menuItem} onClick={handleOpen}>
              <FolderOpen size={16} />
              <span>Open</span>
              <span className={styles.shortcut}>Ctrl+O</span>
            </button>

            <button className={styles.menuItem} onClick={handleSave}>
              <Save size={16} />
              <span>Save</span>
              <span className={styles.shortcut}>Ctrl+S</span>
            </button>

            <button className={styles.menuItem} onClick={handleExport}>
              <FileImage size={16} />
              <span>Export PNG</span>
              <span className={styles.shortcut}>Ctrl+E</span>
            </button>

            <div className={styles.divider} />

            <button className={styles.menuItem} onClick={() => setIsOpen(false)}>
              <X size={16} />
              <span>Close Menu</span>
            </button>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".tile"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};
