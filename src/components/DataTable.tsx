import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useState } from 'react'

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  isLoading?: boolean
  onRowClick?: (row: TData) => void
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  pageIndex?: number
  onPageIndexChange?: (value: number) => void
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 20

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  onRowClick,
  globalFilter: externalFilter,
  onGlobalFilterChange,
  pageIndex: externalPageIndex,
  onPageIndexChange,
  pageSize = DEFAULT_PAGE_SIZE,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [internalFilter, setInternalFilter] = useState('')
  const [internalPageIndex, setInternalPageIndex] = useState(0)

  const globalFilter = externalFilter ?? internalFilter
  const pageIndex = externalPageIndex ?? internalPageIndex

  const handleFilterChange = (value: string) => {
    if (onGlobalFilterChange) {
      onGlobalFilterChange(value)
    } else {
      setInternalFilter(value)
    }
    if (onPageIndexChange) {
      onPageIndexChange(0)
    } else {
      setInternalPageIndex(0)
    }
  }

  const handlePageIndexChange = (value: number) => {
    if (onPageIndexChange) {
      onPageIndexChange(value)
    } else {
      setInternalPageIndex(value)
    }
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onGlobalFilterChange: handleFilterChange,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater
      handlePageIndexChange(next.pageIndex)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  const pageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="検索..."
          value={globalFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.getCanSort()
                        ? 'cursor-pointer select-none'
                        : ''
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanSort() &&
                        (header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="size-3.5" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown className="size-3.5" />
                        ) : (
                          <ArrowUpDown className="size-3.5 text-muted-foreground" />
                        ))}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer' : ''}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length}件中{' '}
            {currentPage * pageSize + 1}-
            {Math.min(
              (currentPage + 1) * pageSize,
              table.getFilteredRowModel().rows.length,
            )}
            件を表示
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 text-sm">
              {currentPage + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
