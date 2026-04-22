import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { validateApiKey } from '#/lib/api'
import { setApiKey } from '#/lib/auth'

export const Route = createFileRoute('/_guest/login')({
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const valid = await validateApiKey(key)
      if (valid) {
        setApiKey(key)
        await router.navigate({ to: '/' })
      } else {
        setError('APIキーが無効です')
      }
    } catch {
      setError('接続エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">在庫管理システム</CardTitle>
        <CardDescription>APIキーを入力してログインしてください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">APIキー</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="API キーを入力"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
