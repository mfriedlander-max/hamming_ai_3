import { OptimizerClient } from '@/components/optimizer/OptimizerClient'

export default function OptimizerPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Subscription Optimizer
        </h1>
        <p className="text-gray-600 mt-1">
          Get an AI-powered 12-month plan to maximize your content access while
          minimizing costs
        </p>
      </div>

      <OptimizerClient />
    </div>
  )
}
