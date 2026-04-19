import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';

/**
 * Premium MultiSelect Component
 * @param {Object} props
 * @param {Array} props.options - Array of objects { label, value }
 * @param {Array} props.value - Array of selected values
 * @param {Function} props.onChange - Callback function(selectedValues)
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.label - Search field label
 */
export default function MultiSelect({ 
    options = [], 
    value = [], 
    onChange, 
    placeholder = "Select options...",
    label = "Search...",
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Toggle option selection
    const toggleOption = (optionValue) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    // Remove specific tag
    const removeTag = (e, optionValue) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== optionValue));
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get selected option objects for tags
    const selectedOptions = options.filter(opt => value.includes(opt.value));

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Main Input Area */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    min-h-[42px] w-full p-1.5 rounded-lg border bg-white cursor-pointer transition-all flex flex-wrap gap-1.5 items-center
                    ${isOpen ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'}
                `}
            >
                {selectedOptions.length > 0 ? (
                    selectedOptions.map(opt => (
                        <span 
                            key={opt.value}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-xs font-semibold border border-green-100"
                        >
                            {opt.label}
                            <button 
                                onClick={(e) => removeTag(e, opt.value)}
                                className="hover:text-green-900 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))
                ) : (
                    <span className="text-sm text-gray-400 px-2">{placeholder}</span>
                )}
                
                <div className="ml-auto pr-1 text-gray-400">
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search Field */}
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                            <input
                                type="text"
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-md text-sm focus:ring-1 focus:ring-green-500"
                                placeholder={label}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <div 
                                        key={option.value}
                                        onClick={() => toggleOption(option.value)}
                                        className={`
                                            flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm transition-colors
                                            ${isSelected ? 'bg-green-50 text-green-800' : 'text-gray-700 hover:bg-gray-50'}
                                        `}
                                    >
                                        <span className="font-medium">{option.label}</span>
                                        {isSelected && (
                                            <div className="bg-green-100 p-0.5 rounded-full text-green-600">
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-xs">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
