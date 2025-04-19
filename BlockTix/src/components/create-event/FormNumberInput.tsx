import React from 'react';

interface FormNumberInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  min?: string;
  max?: string;
  step?: string;
  helper?: string;
  conversion?: string;
}

export function FormNumberInput({ 
  label, 
  name, 
  value, 
  onChange, 
  error,
  min = "1",
  max,
  step = "1",
  helper,
  conversion
}: FormNumberInputProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type="number"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
            ${error ? 'border-red-300' : 'border-gray-300'}`}
        />
        {conversion && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{conversion}</span>
          </div>
        )}
      </div>
      {helper && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}