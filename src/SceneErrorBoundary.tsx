import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onFallback: () => void;
};

type State = {
  failed: boolean;
};

// A scene failure should never take the readable portfolio down with it.
export default class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("The 3D scene failed; switching to the simple portfolio view.", error, info);
    this.props.onFallback();
  }

  render() {
    if (this.state.failed) {
      return <p className="scene-error" role="status">The 3D scene is unavailable. The simple portfolio view is enabled.</p>;
    }
    return this.props.children;
  }
}
