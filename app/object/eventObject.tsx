import { v4 as uuidv4 } from 'uuid';

export interface Event {
  eventId: string; // UUID v4 format
  venueName: string;
  venueAddress: string;
  startDateTime: string; // YYYY-MM-DDTHH:mm format
  endDateTime: string;
  createdBy: string;
  numberOfTickets: number;
  ticketPrice: number;
  addOns: string[];
  food: string[];
  isPaid: boolean;
  amountBilled: number;
}

export const defaultEvent: Event = {
  eventId: uuidv4(), // Generate a new UUID by default
  venueName: '',
  venueAddress: '',
  startDateTime: '',
  endDateTime: '',
  createdBy: '',
  numberOfTickets: 0,
  ticketPrice: 0,
  addOns: [],
  food: [],
  isPaid: false,
  amountBilled: 0
};

// Helper function to create a new event with a guaranteed unique ID
export const createNewEvent = (): Event => ({
  ...defaultEvent,
  eventId: uuidv4(), // Always generate a fresh UUID for new events
});
