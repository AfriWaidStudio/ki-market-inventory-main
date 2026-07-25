import { Component, ReactNode, ErrorInfo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 border border-rose-500/20 bg-rose-500/5 rounded-[2rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <AlertCircle className="w-8 h-8 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)] mb-3" />
          <h3 className="text-sm font-bold text-rose-200 mb-1">Component Failed</h3>
          <p className="text-xs text-rose-400/80 mb-4 text-center max-w-[250px] truncate">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
