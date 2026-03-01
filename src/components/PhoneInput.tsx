// src/components/PhoneInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { countries, groupCountriesByFirstLetter } from '../data/countries';
import type { Country } from '../data/countries';
import '../assets/css/PhoneInput.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  name?: string;
  placeholder?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  name = 'phone_number',
  placeholder = 'Phone number'
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [localNumber, setLocalNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLetter, setActiveLetter] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const groupedCountries = groupCountriesByFirstLetter();

  useEffect(() => {
    // Parse initial value
    if (value) {
      const matchedCountry = countries.find(c => value.startsWith(c.dialCode));
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setLocalNumber(value.slice(matchedCountry.dialCode.length).trim());
      } else {
        setLocalNumber(value);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    const fullNumber = `${country.dialCode} ${localNumber}`.trim();
    onChange(fullNumber);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocalNumber = e.target.value.replace(/[^0-9\s\-\(\)]/g, '');
    setLocalNumber(newLocalNumber);
    const fullNumber = `${selectedCountry.dialCode} ${newLocalNumber}`.trim();
    onChange(fullNumber);
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`country-group-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveLetter(letter);
  };

  const letters = Array.from(groupedCountries.keys()).sort();

  return (
    <div className="phone-input-container" ref={dropdownRef}>
      <div 
        className={`phone-input-wrapper ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="country-selector">
          <span className="selected-flag">{selectedCountry.flag}</span>
          <span className="selected-dial-code">{selectedCountry.dialCode}</span>
          <svg 
            className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <input
          type="tel"
          name={name}
          value={localNumber}
          onChange={handleLocalNumberChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="phone-number-input"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {isOpen && (
        <div className="country-dropdown">
          <div className="country-search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="country-search-input"
            />
          </div>

          {!searchTerm && (
            <div className="alphabet-navigation">
              {letters.map(letter => (
                <button
                  key={letter}
                  className={`letter-nav ${activeLetter === letter ? 'active' : ''}`}
                  onClick={() => scrollToLetter(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

          <div className="country-list">
            {searchTerm ? (
              // Search results
              filteredCountries.map(country => (
                <div
                  key={country.code}
                  className={`country-item ${selectedCountry.code === country.code ? 'selected' : ''}`}
                  onClick={() => handleCountrySelect(country)}
                >
                  <span className="country-flag">{country.flag}</span>
                  <span className="country-name">{country.name}</span>
                  <span className="country-dial-code">{country.dialCode}</span>
                </div>
              ))
            ) : (
              // Grouped by letter
              Array.from(groupedCountries.entries()).map(([letter, countryList]) => (
                <div key={letter} id={`country-group-${letter}`} className="country-group">
                  <div className="country-group-header">{letter}</div>
                  {countryList.map(country => (
                    <div
                      key={country.code}
                      className={`country-item ${selectedCountry.code === country.code ? 'selected' : ''}`}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span className="country-flag">{country.flag}</span>
                      <span className="country-name">{country.name}</span>
                      <span className="country-dial-code">{country.dialCode}</span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && <span className="phone-error-text">{error}</span>}
      <small className="form-note">Select country and enter phone number</small>
    </div>
  );
};

export default PhoneInput;