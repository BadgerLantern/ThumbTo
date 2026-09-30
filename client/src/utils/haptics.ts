export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'burst';

export function triggerHaptic(type: HapticType = 'medium') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([20, 50, 40]);
        break;
      case 'burst':
        navigator.vibrate([15, 30, 15, 30, 25]);
        break;
    }
  } catch (e) {
    // Vibration may be blocked by permissions or browser policy
  }
}
