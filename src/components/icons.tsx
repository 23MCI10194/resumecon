import { FileText } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <FileText className="h-7 w-7 text-primary" />
      <h1 className="text-2xl font-bold font-headline text-foreground">
        Resume<span className="text-primary">Struct</span>
      </h1>
    </div>
  )
}
