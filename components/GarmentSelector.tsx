import React, { useState, useRef, useEffect } from 'react';
import type { Garment } from '../App';
import { UploadIcon, ChevronDownIcon } from './icons';

interface GarmentSelectorProps {
  onGarmentSelect: (garments: Record<string, Garment> | null) => void;
}

// Categorized garment types for better UX
const garmentCategories: Record<string, string[]> = {
  "Traditional / Ethnic": [
    "Abaya",
    "Blouse (Saree/Lehenga)",
    "Churidar",
    "Dupatta",
    "Gharara",
    "Kaftan (Ethnic)",
    "Kurti (Anarkali)",
    "Kurti (Flared)",
    "Kurti (Knee Length)",
    "Kurti (Long)",
    "Kurti (Short)",
    "Kurti (Straight Cut)",
    "Lehenga Skirt",
    "Patiala Salwar",
    "Salwar",
    "Saree (Ready-to-wear)",
    "Saree (Traditional)",
    "Sharara",
    "Straight Pants (Ethnic)"
  ],
  "Dresses & Jumpsuits": [
    "Co-ord Set",
    "Dress (A-Line)",
    "Dress (Bodycon)",
    "Dress (Knee Length)",
    "Dress (Maxi)",
    "Dress (Midi)",
    "Dress (Mini)",
    "Gown (Evening)",
    "Jumpsuit",
    "Romper"
  ],
  "Tops": [
    "Blouse (Western)",
    "Crop Top",
    "Kaftan (Top)",
    "Off-shoulder Top",
    "Peplum Top",
    "Shirt (Casual)",
    "Shirt (Formal)",
    "T-Shirt",
    "Tank Top",
    "Top",
    "Tunic",
    "Vest"
  ],
  "Bottoms": [
    "Dhoti Pants",
    "Jeans (Mom)",
    "Jeans (Skinny)",
    "Jeans (Wide Leg)",
    "Leggings",
    "Palazzo Pants",
    "Pant (Casual)",
    "Shorts",
    "Skirt (Long/Maxi)",
    "Skirt (Midi)",
    "Skirt (Mini)",
    "Straight Pants (Ethnic)",
    "Trousers (Formal)"
  ],
  "Unisex & Streetwear": [
    "Casual Wear",
    "Co-ord Set (Unisex)",
    "Ethnic Unisex Robe",
    "Fusion Wear",
    "Hoodie",
    "Jacket",
    "Kurta Set (Unisex)",
    "Matching Theme Outfit",
    "Night Suit (Unisex)",
    "Oversized T-Shirt",
    "Sweatshirt",
    "Track Suit"
  ],
  "Outerwear & Winter": [
    "Blazer", "Cardigan", "Coat", "Denim Jacket", "Pullover", "Shrug", "Sweater", "Waistcoat", "Winter Wear"
  ],
  "Nightwear & Lounge": [
    "Kaftan (Nightwear)", "Lounge Set", "Nighty (Long)", "Nighty (Short)"
  ],
  "Swimwear": [
    "Cover-up", "Swimsuit", "Swim Trunks"
  ],
  "Accessories": [
    "Beanie", "Cap", "Hat", "Scarf"
  ]
};

