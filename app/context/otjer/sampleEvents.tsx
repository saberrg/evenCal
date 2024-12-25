// Temporary: Using mock data while API is in development
import { Event } from '../../object/eventObject';

export const mockEvents: Event[] = [
    {
      eventId: "123e4567-e89b-12d3-a456-426614174000",
      venueName: "The Grand Ballroom",
      venueAddress: "123 Main St, Anytown, USA", 
      startDateTime: "2024-02-15T18:00",
      endDateTime: "2024-02-15T23:00",
      createdBy: "John Smith",
      numberOfTickets: 200,
      ticketPrice: 75.00,
      addOns: ["VIP Access", "Drink Tickets"],
      food: ["Appetizers", "Main Course", "Dessert"],
      isPaid: true,
      amountBilled: 15000
    },
    {
      eventId: "223e4567-e89b-12d3-a456-426614174001", 
      venueName: "Sunset Garden",
      venueAddress: "456 Park Ave, Anytown, USA",
      startDateTime: "2024-03-20T16:00",
      endDateTime: "2024-03-20T21:00",
      createdBy: "Jane Doe",
      numberOfTickets: 100,
      ticketPrice: 50.00,
      addOns: [],
      food: [],
      isPaid: false,
      amountBilled: 0
    },
    {
      eventId: "323e4567-e89b-12d3-a456-426614174002",
      venueName: "City Convention Center", 
      venueAddress: "",
      startDateTime: "2024-04-10T09:00",
      endDateTime: "2024-04-10T17:00",
      createdBy: "Bob Wilson",
      numberOfTickets: 500,
      ticketPrice: 125.00,
      addOns: ["Workshop Materials", "Lunch"],
      food: ["Continental Breakfast", "Boxed Lunch"],
      isPaid: true,
      amountBilled: 62500
    },
    {
      eventId: "423e4567-e89b-12d3-a456-426614174003",
      venueName: "Mountain View Resort",
      venueAddress: "789 Mountain Rd, Anytown, USA",
      startDateTime: "",
      endDateTime: "",
      createdBy: "Sarah Johnson", 
      numberOfTickets: 150,
      ticketPrice: 0,
      addOns: [],
      food: [],
      isPaid: false,
      amountBilled: 0
    }
] as const;