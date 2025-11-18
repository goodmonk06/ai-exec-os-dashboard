import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message?: string;
  title?: string;
}

export function ErrorMessage({
  message = "An error occurred",
  title = "Error",
}: ErrorMessageProps) {
  return (
    <div className="flex items-center gap-3 p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
      <AlertCircle className="h-5 w-5 text-destructive" />
      <div>
        <h3 className="font-semibold text-destructive">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
