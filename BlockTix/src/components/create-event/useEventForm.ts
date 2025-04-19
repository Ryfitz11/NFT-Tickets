import { useState, useCallback } from 'react';
import { useEventFactory } from '../../contracts/useEventFactory';
import { FormData } from '../../types';

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  eventName: '',
  name: '',
  symbol: '',
  dateTime: '',
  totalTickets: '',
  ticketPrice: '',
  ticketLimit: '',
  imageUrl: '',
  description: ''
};

export function useEventForm(onSuccess?: () => void) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const { createEvent, isCreating } = useEventFactory();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.eventName) newErrors.eventName = 'Event name is required';
    if (!formData.name) newErrors.name = 'Contract name is required';
    if (!formData.symbol) newErrors.symbol = 'Symbol is required';
    if (!formData.dateTime) newErrors.dateTime = 'Date and time are required';
    if (!formData.totalTickets) newErrors.totalTickets = 'Total tickets is required';
    if (!formData.ticketPrice) newErrors.ticketPrice = 'Ticket price is required';
    if (!formData.ticketLimit) newErrors.ticketLimit = 'Ticket limit is required';
    if (!formData.imageUrl) newErrors.imageUrl = 'Event image is required';
    if (!formData.description) newErrors.description = 'Event description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const timestamp = Math.floor(new Date(formData.dateTime).getTime() / 1000);
    
    const success = await createEvent({
      eventName: formData.eventName,
      name: formData.name,
      symbol: formData.symbol,
      date: timestamp,
      totalTickets: parseInt(formData.totalTickets),
      ticketPrice: formData.ticketPrice,
      ticketLimit: parseInt(formData.ticketLimit),
      imageUrl: formData.imageUrl,
      description: formData.description
    });

    if (success && onSuccess) {
      onSuccess();
    }
  }, [formData, createEvent, onSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return {
    formData,
    handleSubmit,
    handleChange,
    isSubmitting: isCreating,
    errors,
    setFormData
  };
}