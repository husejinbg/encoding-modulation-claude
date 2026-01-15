// Digital data can be either quantization indices (PCM) or binary bits (DM)
export type DigitalData = number[]; // Generic: can be indices or bits

// Base codec interface for analog-to-digital conversion
export interface ICodec {
  readonly name: string;
  readonly description: string;

  encode(analogSamples: number[]): DigitalData;
  decode(digitalData: DigitalData): number[];
}

// PCM-specific interface
export interface IPCMCodec extends ICodec {
  readonly nBits: number;
  readonly vMin: number;
  readonly vMax: number;
  readonly numLevels: number;
  readonly stepSize: number;
}

// DM-specific interface
export interface IDMCodec extends ICodec {
  readonly delta: number;
}

// Codec metadata for UI
export interface CodecInfo {
  id: CodecId;
  displayName: string;
  description: string;
  parameterType: 'pcm' | 'dm';
}

export type CodecId = 'pcm' | 'dm';
