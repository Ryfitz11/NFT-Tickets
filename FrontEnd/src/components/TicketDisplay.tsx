import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Event } from '../types';

interface TicketDisplayProps {
  event: Event;
  ticketId: string;
  isUsed: boolean;
}

export function TicketDisplay({ event, ticketId, isUsed }: TicketDisplayProps) {
  // Create a ticket data object that will be encoded in the QR code
  // Convert any potential BigInt values to strings
  const ticketData = JSON.stringify({
    eventId: event.id,
    ticketId: ticketId.toString(),
    eventName: event.name,
    date: event.date.getTime(), // Convert Date to timestamp
    price: event.price
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
        <p className="text-gray-600">{format(event.date, 'PPP')}</p>
      </div>

      <div className="flex justify-center mb-4">
        <div className={`p-4 bg-white rounded-lg ${isUsed ? 'opacity-50' : ''}`}>
          <QRCodeSVG
            value={ticketData}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-gray-900">Ticket ID: {ticketId}</p>
        {isUsed && (
          <p className="text-sm font-medium text-red-600">
            This ticket has been used
          </p>
        )}
      </div>
    </div>
  );
}