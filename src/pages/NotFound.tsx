import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/primitives'

export function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-black text-gradient">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Tool not found</h1>
      <p className="mt-2 max-w-sm text-slate-400">
        The page you're looking for doesn't exist. Head back to the toolbox to keep going.
      </p>
      <Link to="/app" className="mt-6">
        <Button>Back to tools</Button>
      </Link>
    </div>
  )
}
