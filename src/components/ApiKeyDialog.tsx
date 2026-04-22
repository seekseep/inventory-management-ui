import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { validateApiKey } from '#/lib/api/auth'
import { setApiKey } from '#/lib/auth'

interface ApiKeyDialogProps {
  open: boolean
  onAuthenticated: () => void
}

export function ApiKeyDialog({ open, onAuthenticated }: ApiKeyDialogProps) {
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: {
      apiKey: '',
    },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const valid = await validateApiKey(value.apiKey)
        if (valid) {
          setApiKey(value.apiKey)
          onAuthenticated()
        } else {
          setError('APIキーが無効です')
        }
      } catch {
        setError('接続エラーが発生しました')
      }
    },
  })

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>在庫管理システム</DialogTitle>
          <DialogDescription>
            APIキーを入力してログインしてください
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="apiKey"
            validators={{
              onSubmit: ({ value }) =>
                !value ? 'APIキーを入力してください' : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="api-key">APIキー</Label>
                <Input
                  id="api-key"
                  type="password"
                  autoComplete="off"
                  placeholder="API キーを入力"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'ログイン中...' : 'ログイン'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  )
}
