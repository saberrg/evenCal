interface HeroSectionProps {
  imageUrl: string
  title: string
  venue: string
  date: string
  time: string
}

export function HeroSection({ imageUrl, title, venue, date, time }: HeroSectionProps) {
  return (
    <div className="relative h-[60vh] bg-[#1e1e2e] text-white">
      <div className="absolute inset-0">
        {/* Add your hero image here */}
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold">{title}</h1>
          <p className="text-xl md:text-2xl">{venue}</p>
          <p className="text-lg md:text-xl">
            {date} • {time}
          </p>
        </div>
      </div>
    </div>
  )
}