import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function BillingLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Certification Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-24" />
        </CardContent>
      </Card>

      {/* Alerts Skeleton */}
      <Skeleton className="h-32" />
      <Skeleton className="h-24" />

      {/* Buttons Skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 flex-1" />
      </div>
    </div>
  )
}
