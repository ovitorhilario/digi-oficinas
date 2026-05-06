import { Inbox, type LucideIcon, Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'

export function SimpleListCard<T extends { id: string }>({
  title,
  items,
  renderItem,
  onEdit,
  onDelete,
  headerAction,
  emptyTitle = 'Nada por aqui ainda',
  emptyDescription = 'Adicione o primeiro item para comecar a preencher esta secao.',
  emptyIcon: EmptyIcon = Inbox,
}: {
  title: string
  items: T[]
  renderItem: (item: T) => React.ReactNode
  onEdit: (item: T) => void
  onDelete: (id: string) => void
  headerAction?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
}) {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CardTitle>{title}</CardTitle>
          <span className="inline-flex items-center rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {items.length}
          </span>
        </div>
        {headerAction}
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex min-h-40 flex-col gap-4 rounded-lg border border-border/70 bg-background p-4 transition-colors hover:border-border hover:bg-muted/30"
            >
              <div className="grid min-w-0 gap-2 text-sm">
                {renderItem(item)}
              </div>
              <footer className="mt-auto flex flex-wrap justify-end gap-2 border-t border-border/70 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEdit(item)}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 />
                </Button>
              </footer>
            </div>
          ))
        ) : (
          <Empty className="col-span-full rounded-lg shadow-none">
            <EmptyMedia variant="icon">
              <EmptyIcon />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
