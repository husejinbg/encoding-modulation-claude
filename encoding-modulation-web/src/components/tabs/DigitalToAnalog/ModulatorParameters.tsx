import React from 'react';
import type { ModulatorId } from '../../../types/modulator.types';

interface ModulatorParametersProps {
  modulator: ModulatorId;
  askParams: { f_c: number; A_one: number; A_zero: number };
  bfskParams: { f_zero: number; f_one: number; A: number };
  bpskParams: { f_c: number; A: number };
  mfskParams: { f_0: number; f_1: number; f_2: number; f_3: number; A: number };
  qpskParams: { f_c: number; A: number };
  onAskChange: (params: { f_c: number; A_one: number; A_zero: number }) => void;
  onBfskChange: (params: { f_zero: number; f_one: number; A: number }) => void;
  onBpskChange: (params: { f_c: number; A: number }) => void;
  onMfskChange: (params: { f_0: number; f_1: number; f_2: number; f_3: number; A: number }) => void;
  onQpskChange: (params: { f_c: number; A: number }) => void;
}

/**
 * Dynamic parameter inputs based on selected modulator
 * Each modulator has different parameters that need to be configured
 */
export const ModulatorParameters: React.FC<ModulatorParametersProps> = ({
  modulator,
  askParams,
  bfskParams,
  bpskParams,
  mfskParams,
  qpskParams,
  onAskChange,
  onBfskChange,
  onBpskChange,
  onMfskChange,
  onQpskChange
}) => {
  return (
    <div className="modulator-parameters">
      {modulator === 'ask' && (
        <>
          <div className="parameter-field">
            <label>Carrier Frequency (Hz):</label>
            <input
              type="number"
              value={askParams.f_c}
              onChange={e => onAskChange({ ...askParams, f_c: parseFloat(e.target.value) || 1000 })}
              step={100}
              min={100}
            />
          </div>
          <div className="parameter-field">
            <label>Amplitude for 1 (V):</label>
            <input
              type="number"
              value={askParams.A_one}
              onChange={e => onAskChange({ ...askParams, A_one: parseFloat(e.target.value) || 1 })}
              step={0.1}
              min={0}
            />
          </div>
          <div className="parameter-field">
            <label>Amplitude for 0 (V):</label>
            <input
              type="number"
              value={askParams.A_zero}
              onChange={e => onAskChange({ ...askParams, A_zero: parseFloat(e.target.value) || 0 })}
              step={0.1}
              min={0}
            />
          </div>
        </>
      )}

      {modulator === 'bfsk' && (
        <>
          <div className="parameter-field">
            <label>Frequency for 0 (Hz):</label>
            <input
              type="number"
              value={bfskParams.f_zero}
              onChange={e => onBfskChange({ ...bfskParams, f_zero: parseFloat(e.target.value) || 1000 })}
              step={100}
              min={100}
            />
          </div>
          <div className="parameter-field">
            <label>Frequency for 1 (Hz):</label>
            <input
              type="number"
              value={bfskParams.f_one}
              onChange={e => onBfskChange({ ...bfskParams, f_one: parseFloat(e.target.value) || 2000 })}
              step={100}
              min={100}
            />
          </div>
          <div className="parameter-field">
            <label>Amplitude (V):</label>
            <input
              type="number"
              value={bfskParams.A}
              onChange={e => onBfskChange({ ...bfskParams, A: parseFloat(e.target.value) || 1 })}
              step={0.1}
              min={0.1}
            />
          </div>
        </>
      )}

      {modulator === 'bpsk' && (
        <>
          <div className="parameter-field">
            <label>Carrier Frequency (Hz):</label>
            <input
              type="number"
              value={bpskParams.f_c}
              onChange={e => onBpskChange({ ...bpskParams, f_c: parseFloat(e.target.value) || 1000 })}
              step={100}
              min={100}
            />
          </div>
          <div className="parameter-field">
            <label>Amplitude (V):</label>
            <input
              type="number"
              value={bpskParams.A}
              onChange={e => onBpskChange({ ...bpskParams, A: parseFloat(e.target.value) || 1 })}
              step={0.1}
              min={0.1}
            />
          </div>
        </>
      )}

      {modulator === 'mfsk' && (
        <>
          <div className="parameter-field">
            <label>Frequency for 00 (Hz):</label>
            <input
              type="number"
              value={mfskParams.f_0}
              onChange={e => onMfskChange({ ...mfskParams, f_0: parseFloat(e.target.value) || 1000 })}
              step={100}
              min={100}
            />
          </div>
          <div className="parameter-field">
            <label>Frequency for 01 (Hz):</label>
            <input
              type="number"
              value={mfskParams.f_1}
              onChange={e => onMfskChange({ ...mfskParams, f_1: parseFloat(e.target.value) || 1500 })}
              step={100}
              min={100}
            />
          </div>
          <div className="parameter-field">
            <label>Frequency for 10 (Hz):</label>
            <input
              type="number"
              value={mfskParams.f_2}
              onChange={e => onMfskChange({ ...mfskParams, f_2: parseFloat(e.target.value) || 2000 })}
              step={100}
              min={100}
            />
          </div>
          <div className="parameter-field">
            <label>Frequency for 11 (Hz):</label>
            <input
              type="number"
              value={mfskParams.f_3}
              onChange={e => onMfskChange({ ...mfskParams, f_3: parseFloat(e.target.value) || 2500 })}
              step={100}
              min={100}
            />
          </div>
          <div className="parameter-field">
            <label>Amplitude (V):</label>
            <input
              type="number"
              value={mfskParams.A}
              onChange={e => onMfskChange({ ...mfskParams, A: parseFloat(e.target.value) || 1 })}
              step={0.1}
              min={0.1}
            />
          </div>
        </>
      )}

      {modulator === 'qpsk' && (
        <>
          <div className="parameter-field">
            <label>Carrier Frequency (Hz):</label>
            <input
              type="number"
              value={qpskParams.f_c}
              onChange={e => onQpskChange({ ...qpskParams, f_c: parseFloat(e.target.value) || 1000 })}
              step={100}
              min={100}
            />
          </div>
          <div className="parameter-field">
            <label>Amplitude (V):</label>
            <input
              type="number"
              value={qpskParams.A}
              onChange={e => onQpskChange({ ...qpskParams, A: parseFloat(e.target.value) || 1 })}
              step={0.1}
              min={0.1}
            />
          </div>
        </>
      )}
    </div>
  );
};
