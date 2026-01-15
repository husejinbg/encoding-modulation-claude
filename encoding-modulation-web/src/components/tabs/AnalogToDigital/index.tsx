import React, { useState } from 'react';
import { CodecSelect } from './CodecSelect';
import { SinusoidInputs } from './SinusoidInputs';
import { CodecParameters } from './CodecParameters';
import { TransmitButton } from './TransmitButton';
import { AnalogPlot } from '../../common/AnalogPlot';
import { DigitalPlot } from '../../common/DigitalPlot';
import { encoders, encoderList } from '../../../encoders';
import { PCM, DM, codecInfoMap } from '../../../codecs';
import { useAnalogTransmission } from '../../../hooks/useAnalogTransmission';
import { CompositeSignal, Sinusoid } from '../../../utils/signalGeneration';
import type { SinusoidParams } from '../../../types/analog.types';
import type { CodecId } from '../../../types/codec.types';
import type { EncoderId } from '../../../encoders';
import './AnalogToDigital.css';

export const AnalogToDigital: React.FC = () => {
  // Codec and encoder selection
  const [selectedCodec, setSelectedCodec] = useState<CodecId>('pcm');
  const [selectedEncoder, setSelectedEncoder] = useState<EncoderId>('nrz-l');

  // Sinusoid inputs
  const [sinusoids, setSinusoids] = useState<SinusoidParams[]>([
    { id: '1', amplitude: 1, frequency: 5, phase: 0, verticalOffset: 0 }
  ]);

  // Duration and sampling
  const [duration, setDuration] = useState<number>(1); // seconds
  const [samplingRate, setSamplingRate] = useState<number>(50); // Hz

  // Codec-specific parameters
  const [pcmParams, setPcmParams] = useState({ nBits: 4 });
  const [dmParams, setDmParams] = useState({ stepSize: 0.1 });

  // Validation and errors
  const [validationError, setValidationError] = useState<string | null>(null);
  const [nyquistWarning, setNyquistWarning] = useState<string | null>(null);

  // Received signal rendering option
  const [receivedSignalSmooth, setReceivedSignalSmooth] = useState<boolean>(false);

  const { chartData, numSamples, numBits, transmit, reset } = useAnalogTransmission();

  const handleTransmit = () => {
    try {
      // Validate inputs
      if (sinusoids.length === 0) {
        throw new Error('At least one sinusoid is required');
      }

      if (duration <= 0) {
        throw new Error('Duration must be positive');
      }

      if (samplingRate <= 0) {
        throw new Error('Sampling rate must be positive');
      }

      // Calculate Nyquist rate
      const maxFreq = Math.max(...sinusoids.map(s => s.frequency));
      const nyquistRate = 2 * maxFreq;

      // Auto-adjust sampling rate if needed
      let adjustedSamplingRate = samplingRate;
      if (samplingRate < nyquistRate) {
        adjustedSamplingRate = Math.ceil(nyquistRate);
        setSamplingRate(adjustedSamplingRate);
        setNyquistWarning(
          `Sampling rate auto-adjusted to ${adjustedSamplingRate} Hz (Nyquist rate: ${nyquistRate.toFixed(1)} Hz)`
        );
      } else {
        setNyquistWarning(null);
      }

      // Calculate voltage range for PCM
      const tempSinusoids = sinusoids.map(p => Sinusoid.fromParams(p));
      const tempComposite = new CompositeSignal(tempSinusoids);
      const { min: vMin, max: vMax } = tempComposite.getAmplitudeRange();

      // Add small margin to prevent edge quantization issues
      const margin = (vMax - vMin) * 0.01 || 0.1;

      // Create codec instance
      const codec =
        selectedCodec === 'pcm'
          ? new PCM(pcmParams.nBits, vMin - margin, vMax + margin)
          : new DM(dmParams.stepSize);

      // Get encoder instance
      const encoder = encoders[selectedEncoder];

      // Clear validation error
      setValidationError(null);

      // Transmit
      transmit({
        sinusoidParams: sinusoids,
        duration,
        samplingRate: adjustedSamplingRate,
        codec,
        encoder,
      });
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Invalid input');
      reset();
    }
  };

  const codecInfo = codecInfoMap[selectedCodec];

  return (
    <div className="analog-to-digital-tab">
      <div className="controls">
        <CodecSelect selectedCodec={selectedCodec} onChange={setSelectedCodec} />

        <div className="encoder-select">
          <label htmlFor="encoder-select">Digital Encoder:</label>
          <select
            id="encoder-select"
            value={selectedEncoder}
            onChange={e => setSelectedEncoder(e.target.value as EncoderId)}
          >
            {encoderList.map(encoder => (
              <option key={encoder.id} value={encoder.id}>
                {encoder.displayName}
              </option>
            ))}
          </select>
        </div>

        <SinusoidInputs sinusoids={sinusoids} onChange={setSinusoids} />

        <div className="duration-input">
          <label htmlFor="duration">Duration (s):</label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={e => setDuration(parseFloat(e.target.value) || 1)}
            step={0.1}
            min={0.1}
          />
        </div>

        <CodecParameters
          codec={selectedCodec}
          pcmParams={pcmParams}
          dmParams={dmParams}
          samplingRate={samplingRate}
          onPcmChange={setPcmParams}
          onDmChange={setDmParams}
          onSamplingRateChange={setSamplingRate}
        />

        <TransmitButton onClick={handleTransmit} />

        {validationError && <div className="error-message">{validationError}</div>}
        {nyquistWarning && <div className="warning-message">{nyquistWarning}</div>}
      </div>

      <div className="plot-options">
        <label>
          <input
            type="checkbox"
            checked={receivedSignalSmooth}
            onChange={e => setReceivedSignalSmooth(e.target.checked)}
          />
          Smooth Received Signal
        </label>
      </div>

      <div className="plots-container">
        {chartData ? (
          <>
            <AnalogPlot
              data={chartData.sendAnalog}
              title="Send Analog Signal"
              numSamples={numSamples}
              smooth={true}
            />
            <DigitalPlot
              data={chartData.encodedDigital}
              title="Encoded Digital Signal"
              numBits={numBits}
            />
            <AnalogPlot
              data={chartData.receivedAnalog}
              title="Received Analog Signal"
              numSamples={numSamples}
              smooth={receivedSignalSmooth}
            />
          </>
        ) : (
          <div className="empty-state">
            <p>Configure sinusoids and click Transmit to see encoding</p>
          </div>
        )}
      </div>

      <div className="config-panel">
        <h3>Codec Information</h3>
        <p><strong>Technique:</strong> {codecInfo.displayName}</p>
        <p><strong>Description:</strong> {codecInfo.description}</p>
        <p><strong>Digital Encoder:</strong> {encoders[selectedEncoder].constructor.name}</p>
      </div>
    </div>
  );
};
