import React, { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#071912',
          color: '#fbf8ee',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
            حدث خطأ أثناء تحميل التطبيق / An unexpected error occurred
          </h2>
          <p style={{ maxWidth: '600px', marginBottom: '1.5rem', color: '#9bb7aa', fontSize: '0.9rem' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              border: '1px solid #d4af37',
              background: '#0c2b20',
              color: '#d4af37',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            إعادة التحميل / Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

