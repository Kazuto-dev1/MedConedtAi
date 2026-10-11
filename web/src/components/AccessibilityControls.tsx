import { useEffect, useState } from 'react';

type FontScale = 'normal' | 'large' | 'xlarge';
type Contrast = 'normal' | 'high';

const FONT_LABEL: Record<FontScale, string> = {
  normal: 'Padrão',
  large: 'Grande',
  xlarge: 'Muito grande',
};

function readPreference<T extends string>(key: string, fallback: T): T {
  const value = localStorage.getItem(key);
  return (value ?? fallback) as T;
}

export default function AccessibilityControls() {
  const [aberto, setAberto] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>(() => readPreference('medconecta-font-scale', 'normal'));
  const [contrast, setContrast] = useState<Contrast>(() => readPreference('medconecta-contrast', 'normal'));

  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
    localStorage.setItem('medconecta-font-scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.dataset.contrast = contrast;
    localStorage.setItem('medconecta-contrast', contrast);
  }, [contrast]);

  function reset() {
    setFontScale('normal');
    setContrast('normal');
  }

  return (
    <div className="accessibility-controls">
      <button
        type="button"
        className="accessibility-trigger"
        aria-expanded={aberto}
        aria-controls="accessibility-panel"
        onClick={() => setAberto((value) => !value)}
      >
        Acessibilidade
      </button>
      {aberto && (
        <section id="accessibility-panel" className="accessibility-panel" aria-label="Opções de acessibilidade">
          <fieldset>
            <legend>Tamanho do texto</legend>
            <div className="accessibility-options">
              {(Object.keys(FONT_LABEL) as FontScale[]).map((size) => (
                <button key={size} type="button" className={fontScale === size ? 'is-selected' : ''} aria-pressed={fontScale === size} onClick={() => setFontScale(size)}>
                  {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'} <span>{FONT_LABEL[size]}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Contraste</legend>
            <div className="accessibility-options">
              <button type="button" className={contrast === 'normal' ? 'is-selected' : ''} aria-pressed={contrast === 'normal'} onClick={() => setContrast('normal')}>Padrão</button>
              <button type="button" className={contrast === 'high' ? 'is-selected' : ''} aria-pressed={contrast === 'high'} onClick={() => setContrast('high')}>Alto contraste</button>
            </div>
          </fieldset>
          <button type="button" className="accessibility-reset" onClick={reset}>Restaurar preferências</button>
        </section>
      )}
    </div>
  );
}
