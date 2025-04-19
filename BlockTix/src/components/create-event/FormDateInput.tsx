import React from 'react';

interface FormDateInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  includeTime?: boolean;
}

export function FormDateInput({ 
  label, 
  name, 
  value, 
  onChange, 
  error,
  includeTime = false
}: FormDateInputProps) {
  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={includeTime ? "datetime-local" : "date"}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        min={includeTime ? `${today}T00:00` : today}
        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
          ${error ? 'border-red-300' : 'border-gray-300'}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}