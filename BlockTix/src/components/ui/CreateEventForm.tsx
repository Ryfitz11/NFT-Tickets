import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { useAppSelector } from '../../redux/hooks';
import { Web3Service } from '../../services/web3';
import { CONTRACT_ADDRESSES } from '../../config/contracts';

interface FormData {
  erc721Name: string;
  erc721Symbol: string;
  eventName: string;
  date: Date | null;
  totalTickets: string;
  ticketPriceInUSDC: string;
  ticketLimit: string;
  eventImage: File | null;
}

interface FormErrors {
  [key: string]: string;
}

const SUPABASE_UPLOAD_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`;

const CreateEventForm: React.FC = () => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    erc721Name: '',
    erc721Symbol: '',
    eventName: '',
    date: null,
    totalTickets: '',
    ticketPriceInUSDC: '',
    ticketLimit: '',
    eventImage: null,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.erc721Name) newErrors.erc721Name = 'NFT Collection name is required';
    if (!formData.erc721Symbol) newErrors.erc721Symbol = 'NFT Collection symbol is required';
    if (!formData.eventName) newErrors.eventName = 'Event name is required';
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else if (formData.date.getTime() <= Date.now()) {
      newErrors.date = 'Event date must be in the future';
    }
    if (!formData.totalTickets || parseInt(formData.totalTickets) <= 0) {
      newErrors.totalTickets = 'Total tickets must be greater than 0';
    }
    if (!formData.ticketPriceInUSDC || parseFloat(formData.ticketPriceInUSDC) <= 0) {
      newErrors.ticketPriceInUSDC = 'Ticket price must be greater than 0';
    }
    if (!formData.ticketLimit || parseInt(formData.ticketLimit) <= 0) {
      newErrors.ticketLimit = 'Ticket limit must be greater than 0';
    }
    if (parseInt(formData.ticketLimit) > parseInt(formData.totalTickets)) {
      newErrors.ticketLimit = 'Ticket limit cannot exceed total tickets';
    }
    if (!formData.eventImage) newErrors.eventImage = 'Event image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, eventImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('image', formData.eventImage!);

      const uploadResponse = await fetch(SUPABASE_UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formDataToSend,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to IPFS');
      }

      const { ipfsHash } = await uploadResponse.json();
      
      setIsCreating(true);
      const priceInAtomicUnits = Math.floor(parseFloat(formData.ticketPriceInUSDC) * 1_000_000); // 6 decimals for USDC
      const dateTimestamp = Math.floor(formData.date!.getTime() / 1000);

      await Web3Service.createEvent({
        erc721Name: formData.erc721Name,
        erc721Symbol: formData.erc721Symbol,
        eventName: formData.eventName,
        date: dateTimestamp,
        totalTickets: parseInt(formData.totalTickets),
        ticketPriceInUSDC: priceInAtomicUnits,
        ticketLimit: parseInt(formData.ticketLimit),
        usdcTokenAddress: CONTRACT_ADDRESSES.mockUSDC,
        eventImageIPFSPath: ipfsHash,
      });

      // Reset form
      setFormData({
        erc721Name: '',
        erc721Symbol: '',
        eventName: '',
        date: null,
        totalTickets: '',
        ticketPriceInUSDC: '',
        ticketLimit: '',
        eventImage: null,
      });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setIsUploading(false);
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium font-['Fira_Code'] mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            NFT Collection Name
          </label>
          <input
            type="text"
            value={formData.erc721Name}
            onChange={(e) => setFormData({ ...formData, erc721Name: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg font-['Fira_Code'] ${
              darkMode
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-300'
            } border focus:ring-2 focus:ring-[#0288D1]`}
            placeholder="BlockTix Concert Tickets"
          />
          {errors.erc721Name && (
            <p className="mt-1 text-sm text-red-500 font-['Fira_Code']">{errors.erc721Name}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium font-['Fira_Code'] mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            NFT Collection Symbol
          </label>
          <input
            type="text"
            value={formData.erc721Symbol}
            onChange={(e) => setFormData({ ...formData, erc721Symbol: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg font-['Fira_Code'] ${
              darkMode
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-300'
            } border focus:ring-2 focus:ring-[#0288D1]`}
            placeholder="BTIX"
          />
          {errors.erc721Symbol && (
            <p className="mt-1 text-sm text-red-500 font-['Fira_Code']">{errors.erc721Symbol}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={`block text-sm font-medium font-['Fira_Code'] mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Event Name
          </label>
          <input
            type="text"
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg font-['Fira_Code'] ${
              darkMode
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-300'
            } border focus:ring-2 focus:ring-[#0288D1]`}
            placeholder="Summer Music Festival 2025"
          />
          {errors.eventName && (
            <p className="mt-1 text-sm text-red-500 font-['Fira_Code']">{errors.eventName}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium font-['Fira_Code'] mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Event Date & Time
          </label>
          <DatePicker
            selected={formData.date}
            onChange={(date: Date) => setFormData({ ...formData, date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={new Date()}
            className={`w-full px-4 py-2 rounded-lg font-['Fira_Code'] ${
              darkMode
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-300'
            } border focus:ring-2 focus:ring-[#0288D1]`}
            placeholderText="Select date and time"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500 font-['Fira_Code']">{errors.date}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium font-['Fira_Code'] mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Total Tickets
          </label>
          <input
            type="number"
            value={formData.totalTickets}
            onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg font-['Fira_Code'] ${
              darkMode
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-300'
            } border focus:ring-2 focus:ring-[#0288D1]`}
            min="1"
            placeholder="1000"
          />
          {errors.totalTickets && (
            <p className="mt-1 text-sm text-red-500 font-['Fira_Code']">{errors.totalTickets}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium font-['Fira_Code'] mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Ticket Price (USDC)
          </label>
          <input
            type="number"
            value={formData.ticketPriceInUSDC}
            onChange={(e) => setFormData({ ...formData, ticketPriceInUSDC: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg font-['Fira_Code'] ${
              darkMode
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-300'
            } border focus:ring-2 focus:ring-[#0288D1]`}
            min="0"
            step="0.000001"
            placeholder="10.00"
          />
          {errors.ticketPriceInUSDC && (
            <p className="mt-1 text-sm text-red-500 font-['Fira_Code']">{errors.ticketPriceInUSDC}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium font-['Fira_Code'] mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Tickets Per Buyer Limit
          </label>
          <input
            type="number"
            value={formData.ticketLimit}
            onChange={(e) => setFormData({ ...formData, ticketLimit: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg font-['Fira_Code'] ${
              darkMode
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-300'
            } border focus:ring-2 focus:ring-[#0288D1]`}
            min="1"
            placeholder="4"
          />
          {errors.ticketLimit && (
            <p className="mt-1 text-sm text-red-500 font-['Fira_Code']">{errors.ticketLimit}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={`block text-sm font-medium font-['Fira_Code'] mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Event Image
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 ${
              darkMode
                ? 'border-gray-600 bg-gray-700'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-center">
              {imagePreview ? (
                <div className="relative w-full max-w-md">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, eventImage: null });
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <Upload className={darkMode ? 'text-gray-400' : 'text-gray-600'} size={32} />
                  <p className={`mt-2 text-sm font-['Fira_Code'] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Click to upload or drag and drop
                  </p>
                  <p className={`text-xs font-['Fira_Code'] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    PNG, JPG, GIF up to 5MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`mt-4 block w-full text-sm font-['Fira_Code'] ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium ${
                  darkMode
                    ? 'file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500'
                    : 'file:bg-[#0288D1] file:text-white hover:file:bg-[#0277BD]'
                }`}
              />
            </div>
          </div>
          {errors.eventImage && (
            <p className="mt-1 text-sm text-red-500 font-['Fira_Code']">{errors.eventImage}</p>
          )}
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
          <p className="font-['Fira_Code']">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isUploading || isCreating}
          className={`px-6 py-3 rounded-lg font-['Fira_Code'] font-medium flex items-center ${
            darkMode
              ? 'bg-[#0288D1] text-white hover:bg-[#0277BD] disabled:bg-gray-700'
              : 'bg-[#0288D1] text-white hover:bg-[#0277BD] disabled:bg-gray-300'
          }`}
        >
          {isUploading || isCreating ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              {isUploading ? 'Uploading Image...' : 'Creating Event...'}
            </>
          ) : (
            'Create Event'
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateEventForm;