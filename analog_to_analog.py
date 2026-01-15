import numpy as np

class AM:
    def __init__(self, f_c=1000, A_c=1.0, ka=1.0):
        """
        Amplitude Modulation (AM).
        The amplitude of the carrier signal varies with the message signal.

        :param f_c: Carrier frequency (Hz)
        :param A_c: Carrier amplitude
        :param ka: Amplitude sensitivity (modulation index), typically 0 < ka <= 1
        """
        self.f_c = f_c
        self.A_c = A_c
        self.ka = ka

    def modulate(self, message_signal, t):
        """
        Modulates the message signal using AM.
        AM formula: s(t) = A_c * [1 + ka * m(t)] * cos(2π * f_c * t)

        :param message_signal: Message signal samples (numpy array)
        :param t: Time array corresponding to message signal
        :return: Modulated signal (numpy array)
        """
        # Normalize message signal to ensure proper modulation depth
        m_t = np.array(message_signal)

        # Generate carrier signal
        carrier = np.cos(2 * np.pi * self.f_c * t)

        # Apply amplitude modulation
        modulated = self.A_c * (1 + self.ka * m_t) * carrier

        return modulated

    def demodulate(self, modulated_signal, t):
        """
        Demodulates the AM signal using envelope detection.
        Simplified approach: rectify and low-pass filter

        :param modulated_signal: Modulated signal samples (numpy array)
        :param t: Time array
        :return: Recovered message signal (numpy array)
        """
        # Envelope detection: take absolute value (rectification)
        envelope = np.abs(modulated_signal)

        # Remove DC component (subtract carrier amplitude and divide by sensitivity)
        # envelope ≈ A_c * (1 + ka * m(t))
        # So: m(t) ≈ (envelope / A_c - 1) / ka
        recovered = (envelope / self.A_c - 1) / self.ka

        # Simple moving average low-pass filter to smooth out carrier frequency
        window_size = max(3, int(len(recovered) / (10 * self.f_c * (t[-1] - t[0]))))
        if window_size % 2 == 0:
            window_size += 1  # Make it odd
        window_size = min(window_size, len(recovered))

        recovered_filtered = np.convolve(recovered, np.ones(window_size)/window_size, mode='same')

        return recovered_filtered


class FM:
    def __init__(self, f_c=1000, A_c=1.0, kf=100):
        """
        Frequency Modulation (FM).
        The frequency of the carrier signal varies with the message signal.

        :param f_c: Carrier frequency (Hz)
        :param A_c: Carrier amplitude
        :param kf: Frequency sensitivity (Hz per unit of message amplitude)
        """
        self.f_c = f_c
        self.A_c = A_c
        self.kf = kf

    def modulate(self, message_signal, t):
        """
        Modulates the message signal using FM.
        FM formula: s(t) = A_c * cos(2π * f_c * t + 2π * kf * ∫m(τ)dτ)

        :param message_signal: Message signal samples (numpy array)
        :param t: Time array corresponding to message signal
        :return: Modulated signal (numpy array)
        """
        m_t = np.array(message_signal)

        # Integrate message signal using cumulative trapezoidal integration
        dt = t[1] - t[0] if len(t) > 1 else 1.0
        integrated_message = np.cumsum(m_t) * dt

        # Generate FM signal
        # Phase: φ(t) = 2π * f_c * t + 2π * kf * ∫m(τ)dτ
        phase = 2 * np.pi * self.f_c * t + 2 * np.pi * self.kf * integrated_message
        modulated = self.A_c * np.cos(phase)

        return modulated

    def demodulate(self, modulated_signal, t):
        """
        Demodulates the FM signal using frequency detection.
        Simplified approach: compute instantaneous frequency from phase derivative

        :param modulated_signal: Modulated signal samples (numpy array)
        :param t: Time array
        :return: Recovered message signal (numpy array)
        """
        # Extract instantaneous phase using Hilbert transform
        analytic_signal = modulated_signal + 1j * np.imag(np.fft.ifft(
            -1j * np.sign(np.fft.fftfreq(len(modulated_signal))) * np.fft.fft(modulated_signal)
        ))
        instantaneous_phase = np.angle(analytic_signal)

        # Unwrap phase to avoid discontinuities
        unwrapped_phase = np.unwrap(instantaneous_phase)

        # Compute instantaneous frequency: f(t) = (1/2π) * dφ/dt
        dt = t[1] - t[0] if len(t) > 1 else 1.0
        instantaneous_frequency = np.diff(unwrapped_phase) / (2 * np.pi * dt)

        # Pad to match original length
        instantaneous_frequency = np.concatenate([[instantaneous_frequency[0]], instantaneous_frequency])

        # Remove carrier frequency to get message: m(t) = (f(t) - f_c) / kf
        recovered = (instantaneous_frequency - self.f_c) / self.kf

        return recovered


class PM:
    def __init__(self, f_c=1000, A_c=1.0, kp=np.pi/2):
        """
        Phase Modulation (PM).
        The phase of the carrier signal varies with the message signal.

        :param f_c: Carrier frequency (Hz)
        :param A_c: Carrier amplitude
        :param kp: Phase sensitivity (radians per unit of message amplitude)
        """
        self.f_c = f_c
        self.A_c = A_c
        self.kp = kp

    def modulate(self, message_signal, t):
        """
        Modulates the message signal using PM.
        PM formula: s(t) = A_c * cos(2π * f_c * t + kp * m(t))

        :param message_signal: Message signal samples (numpy array)
        :param t: Time array corresponding to message signal
        :return: Modulated signal (numpy array)
        """
        m_t = np.array(message_signal)

        # Generate PM signal
        # Phase: φ(t) = 2π * f_c * t + kp * m(t)
        phase = 2 * np.pi * self.f_c * t + self.kp * m_t
        modulated = self.A_c * np.cos(phase)

        return modulated

    def demodulate(self, modulated_signal, t):
        """
        Demodulates the PM signal using phase detection.
        Simplified approach: extract instantaneous phase

        :param modulated_signal: Modulated signal samples (numpy array)
        :param t: Time array
        :return: Recovered message signal (numpy array)
        """
        # Extract instantaneous phase using Hilbert transform
        analytic_signal = modulated_signal + 1j * np.imag(np.fft.ifft(
            -1j * np.sign(np.fft.fftfreq(len(modulated_signal))) * np.fft.fft(modulated_signal)
        ))
        instantaneous_phase = np.angle(analytic_signal)

        # Unwrap phase to avoid discontinuities
        unwrapped_phase = np.unwrap(instantaneous_phase)

        # Remove carrier phase: m(t) = (φ(t) - 2π*f_c*t) / kp
        carrier_phase = 2 * np.pi * self.f_c * t
        recovered = (unwrapped_phase - carrier_phase) / self.kp

        return recovered
