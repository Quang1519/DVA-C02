"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()

  const handleDitectrevClick = () => {
    router.push('/1')
  }

  const handleDumpClick = () => {
    router.push('/dumps/1')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
      <h1 className="text-3xl font-bold">Welcome</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleDitectrevClick} 
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
        >
          Ditectrev question
        </Button>
        <Button 
          onClick={handleDumpClick} 
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
        >
          Dump question
        </Button>
      </div>
    </div>
  )
}

