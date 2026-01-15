import React from 'react';
import type { CodecId } from '../../../types/codec.types';

interface PCMParams {
  nBits: number;
}

interface DMParams {
  stepSize: number;
}

interface CodecParametersProps {
  codec: CodecId;
  pcmParams: PCMParams;
  dmParams: DMParams;
  samplingRate: number;
  onPcmChange: (params: PCMParams) => void;
  onDmChange: (params: DMParams) => void;
  onSamplingRateChange: (rate: number) => void;
}

export const CodecParameters: React.FC<CodecParametersProps> = ({
  codec,
  pcmParams,
  dmParams,
  samplingRate,
  onPcmChange,
  onDmChange,
  onSamplingRateChange
}) => {
  return (
    <div className="codec-parameters">
      {/* Sampling rate is common to both codecs */}
      <div className="parameter-field">
        <label htmlFor="sampling-rate">Sampling Rate (Hz):</label>
        <input
          id="sampling-rate"
          type="number"
          value={samplingRate}
          onChange={e => onSamplingRateChange(parseFloat(e.target.value) || 10)}
          step={1}
          min={1}
        />
      </div>

      {/* PCM-specific parameters */}
      {codec === 'pcm' && (
        <div className="parameter-field">
          <label htmlFor="n-bits">Number of Bits:</label>
          <input
            id="n-bits"
            type="number"
            value={pcmParams.nBits}
            onChange={e => onPcmChange({ nBits: parseInt(e.target.value) || 4 })}
            step={1}
            min={1}
            max={16}
          />
        </div>
      )}

      {/* DM-specific parameters */}
      {codec === 'dm' && (
        <div className="parameter-field">
          <label htmlFor="step-size">Step Size (δ):</label>
          <input
            id="step-size"
            type="number"
            value={dmParams.stepSize}
            onChange={e => onDmChange({ stepSize: parseFloat(e.target.value) || 0.1 })}
            step={0.01}
            min={0.01}
          />
        </div>
      )}
    </div>
  );
};
