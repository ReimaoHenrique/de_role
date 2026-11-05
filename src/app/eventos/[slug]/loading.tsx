import { Card, CardContent } from "@/components/ui/card";

export default function EventLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 h-9 w-40 animate-pulse rounded bg-muted" />
        <Card className="overflow-hidden">
          <div className="h-72 animate-pulse bg-muted" />
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
