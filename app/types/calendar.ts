import { EventApi } from '@fullcalendar/core';

export interface CustomEventApi extends EventApi {
  extendedProps: {
    isVenueSelected: boolean;
    venueName?: string;
  };
} 