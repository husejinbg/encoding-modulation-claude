import numpy as np

class PCM:
    def __init__(self, n_bits, v_min, v_max):
        """
        Initialize PCM Codec.
        :param n_bits: Number of bits per sample (determines 2^n quantization levels).
        :param v_min: Minimum voltage of the analog signal range.
        :param v_max: Maximum voltage of the analog signal range.
        """
        self.n_bits = n_bits
        self.v_min = v_min
        self.v_max = v_max
        self.num_levels = 2 ** n_bits
        # Calculate the voltage resolution (step size)
        self.step_size = (v_max - v_min) / self.num_levels

    def encode(self, analog_samples):
        """
        Encodes analog samples into digital levels.
        This represents the 'Digitizer' or 'Encoder' block in the diagram.
        """
        digital_data = []
        
        for sample in analog_samples:
            # Normalize the sample relative to v_min
            normalized_val = sample - self.v_min
            
            # Quantize: Map to the nearest integer level index
            level_index = int(normalized_val / self.step_size)
            
            # Clamp to ensure we stay within valid level range [0, 2^n - 1]
            level_index = max(0, min(self.num_levels - 1, level_index))
            
            digital_data.append(level_index)
            
        return digital_data

    def decode(self, digital_data):
        """
        Decodes the digital levels back into an approximate analog signal.
        """
        reconstructed_signal = []
        
        for level_index in digital_data:
            # Convert level index back to voltage.
            # We add half a step size to center the value in the quantization interval
            # to minimize the mean absolute error.
            voltage = self.v_min + (level_index * self.step_size) + (self.step_size / 2)
            reconstructed_signal.append(voltage)
            
        return np.array(reconstructed_signal)
    
class DM:
    def __init__(self, step_size_delta):
        """
        Initialize DM Codec.
        :param step_size_delta: The fixed voltage change (delta) for each step.
        """
        self.delta = step_size_delta

    def encode(self, analog_samples):
        """
        Encodes analog samples into a stream of 1s and 0s.
        Uses a feedback loop to track the staircase function essentially 
        comparing the input to the previous estimate.
        """
        binary_stream = []
        
        # The encoder mimics the decoder's state to determine the next bit
        # This is the 'feedback mechanism' described in Figure 5.22
        current_staircase_value = 0.0 
        
        for sample in analog_samples:
            if sample > current_staircase_value:
                # If input is higher, we step up (send 1)
                bit = 1
                current_staircase_value += self.delta
            else:
                # If input is lower/equal, we step down (send 0)
                bit = 0
                current_staircase_value -= self.delta
            
            binary_stream.append(bit)
            
        return binary_stream

    def decode(self, binary_stream):
        """
        Decodes the binary stream to reconstruct the staircase function.
        """
        reconstructed_signal = []
        current_value = 0.0
        
        for bit in binary_stream:
            if bit == 1:
                current_value += self.delta
            else:
                current_value -= self.delta
            
            reconstructed_signal.append(current_value)
            
        return np.array(reconstructed_signal)