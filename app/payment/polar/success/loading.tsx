import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Loading...</h1>
        <p className="text-muted-foreground">Please wait while we load your payment information</p>
      </div>
    </div>
  )
}
