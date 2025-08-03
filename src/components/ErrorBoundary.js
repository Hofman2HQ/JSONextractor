import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-4">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something went wrong!</h4>
            <p>The application encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.</p>
            <hr />
            <p className="mb-0">
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={this.handleReset}
              >
                Try Again
              </button>
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-3">
                <summary>Error Details (Development)</summary>
                <pre className="mt-2 p-2 bg-light border rounded">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 