import Image from 'next/image';

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
        <Image 
          src={imageUrl} 
          alt="Hero background" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative h-full flex items-center justify-start pl-8">
        <div className="text-left space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          <p className="text-lg md:text-xl">{venue}</p>
          <p className="text-md md:text-lg">
            {date} • {time}
          </p>
        </div>
      </div>
    </div>
  )
}