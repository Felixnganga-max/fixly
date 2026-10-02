import { Component } from "react";

// Keeps one broken section from blanking the whole page.
export default class SafeSection extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(`[${this.props.name || "section"}]`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-6 py-4 text-sm">
          {this.props.name || "This section"} failed to render: {String(this.state.error.message || this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}