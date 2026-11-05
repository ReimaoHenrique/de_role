import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HomeLoading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto mb-10 max-w-3xl space-y-4 text-center">
        <div className="mx-auto h-6 w-40 animate-pulse rounded-full bg-muted" />
        <div className="mx-auto h-12 w-3/4 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mx-auto h-10 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-48 animate-pulse bg-muted" />
            <CardHeader className="space-y-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
