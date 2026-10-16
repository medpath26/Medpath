"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; onReset?: () => void };
type State = { hasError: boolean; message: string };

export class WorkspaceErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || "Unknown rendering error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("MedPath workspace render error", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <section className="panel" role="alert" style={{ maxWidth: "48rem", margin: "2rem auto" }}>
        <h2>We couldn't load this workspace view.</h2>
        <p>Your account and saved learning progress have not been changed by this error.</p>
        <p>Technical detail: <code>{this.state.message}</code></p>
        <button className="primary compact" type="button" onClick={() => {
          this.setState({ hasError: false, message: "" });
          this.props.onReset?.();
        }}>Return to dashboard</button>
      </section>
    );
  }
}
