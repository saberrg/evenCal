export interface Event {
    id: string // UUID v4 format
    name: string
    venueName: string
    venueAddress: string
    startDateTime: string // YYYY-MM-DDTHH:mm format
    endDateTime: string
    createdBy: string
    numberOfTickets: number
    ticketPrice: number
    addOns: string[]
    food: string[]
    isPaid: boolean
    amountBilled: number
    imageUrl: string
    description: string
  }
  
  