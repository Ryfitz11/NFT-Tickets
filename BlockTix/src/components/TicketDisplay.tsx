import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Event } from '../types';
import { Calendar, Clock, Ticket } from 'lucide-react';

interface TicketDisplayProps {
  event: Event;
  ticketId: string;
  isUsed: boolean;
}

export function TicketDisplay({ event, ticketId, isUsed }: TicketDisplayProps) {
  // Create a ticket data object that will be encoded in the QR code
  const ticketData = JSON.stringify({
    eventId: event.id,
    ticketId: ticketId.toString(),
    eventName: event.name,
    date: event.date.getTime(),
    price: event.price
  });

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Event Image */}
        <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Ticket className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-xl font-bold">{event.name}</h3>
            </div>
          </div>
        </div>

        {/* Ticket Content */}
        <div className="p-6">
          <div className="flex flex-col space-y-3 mb-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{format(event.date, 'PPP')}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2" />
              <span>{format(event.date, 'p')}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className={`flex justify-center mb-4 ${isUsed ? 'opacity-50' : ''}`}>
            <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
              <QRCodeSVG
                value={ticketData}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          {/* Ticket Info */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-900">
              Ticket ID: <span className="font-mono">{ticketId}</span>
            </p>
            {isUsed && (
              <div className="bg-red-50 text-red-600 py-2 px-4 rounded-md text-sm font-medium">
                This ticket has been used
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}