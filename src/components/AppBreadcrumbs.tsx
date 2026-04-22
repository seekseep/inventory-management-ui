import { Link, useMatches } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'

interface Crumb {
  title: string
  path: string
}

function buildCrumbs(
  matches: Array<{ pathname: string; staticData?: { title?: string } }>,
): Crumb[] {
  const crumbs: Crumb[] = []
  for (const match of matches) {
    const title = match.staticData?.title
    if (title) {
      crumbs.push({ title, path: match.pathname })
    }
  }
  return crumbs
}

export function AppBreadcrumbs() {
  const matches = useMatches()
  const crumbs = buildCrumbs(matches)

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <BreadcrumbItem key={crumb.path}>
              {index > 0 && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
