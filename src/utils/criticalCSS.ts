// src/utils/criticalCSS.ts
export const injectCriticalCSS = (): void => {
  if (typeof document === 'undefined') return;

  const criticalStyles = `
    /* Critical above-the-fold styles */
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .main-content {
      flex: 1;
    }
    
    .header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Check if already injected
  if (document.getElementById('critical-css')) return;

  const style = document.createElement('style');
  style.id = 'critical-css';
  style.textContent = criticalStyles;
  document.head.appendChild(style);
};