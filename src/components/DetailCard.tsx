import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'

interface DetailField {
  label: string
  value: React.ReactNode
}

interface DetailCardProps {
  title: string
  fields: DetailField[]
  isLoading?: boolean
}

export function DetailCard({ title, fields, isLoading }: DetailCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-sm text-muted-foreground">{field.label}</dt>
              <dd className="mt-0.5 text-sm font-medium">
                {field.value ?? '—'}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
