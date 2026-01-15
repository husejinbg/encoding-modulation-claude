import type { CodecInfo, CodecId } from '../types/codec.types';

// Export codec classes (not instances, since they need parameters)
export { PCM } from './PCM';
export { DM } from './DM';

// Codec metadata for UI display
export const codecInfoMap: Record<CodecId, CodecInfo> = {
  'pcm': {
    id: 'pcm',
    displayName: 'PCM',
    description: 'Pulse Code Modulation',
    parameterType: 'pcm',
  },
  'dm': {
    id: 'dm',
    displayName: 'DM',
    description: 'Delta Modulation',
    parameterType: 'dm',
  },
};

// Convenience export for dropdowns
export const codecList = Object.values(codecInfoMap);
