import numpy as np

class Sinusoid:
    def __init__(self, A=1.0, f=1.0, phi=0.0, D=0.0):
        self.A = A
        self.f = f
        self.phi = phi
        self.D = D
    
    def __call__(self, t):
        return self.A * np.sin(2 * np.pi * self.f * t + self.phi) + self.D
    
    def max_value(self):
        return self.A + self.D
    
    def min_value(self):
        return -self.A + self.D
    
class AnalogSignal():
    # addition of the sinusoids
    
    def __init__(self, sinusoids: list[Sinusoid]):
        self.sinusoids = sinusoids
    
    def __call__(self, t):
        signal = np.zeros_like(t)
        for sinusoid in self.sinusoids:
            signal += sinusoid(t)
        return signal
    
    def get_min_sampling_rate(self):
        max_freq = max(sinusoid.f for sinusoid in self.sinusoids)
        return 2 * max_freq  # Nyquist rate
    
    def get_amplitude_range(self):
        min_val = min(sinusoid.min_value() for sinusoid in self.sinusoids)
        max_val = max(sinusoid.max_value() for sinusoid in self.sinusoids)
        return min_val, max_val