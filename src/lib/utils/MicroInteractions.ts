export class MicroInteractions {
  // Debounce utility to prevent rapid repeated actions
  static debounce<F extends (...args: any[]) => any>(
    func: F, 
    delay: number = 300
  ): (...args: Parameters<F>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    return (...args: Parameters<F>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, delay);
    };
  }

  // Throttle utility to limit frequency of action
  static throttle<F extends (...args: any[]) => any>(
    func: F, 
    limit: number = 300
  ): (...args: Parameters<F>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<F>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Animate element with CSS transitions
  static animateElement(
    element: HTMLElement, 
    animationClass: string, 
    duration: number = 300
  ): Promise<void> {
    return new Promise(resolve => {
      element.classList.add(animationClass);
      
      const handleAnimationEnd = () => {
        element.classList.remove(animationClass);
        element.removeEventListener('animationend', handleAnimationEnd);
        resolve();
      };
      
      element.addEventListener('animationend', handleAnimationEnd);
      
      // Fallback in case animationend doesn't trigger
      setTimeout(resolve, duration + 50);
    });
  }

  // Smooth scroll to element
  static smoothScrollTo(
    element: HTMLElement, 
    offset: number = 0, 
    behavior: 'auto' | 'smooth' = 'smooth'
  ): void {
    window.scrollTo({
      top: element.offsetTop + offset,
      behavior
    });
  }
}

// Predefined animation classes
export const AnimationClasses = {
  FADE_IN: 'micro-fade-in',
  SLIDE_UP: 'micro-slide-up',
  BOUNCE: 'micro-bounce',
  SHAKE: 'micro-shake'
};
