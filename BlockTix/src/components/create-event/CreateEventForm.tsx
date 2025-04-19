import React from 'react';
import { useEventForm } from './useEventForm';
import { FormInput } from './FormInput';
import { FormDateInput } from './FormDateInput';
import { FormNumberInput } from './FormNumberInput';
import { ImageUpload } from './ImageUpload';
import { Loader } from 'lucide-react';

interface CreateEventFormProps {
  onSuccess?: () => void;
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const { formData, handleSubmit, handleChange, isSubmitting, errors, setFormData } = useEventForm(onSuccess);

  // Calculate price in USD (example rate: 1 ETH = $3000)
  const ethToUsd = 3000;
  const priceInUsd = formData.ticketPrice ? Number(formData.ticketPrice) * ethToUsd : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
      
      <FormInput
        label="Event Name"
        name="eventName"
        value={formData.eventName}
        onChange={handleChange}
        error={errors.eventName}
      />

      <FormInput
        label="Contract Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />

      <FormInput
        label="Symbol"
        name="symbol"
        value={formData.symbol}
        onChange={handleChange}
        error={errors.symbol}
      />

      <FormDateInput
        label="Event Date & Time"
        name="dateTime"
        value={formData.dateTime}
        onChange={handleChange}
        error={errors.dateTime}
        includeTime={true}
      />

      <FormNumberInput
        label="Total Tickets"
        name="totalTickets"
        value={formData.totalTickets}
        onChange={handleChange}
        error={errors.totalTickets}
        min="1"
        helper="Maximum number of tickets that can be sold"
      />

      <FormNumberInput
        label="Ticket Price (ETH)"
        name="ticketPrice"
        value={formData.ticketPrice}
        onChange={handleChange}
        error={errors.ticketPrice}
        min="0.0001"
        step="0.0001"
        helper={`Approximate price in USD: $${priceInUsd.toFixed(2)}`}
        conversion="ETH"
      />

      <FormNumberInput
        label="Ticket Limit per Wallet"
        name="ticketLimit"
        value={formData.ticketLimit}
        onChange={handleChange}
        error={errors.ticketLimit}
        min="1"
        helper="Maximum number of tickets a single wallet can purchase"
      />

      <ImageUpload
        value={formData.imageUrl}
        onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
        error={errors.imageUrl}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Event Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
            ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
      >
        {isSubmitting ? (
          <>
            <Loader className="animate-spin h-5 w-5 mr-2" />
            Creating Event...
          </>
        ) : (
          'Create Event'
        )}
      </button>
    </form>
  );
}