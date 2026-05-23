import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Prototype render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="shell">
        <div className="shell-inner py-16">
          <p className="section-label">
            <span className="accent-square" aria-hidden />
            Error
          </p>
          <h1 className="title-md !normal-case">No se pudo cargar la entrevista</h1>
          <p className="copy-lg">{this.state.error.message}</p>
          <button
            type="button"
            className="link-underline mt-6"
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
}
