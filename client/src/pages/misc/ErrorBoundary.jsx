import { Component } from "react";

/**
 * React ErrorBoundary — catches render-time JS errors anywhere in the tree
 * and shows a friendly fallback instead of a blank white screen.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, message: "" };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, message: error?.message || "An unexpected error occurred." };
    }

    componentDidCatch(error, info) {
        console.error("[ErrorBoundary]", error, info);
    }

    handleReset = () => {
        this.setState({ hasError: false, message: "" });
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100vh",
                        gap: "1rem",
                        fontFamily: "sans-serif",
                        padding: "2rem",
                        textAlign: "center",
                    }}
                >
                    <h2 style={{ fontSize: "1.5rem", color: "#e53e3e" }}>Something went wrong</h2>
                    <p style={{ color: "#555", maxWidth: "400px" }}>{this.state.message}</p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: "0.6rem 1.4rem",
                            background: "#3182ce",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "1rem",
                        }}
                    >
                        Go to Home
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
