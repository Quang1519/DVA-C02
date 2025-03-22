import Image from "next/image"

interface QuizCardProps {
  label: string
  selected?: boolean
  bgColor?: string
  image?: string
}

export default function QuizCard({ label, selected = false, bgColor = "bg-white", image }: QuizCardProps) {
  return (
    <div className={`p-3 sm:p-4 rounded-md border border-gray-200 cursor-pointer transition-colors ${bgColor}`}>
      <p className="text-gray-800 text-sm sm:text-base">{label}</p>
      {image && (
        <div className="relative mt-2 w-full h-[200px]"> {/* Adjust height as needed */}
          <Image 
            src={`/${image}`}
            alt={label}
            fill
            className="object-contain rounded-md"
            priority
          />
        </div>
      )}
    </div>
  )
}

