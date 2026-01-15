import numpy as np
from sinusoid import Sinusoid

class ASK:
    def __init__(self, f_c=1000, A_one=1.0, A_zero=0.0):
        """
        ASK: Bits are represented by different Amplitudes.
        Standard ASK uses A for '1' and 0 for '0'.
        """
        self.f_c = f_c
        self.A_one = A_one
        self.A_zero = A_zero

    def modulate(self, bits):
        signal_stream = []
        for bit in bits:
            if bit == 1:
                # Binary 1: Presence of carrier (High Amplitude)
                wave = Sinusoid(A=self.A_one, f=self.f_c, phi=0.0)
            else:
                # Binary 0: Absence of carrier (Zero/Low Amplitude)
                wave = Sinusoid(A=self.A_zero, f=self.f_c, phi=0.0)
            signal_stream.append(wave)
        return signal_stream

    def demodulate(self, signal_stream):
        decoded_bits = []
        # Threshold is halfway between the two amplitudes
        threshold = (self.A_one + self.A_zero) / 2
        
        for wave in signal_stream:
            # Inspection: If amplitude is high, it's a 1
            if wave.A > threshold:
                decoded_bits.append(1)
            else:
                decoded_bits.append(0)
        return decoded_bits

# --- 3. BFSK (Binary Frequency Shift Keying) ---
class BFSK:
    def __init__(self, f_zero=1000, f_one=2000, A=1.0):
        """
        BFSK: Bits are represented by different Frequencies[cite: 324].
        """
        self.f_zero = f_zero
        self.f_one = f_one
        self.A = A

    def modulate(self, bits):
        signal_stream = []
        for bit in bits:
            if bit == 1:
                # Binary 1: Frequency f_one
                wave = Sinusoid(A=self.A, f=self.f_one, phi=0.0)
            else:
                # Binary 0: Frequency f_zero
                wave = Sinusoid(A=self.A, f=self.f_zero, phi=0.0)
            signal_stream.append(wave)
        return signal_stream

    def demodulate(self, signal_stream):
        decoded_bits = []
        for wave in signal_stream:
            # Inspection: Check the frequency property
            if wave.f == self.f_one:
                decoded_bits.append(1)
            else:
                decoded_bits.append(0)
        return decoded_bits

# --- 4. BPSK (Binary Phase Shift Keying) ---
class BPSK:
    def __init__(self, f_c=1000, A=1.0):
        """
        BPSK: Bits are represented by Phase Shifts[cite: 393].
        Binary 1: Normal Phase (0)
        Binary 0: Shifted Phase (180 degrees or pi).
        """
        self.f_c = f_c
        self.A = A

    def modulate(self, bits):
        signal_stream = []
        for bit in bits:
            if bit == 1:
                # Binary 1: Phase 0
                wave = Sinusoid(A=self.A, f=self.f_c, phi=0.0)
            else:
                # Binary 0: Phase pi (180 degrees)
                wave = Sinusoid(A=self.A, f=self.f_c, phi=np.pi)
            signal_stream.append(wave)
        return signal_stream

    def demodulate(self, signal_stream):
        decoded_bits = []
        for wave in signal_stream:
            # Inspection: Check phase. 
            # Note: Floating point comparison needs a small epsilon or approximate check
            if abs(wave.phi) < 0.1: # Close to 0
                decoded_bits.append(1)
            else: # Close to pi
                decoded_bits.append(0)
        return decoded_bits