const GarmentSelector: React.FC<GarmentSelectorProps> = ({ onGarmentSelect }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { garment: Garment, fileName: string }>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Optional: Close on click outside if desired
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const garments = Object.keys(uploadedFiles).reduce<Record<string, Garment>>((acc, key) => {
      acc[key] = uploadedFiles[key].garment;
      return acc;
    }, {});
    onGarmentSelect(Object.keys(garments).length > 0 ? garments : null);
  }, [uploadedFiles, onGarmentSelect]);


  const fileToBase64 = (file: File): Promise<Garment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleTypeToggle = (type: string) => {
    const isCurrentlySelected = selectedTypes.includes(type);

    if (isCurrentlySelected) {
      setSelectedTypes(prev => prev.filter(t => t !== type));
      setUploadedFiles(prevFiles => {
        const newFiles = { ...prevFiles };
        delete newFiles[type];
        return newFiles;
      });
    } else {
      setSelectedTypes(prev => [...prev, type]);
    }
  };

  const removeType = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleTypeToggle(type);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const garment = await fileToBase64(file);
        setUploadedFiles(prev => ({
          ...prev,
          [type]: { garment, fileName: file.name },
        }));
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
  };

  // Filter categories based on search
  const filteredCategories = Object.entries(garmentCategories).reduce((acc, [category, types]) => {
    const filteredTypes = types.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filteredTypes.length > 0) {
      acc[category] = filteredTypes;
    }
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-8">
      <div className="relative z-20">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900 text-purple-300 text-sm font-extrabold border border-purple-700">1</span>
          Select Attire Types
        </h2>
        <p className="text-sm text-gray-400 mb-4 pl-10">
          Choose the garment pieces you want to visualize.
        </p>
        
        <div className="relative pl-10" ref={dropdownRef}>
          {/* Main Trigger / Chip Container */}
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full min-h-[60px] cursor-pointer bg-slate-800 border transition-all duration-200 rounded-xl px-2 py-2 flex flex-wrap items-center gap-2 ${
                isDropdownOpen 
                ? 'border-purple-500 ring-1 ring-purple-500/50 shadow-lg' 
                : 'border-gray-700 shadow-sm hover:border-purple-500/50'
            }`}
          >
            {selectedTypes.length === 0 && (
              <span className="text-gray-300 font-medium px-3 text-sm tracking-wide">Search or select categories...</span>
            )}
            
            {selectedTypes.map(type => (
              <span key={type} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/30 text-sm font-semibold animate-fadeIn">
                {type}
                <button 
                  onClick={(e) => removeType(type, e)}
                  className="p-0.5 hover:bg-purple-800 rounded-full transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </span>
            ))}

            <div className="ml-auto px-2 text-gray-500">
               <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-purple-500' : ''}`} />
            </div>
          </div>

          {/* Expandable Menu */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isDropdownOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="bg-slate-900 shadow-2xl border border-gray-700 rounded-xl overflow-hidden">
              
              {/* Search Bar */}
              <div className="p-3 border-b border-gray-800 bg-slate-900">
                 <input 
                    type="text" 
                    placeholder="Search garments (e.g., Hoodie, Saree)..." 
                    className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-slate-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-400 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()} 
                 />
              </div>

              <div className="max-h-[400px] overflow-auto custom-scrollbar bg-slate-900">
                {Object.keys(filteredCategories).length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No garments found matching "{searchTerm}"</div>
                ) : (
                    Object.entries(filteredCategories).map(([category, types]) => (
                        <div key={category} className="border-b border-gray-800 last:border-0">
                        <div className="sticky top-0 z-10 px-4 py-2 bg-slate-950/95 backdrop-blur-sm text-xs font-bold text-purple-400 uppercase tracking-wider shadow-sm">
                            {category}
                        </div>
                        <ul className="py-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 px-2">
                            {[...types].sort().map((type) => (
                            <li key={type} className="hover:bg-purple-900/20 transition-colors rounded-lg mx-1 my-0.5">
                                <label className="flex items-center w-full px-3 py-2 cursor-pointer">
                                <div className={`relative flex items-center justify-center w-5 h-5 border rounded transition-all duration-200 ${selectedTypes.includes(type) ? 'bg-purple-600 border-purple-600 scale-110' : 'border-gray-600 bg-slate-800'}`}>
                                    {selectedTypes.includes(type) && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    )}
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes.includes(type)}
                                        onChange={() => handleTypeToggle(type)}
                                        className="absolute opacity-0 w-full h-full cursor-pointer"
                                    />
                                </div>
                                <span className={`ml-3 text-sm transition-colors ${selectedTypes.includes(type) ? 'font-semibold text-purple-300' : 'text-gray-300'}`}>
                                    {type}
                                </span>
                                </label>
                            </li>
                            ))}
                        </ul>
                        </div>
                    ))
                )}
              </div>
              
              <div className="p-2 bg-slate-950 border-t border-gray-800 text-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); }}
                    className="text-xs font-bold text-purple-500 hover:text-purple-400 uppercase tracking-wider py-2"
                  >
                    Close Menu
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedTypes.length > 0 && (
        <div className="animate-slideUp">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900 text-purple-300 text-sm font-extrabold border border-purple-700">2</span>
            Upload Garments
          </h2>
          <p className="text-sm text-gray-400 mb-6 pl-10">
            Provide clear images for each selected item.
          </p>
          
          <div className="pl-10 grid grid-cols-1 gap-6">
            {Object.entries(garmentCategories).map(([category, types]) => {
              const selectedInThisCategory = types.filter(t => selectedTypes.includes(t));
              if (selectedInThisCategory.length === 0) return null;

              return (
                <div key={category} className="bg-slate-800/60 rounded-2xl p-5 border border-gray-700 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedInThisCategory.map((type) => (
                      <div key={type} className="group">
                        <label className="text-xs font-semibold text-gray-300 mb-1.5 block uppercase tracking-wide">
                            {type}
                        </label>
                        <div className="relative">
                          <label
                            htmlFor={`upload-${type}`}
                            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden relative ${
                                uploadedFiles[type] 
                                ? 'border-emerald-500/50 bg-emerald-900/10' 
                                : 'border-gray-700 bg-slate-900 hover:border-purple-500 hover:bg-purple-900/10 hover:shadow-md'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center p-4 text-center z-10 w-full">
                              {uploadedFiles[type] ? (
                                <>
                                  <div className="bg-emerald-900/50 p-2 rounded-full mb-2 shadow-sm animate-bounce-short border border-emerald-500/30">
                                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                  </div>
                                  <p className="text-xs text-emerald-400 font-semibold truncate w-full px-2">{uploadedFiles[type].fileName}</p>
                                  <span className="text-[10px] uppercase tracking-wide text-emerald-500 mt-1 font-bold bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-500/20">Ready</span>
                                </>
                              ) : (
                                <>
                                  <div className="bg-slate-800 p-3 rounded-full mb-3 shadow-inner group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-900/50">
                                    <UploadIcon className="w-6 h-6 text-gray-500 group-hover:text-purple-400 transition-colors" />
                                  </div>
                                  <p className="text-xs text-gray-500 font-medium group-hover:text-purple-400 transition-colors">
                                    Click to upload
                                  </p>
                                </>
                              )}
                            </div>
                            
                            {/* Background Image Preview Blur */}
                            {uploadedFiles[type] && (
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src={`data:${uploadedFiles[type].garment.mimeType};base64,${uploadedFiles[type].garment.base64}`} 
                                        className="w-full h-full object-cover opacity-30 blur-sm"
                                        alt=""
                                    />
                                </div>
                            )}

                            <input id={`upload-${type}`} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, type)} />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GarmentSelector;