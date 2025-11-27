import React, { useRef, useEffect } from 'react';
import type { Garment } from '../App';
import { UploadIcon } from './icons';

// Categorized garment types
export const garmentCategories: Record<string, string[]> = {
  "Traditional / Ethnic": [
    "Abaya", "Blouse (Saree/Lehenga)", "Churidar", "Dupatta", "Gharara", 
    "Kaftan (Ethnic)", "Kurti (Anarkali)", "Kurti (Flared)", "Kurti (Knee Length)", 
    "Kurti (Long)", "Kurti (Short)", "Kurti (Straight Cut)", "Lehenga Skirt", 
    "Patiala Salwar", "Salwar", "Saree (Ready-to-wear)", "Saree (Traditional)", 
    "Sharara", "Straight Pants (Ethnic)"
  ],
  "Dresses & Jumpsuits": [
    "Co-ord Set", "Dress (A-Line)", "Dress (Bodycon)", "Dress (Knee Length)", 
    "Dress (Maxi)", "Dress (Midi)", "Dress (Mini)", "Gown (Evening)", 
    "Jumpsuit", "Romper"
  ],
  "Tops": [
    "Blouse (Western)", "Crop Top", "Kaftan (Top)", "Off-shoulder Top", 
    "Peplum Top", "Shirt (Casual)", "Shirt (Formal)", "T-Shirt", 
    "Tank Top", "Top", "Tunic", "Vest"
  ],
  "Bottoms": [
    "Dhoti Pants", "Jeans (Mom)", "Jeans (Skinny)", "Jeans (Wide Leg)", 
    "Leggings", "Palazzo Pants", "Pant (Casual)", "Shorts", 
    "Skirt (Long/Maxi)", "Skirt (Midi)", "Skirt (Mini)", 
    "Straight Pants (Ethnic)", "Trousers (Formal)"
  ],
  "Unisex & Streetwear": [
    "Casual Wear", "Co-ord Set (Unisex)", "Ethnic Unisex Robe", "Fusion Wear", 
    "Hoodie", "Jacket", "Kurta Set (Unisex)", "Matching Theme Outfit", 
    "Night Suit (Unisex)", "Oversized T-Shirt", "Sweatshirt", "Track Suit"
  ],
  "Outerwear": [
    "Blazer", "Cardigan", "Coat", "Denim Jacket", "Pullover", 
    "Shrug", "Sweater", "Waistcoat", "Winter Wear"
  ],
  "Nightwear": [
    "Kaftan (Nightwear)", "Lounge Set", "Nighty (Long)", "Nighty (Short)"
  ],
  "Swimwear": [
    "Cover-up", "Swimsuit", "Swim Trunks"
  ],
  "Accessories": [
    "Beanie", "Cap", "Hat", "Scarf"
  ]
};

