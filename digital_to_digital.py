LOW = -1
HIGH = 1
NO_LINE = 0

class NonReturnToZeroLevel:
    """
    Non-Return-to-Zero-Level (NRZ-L) encoding.
    0 = high level
    1 = low level
    """
    def encode(self, data: list[int]) -> list[int]:
        result = []
        for bit in data:
            if bit == 1:
                result.append(LOW)
            else:
                result.append(HIGH)
        return result
    
    def decode(self, signal: list[int]) -> list[int]:
        result = []
        for level in signal:
            if level == LOW:
                result.append(1)
            else:
                result.append(0)
        return result

class NonReturnToZeroInverted:
    """
    Non-Return-to-Zero-Inverted (NRZ-I) encoding.
    0 = no transition at the beginning of the interval (one bit time)
    1 = transition at the beginning of the interval (one bit time)
    assume that the previous level is LOW
    """
    def encode(self, data: list[int]) -> list[int]:
        last_level = LOW
        result = []
        for bit in data:
            if bit == 1:
                last_level = HIGH if last_level == LOW else LOW
            result.append(last_level)
        return result
    
    def decode(self, signal: list[int]) -> list[int]:
        result = []
        previous_level = LOW
        for level in signal:
            if level != previous_level:
                result.append(1)
            else:
                result.append(0)
            previous_level = level
        return result

class BipolarAMI:
    """
    Bipolar-AMI encoding.
    0 = no line signal
    1 = alternate between high and low levels
    """
    def encode(self, data: list[int]) -> list[int]:
        last_level = LOW
        result = []
        for bit in data:
            if bit == 1:
                # Toggle logic: if last was LOW, now HIGH; if last was HIGH, now LOW
                last_level = HIGH if last_level == LOW else LOW
                result.append(last_level)
            else:
                result.append(NO_LINE)
        return result
    
    def decode(self, signal: list[int]) -> list[int]:
        result = []
        for level in signal:
            if level == NO_LINE:
                result.append(0)
            else:
                result.append(1)
        return result

    def has_violations(self, signal: list[int]) -> bool:
        """
        Checks for Bipolar Violations.
        A violation occurs if two consecutive non-zero pulses have the same polarity.
        """
        last_nonzero = None
        
        for level in signal:
            # We only care about pulses (High or Low), ignore No Line
            if level == NO_LINE:
                continue
            
            # If we found a pulse and it's the same as the previous one, it's a violation
            if last_nonzero is not None and level == last_nonzero:
                return True
            
            # Update the last seen pulse
            last_nonzero = level
            
        return False

class Pseudoternary:
    """
    Pseudoternary encoding.
    0 = alternate between high and low levels
    1 = no line signal
    """
    def encode(self, data: list[int]) -> list[int]:
        last_level = LOW
        result = []
        for bit in data:
            if bit == 0:
                last_level = HIGH if last_level == LOW else LOW
                result.append(last_level)
            else:
                result.append(NO_LINE)
        return result
    
    def decode(self, signal: list[int]) -> list[int]:
        result = []
        for level in signal:
            if level == NO_LINE:
                result.append(1)
            else:
                result.append(0)
        return result

    def has_violations(self, signal: list[int]) -> bool:
        """
        Checks for Bipolar Violations (same logic as AMI).
        A violation occurs if two consecutive non-zero pulses have the same polarity.
        """
        last_nonzero = None
        
        for level in signal:
            if level == NO_LINE:
                continue
            
            if last_nonzero is not None and level == last_nonzero:
                return True
            
            last_nonzero = level
            
        return False

class Manchester:
    """
    Manchester encoding.
    0 = high to low transition -> [HIGH, LOW]
    1 = low to high transition -> [LOW, HIGH]
    1 bit is represented by 2 signal intervals
    """
    def encode(self, data: list[int]) -> list[int]:
        result = []
        for bit in data:
            if bit == 1:
                result.extend([LOW, HIGH])
            else:
                result.extend([HIGH, LOW])
        return result
    
    def decode(self, signal: list[int]) -> list[int]:
        result = []
        for i in range(0, len(signal), 2):
            pair = signal[i:i+2]
            if pair == [LOW, HIGH]:
                result.append(1)
            else:
                result.append(0)
        return result

class DifferentialManchester:
    """
    Differential Manchester encoding.
    0 = transition at the beginning of the interval
    1 = no transition at the beginning of the interval
    each bit has a transition in the middle of the interval
    assume that the previous level is LOW
    """
    def encode(self, data: list[int]) -> list[int]:
        last_level = LOW
        result = []
        for bit in data:
            if bit == 0:
                last_level = HIGH if last_level == LOW else LOW
            result.append(last_level)
            last_level = HIGH if last_level == LOW else LOW
            result.append(last_level)
        return result
    
    def decode(self, signal: list[int]) -> list[int]:
        result = []
        previous_level = LOW
        for i in range(0, len(signal), 2):
            first_half = signal[i]
            if first_half != previous_level:
                result.append(0)
            else:
                result.append(1)
            previous_level = signal[i+1]
        return result

    