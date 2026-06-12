import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xs sm:max-w-sm mx-auto text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
          <span className="text-red-500 text-2xl sm:text-3xl">!</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Error
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 break-words">
          {error}
        </p>
        <Button
          onClick={onRetry}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