interface NavProps {
  selectedTypes: string[];
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  toggleType: (type: string) => void;
  removeType: (type: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const GarmentCategoryNav: React.FC<NavProps> = ({
  selectedTypes,
  activeCategory,
  setActiveCategory,
  toggleType,
  removeType,
  searchTerm,
  setSearchTerm
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setActiveCategory]);

  const getFilteredItems = (category: string) => {
    const items = garmentCategories[category] || [];
    if (!searchTerm) return items.sort();
    return items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase())).sort();
  };

  return (
    <div className="relative z-[100]" ref={menuRef}>
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900 text-purple-300 text-sm font-extrabold border border-purple-700">1</span>
        Select Attire Types
      </h2>
      <p className="text-sm text-gray-300 mb-6 pl-10 font-medium">
        Click a category below to select items.
      </p>

      <div className="relative pl-0 md:pl-10">
        <div className="flex flex-wrap gap-1 border-b border-gray-700 pb-1 relative z-[102]">
          {Object.keys(garmentCategories).map((category) => (
            <div key={category} className="group static">
              <button
                className={`px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors rounded-t-lg focus:outline-none ${
                  activeCategory === category
                    ? 'text-white bg-slate-800 border-b-2 border-purple-500 shadow-lg'
                    : 'text-gray-400 hover:text-purple-300 hover:bg-slate-800/50'
                }`}
                onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              >
                {category.replace(" / ", "/").replace(" & ", "&")}
              </button>
            </div>
          ))}
        </div>

        {activeCategory && (
          <div className="absolute left-0 md:left-10 right-0 top-full bg-slate-900 border border-gray-600 shadow-2xl rounded-b-xl rounded-tr-xl z-[101] p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
              <h3 className="text-purple-400 font-bold uppercase tracking-wider text-sm">{activeCategory}</h3>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border border-gray-600 rounded-md px-3 py-1 text-sm text-white focus:outline-none focus:border-purple-500 w-48 placeholder-gray-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {getFilteredItems(activeCategory).map((type) => (
                <div
                  key={type}
                  onClick={() => toggleType(type)}
                  className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-800 transition-colors select-none"
                >
                  <div className={`flex-shrink-0 flex items-center justify-center w-5 h-5 border rounded transition-all duration-200 ${selectedTypes.includes(type) ? 'bg-purple-600 border-purple-600' : 'border-gray-500 bg-slate-900 group-hover:border-purple-400'}`}>
                    {selectedTypes.includes(type) && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    )}
                  </div>
                  <span className={`text-sm ${selectedTypes.includes(type) ? 'text-white font-bold' : 'text-gray-300 font-medium group-hover:text-purple-300'}`}>
                    {type}
                  </span>
                </div>
              ))}
              {getFilteredItems(activeCategory).length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-4 italic">No items found matching "{searchTerm}"</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface UploadProps {
  selectedTypes: string[];
  uploadedFiles: Record<string, { garment: Garment, fileName: string }>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, type: string) => void;
  onRemoveCategory: (type: string) => void;
}

export const GarmentUploads: React.FC<UploadProps> = ({ selectedTypes, uploadedFiles, onFileChange, onRemoveCategory }) => {
  if (selectedTypes.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full min-h-[100px] border-2 border-dashed border-gray-800 rounded-2xl p-6 text-center text-gray-500">
              <p>No attire types selected.</p>
              <p className="text-xs mt-2">Please select items from Step 1 above.</p>
          </div>
      );
  }

  return (
    <div className="animate-slideUp z-10 relative h-full">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900 text-purple-300 text-sm font-extrabold border border-purple-700">2</span>
        Upload Garments
      </h2>
      <p className="text-sm text-gray-400 mb-6 pl-10">
        Provide clear images for each selected item.
      </p>

      <div className="pl-0 flex flex-col gap-6">
        {Object.entries(garmentCategories).map(([category, types]) => {
          const selectedInThisCategory = types.filter(t => selectedTypes.includes(t));
          if (selectedInThisCategory.length === 0) return null;

          return (
            <div key={category} className="bg-slate-800/40 rounded-2xl p-5 border border-gray-700/50 shadow-sm backdrop-blur-sm">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">{category}</h3>
              {/* Responsive Grid: 2 cols on mobile, 3 on sm, 4 on md, 5 on lg */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {selectedInThisCategory.map((type) => (
                  <div key={type} className="group relative">
                    <label className="text-[10px] font-bold text-gray-400 mb-1.5 block uppercase tracking-wide truncate" title={type}>
                      {type}
                    </label>

                    {/* Remove/Close Button - Removes Item from Category */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onRemoveCategory(type);
                        }}
                        className="absolute -top-2 -right-2 z-30 bg-slate-700 text-gray-400 hover:bg-red-500 hover:text-white rounded-full p-1 shadow-md border border-gray-600 transition-all duration-200"
                        title="Remove item"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    <div className="relative">
                      
                      <label
                        htmlFor={`upload-${type}`}
                        className={`flex flex-col items-center justify-center w-full h-24 sm:h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden relative ${
                          uploadedFiles[type]
                            ? 'border-emerald-500/50 bg-emerald-900/10'
                            : 'border-gray-700 bg-slate-900/50 hover:border-purple-500 hover:bg-purple-900/10 hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center p-2 text-center z-10 w-full">
                          {uploadedFiles[type] ? (
                            <>
                              <div className="bg-emerald-900/50 p-1.5 rounded-full mb-1 shadow-sm animate-bounce-short border border-emerald-500/30">
                                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                              </div>
                              <p className="text-[9px] text-emerald-400 font-semibold truncate w-full px-2">{uploadedFiles[type].fileName}</p>
                            </>
                          ) : (
                            <>
                              <div className="bg-slate-800 p-1.5 rounded-full mb-1 shadow-inner group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-900/50">
                                <UploadIcon className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                              </div>
                              <p className="text-[9px] text-gray-500 font-bold group-hover:text-purple-400 transition-colors uppercase">
                                Upload
                              </p>
                            </>
                          )}
                        </div>

                        {uploadedFiles[type] && (
                          <div className="absolute inset-0 z-0">
                            <img
                              src={`data:${uploadedFiles[type].garment.mimeType};base64,${uploadedFiles[type].garment.base64}`}
                              className="w-full h-full object-cover opacity-30 blur-sm"
                              alt=""
                            />
                          </div>
                        )}

                        <input id={`upload-${type}`} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => onFileChange(e, type)} />
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
  );
};