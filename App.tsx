import React, { useState, useCallback, useRef } from 'react';
import GarmentSelector from './components/GarmentSelector';
import ImageDisplay from './components/ImageDisplay';
import { generateVtonImage, VtonCategory, SkinTone, BodyShape, Pose } from './services/geminiService';
import { UploadIcon } from './components/icons';

export interface Garment {
  base64: string;
  mimeType: string;
}

const App: React.FC = () => {
  const [selectedGarments, setSelectedGarments] = useState<Record<string, Garment> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<VtonCategory>('women');
  
  const [userModelImage, setUserModelImage] = useState<Garment | null>(null);
  const [skinTone, setSkinTone] = useState<SkinTone>('Wheatish');
  const [bodyShape, setBodyShape] = useState<BodyShape>('Average');
  const [pose, setPose] = useState<Pose>('Standing');

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!selectedGarments || Object.keys(selectedGarments).length === 0) {
      setError('Please select and upload at least one garment.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageB64 = await generateVtonImage(
        selectedGarments, 
        selectedCategory,
        userModelImage,
        skinTone,
        bodyShape,
        pose
      );
      setGeneratedImage(`data:image/png;base64,${imageB64}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedGarments, selectedCategory, userModelImage, skinTone, bodyShape, pose]);

  const handleModelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setUserModelImage({ base64, mimeType: file.type });
      };
    }
  };

  const hasSelection = selectedGarments && Object.keys(selectedGarments).length > 0;

  const getCategoryLabel = (cat: VtonCategory) => {
    switch(cat) {
        case 'mother-daughter': return 'Mother & Daughter';
        case 'father-son': return 'Father & Son';
        case 'mother-son': return 'Mother & Son';
        default: return cat.charAt(0).toUpperCase() + cat.slice(1);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-950 text-gray-100 selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white text-lg">G</div>
             <span className="text-xl font-bold tracking-tight text-white">GK Model Shoot</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
             <button onClick={() => scrollToSection('demo')} className="hover:text-white transition-colors">AI Studio</button>
             <button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors">Services</button>
             <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button>
          </div>
          <button onClick={() => scrollToSection('demo')} className="bg-white text-slate-950 px-5 py-2 rounded-full text-sm font-bold hover:bg-purple-400 hover:text-white transition-all">
            Try Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
         {/* Abstract BG */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-[0%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[100px]"></div>
         </div>

         <div className="container mx-auto px-6 relative z-10 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-widest uppercase mb-6 animate-fadeIn">
              Next Gen Digital Agency
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-tight">
              Enhancing Your Brand <br/> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">High-Quality Model Shoots</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              We combine AI-powered virtual try-ons with expert digital strategy. 
              From creating stunning visuals to optimizing your SEO, we are the future of fashion marketing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => scrollToSection('demo')} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold text-lg shadow-lg shadow-purple-600/30 transition-all hover:scale-105">
                Start Creating Visuals
              </button>
              <button onClick={() => scrollToSection('services')} className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/5 text-white rounded-full font-bold text-lg transition-all">
                Explore Services
              </button>
            </div>
         </div>
      </section>

      {/* Main App Section (VTON) */}
      <section id="demo" className="py-20 container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-24">
        <div className="text-center mb-12 max-w-3xl mx-auto space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                AI Virtual <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Studio</span>
            </h2>
            <p className="text-lg text-gray-400">
              Experience modern digital fashion creation using AI.
              Upload your photos, choose outfits, and generate studio-quality images instantly.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
                {['Multiple Model Types', 'Outfit Categories', 'Fast Processing', 'Download HD Images'].map(feat => (
                    <span key={feat} className="px-3 py-1 rounded-full bg-slate-800 text-purple-300 text-xs font-bold border border-purple-500/20">
                        {feat}
                    </span>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/10 ring-1 ring-white/5">
              <GarmentSelector onGarmentSelect={setSelectedGarments} />
            </div>
            
            <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/10 ring-1 ring-white/5">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900 text-purple-300 text-sm font-extrabold border border-purple-700">3</span>
                Model Configuration
              </h2>
              <p className="text-sm text-gray-400 mb-6 pl-10">
                Customize your model's look and accessories.
              </p>
              
              <div className="pl-10 space-y-6">
                
                {/* Category Grid */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Model Type</label>
                  <div className="grid grid-cols-3 gap-2">
                      {(['women', 'men', 'girls', 'boys', 'kids', 'unisex'] as VtonCategory[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                                selectedCategory === cat
                                ? 'border-purple-500 bg-purple-900/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                : 'border-transparent bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                        >
                            {getCategoryLabel(cat)}
                        </button>
                      ))}
                  </div>
                  
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 mb-3">Groups</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(['mother-daughter', 'father-son', 'mother-son'] as VtonCategory[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                                selectedCategory === cat
                                ? 'border-pink-500 bg-pink-900/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                                : 'border-transparent bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                        >
                            {getCategoryLabel(cat)}
                        </button>
                      ))}
                  </div>
                </div>

                {/* AI Model Customization Controls */}
                {!userModelImage && (
                    <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                        
                        {/* Skin Tone */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Skin Tone</label>
                            <div className="flex gap-3">
                                {[
                                    { name: 'Fair', color: '#FDE4D9' },
                                    { name: 'Wheatish', color: '#EAC09C' },
                                    { name: 'Tan', color: '#C68642' },
                                    { name: 'Dark', color: '#593B2B' }
                                ].map((tone) => (
                                    <button
                                        key={tone.name}
                                        onClick={() => setSkinTone(tone.name as SkinTone)}
                                        title={tone.name}
                                        className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all transform hover:scale-110 ${
                                            skinTone === tone.name ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-gray-600'
                                        }`}
                                        style={{ backgroundColor: tone.color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Body Shape & Pose Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Body Shape</label>
                                <select 
                                    value={bodyShape} 
                                    onChange={(e) => setBodyShape(e.target.value as BodyShape)}
                                    className="w-full text-sm rounded-lg border-gray-700 bg-slate-900 text-gray-200 focus:ring-purple-500 focus:border-purple-500 py-2"
                                >
                                    <option value="Slim">Slim</option>
                                    <option value="Average">Average</option>
                                    <option value="Curvy">Curvy</option>
                                    <option value="Athletic">Athletic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pose</label>
                                <select 
                                    value={pose} 
                                    onChange={(e) => setPose(e.target.value as Pose)}
                                    className="w-full text-sm rounded-lg border-gray-700 bg-slate-900 text-gray-200 focus:ring-purple-500 focus:border-purple-500 py-2"
                                >
                                    <option value="Standing">Standing</option>
                                    <option value="Walking">Walking</option>
                                    <option value="Sitting">Sitting</option>
                                    <option value="Candid">Candid</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reference Photo */}
                <div className="p-1 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                    <div className="bg-slate-900/90 rounded-xl p-4 backdrop-blur-sm">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Reference Photo (Optional)
                        </label>
                        {userModelImage ? (
                        <div className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-700 bg-slate-800">
                            <div className="h-40 w-full flex items-center justify-center p-2">
                                <img 
                                src={`data:${userModelImage.mimeType};base64,${userModelImage.base64}`} 
                                alt="Model Reference" 
                                className="max-w-full max-h-full object-contain rounded-md"
                                />
                            </div>
                            <div className="absolute inset-0 bg-slate-900/60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button
                                onClick={() => setUserModelImage(null)}
                                className="bg-white text-red-600 px-4 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-red-50"
                                >
                                Remove
                                </button>
                            </div>
                        </div>
                        ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-900/10 transition-all duration-300 group">
                            <div className="flex flex-col items-center justify-center py-4">
                            <UploadIcon className="w-8 h-8 text-gray-600 group-hover:text-purple-400 transition-colors mb-2" />
                            <p className="text-xs text-gray-400 text-center px-4">
                                <span className="font-bold text-purple-400">Click to upload</span> a reference photo
                            </p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleModelFileChange} />
                        </label>
                        )}
                    </div>
                </div>

                <button
                onClick={handleGenerateClick}
                disabled={isLoading || !hasSelection}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-5 px-6 rounded-2xl shadow-lg shadow-purple-900/30 hover:shadow-purple-600/50 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-[0.98]"
                >
                <span className="relative z-10 flex items-center justify-center gap-3 text-lg tracking-wide">
                {isLoading ? (
                    <>
                    <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Visuals...
                    </>
                ) : (
                    <>
                        Generate Studio Look
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </>
                )}
                </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
             <div className="bg-slate-900/80 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white/10 ring-1 ring-white/5 h-full min-h-[700px] shadow-2xl">
                <div className="bg-slate-950/50 rounded-[2rem] w-full h-full p-4 sm:p-6 overflow-hidden relative">
                     <ImageDisplay
                        isLoading={isLoading}
                        generatedImage={generatedImage}
                        error={error}
                        />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-900 relative scroll-mt-24">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Premium Services</h2>
              <p className="text-gray-400">Comprehensive digital solutions for fashion brands.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* AI Virtual Try-On */}
              <div className="bg-slate-950 p-8 rounded-2xl border border-white/5 hover:border-purple-500/50 transition-all group hover:-translate-y-2">
                 <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mb-6 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    {/* Sparkles / Magic Icon */}
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">AI Virtual Try-On (VTON)</h3>
                 <p className="text-gray-400 text-sm leading-relaxed">
                   Instantly try outfits on your photos using advanced generative AI. Visualize garments in real-time.
                 </p>
              </div>

              {/* Model Photoshoot (AI) */}
              <div className="bg-slate-950 p-8 rounded-2xl border border-white/5 hover:border-pink-500/50 transition-all group hover:-translate-y-2">
                 <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mb-6 text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    {/* Camera Icon */}
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">Model Photoshoot (AI)</h3>
                 <p className="text-gray-400 text-sm leading-relaxed">
                   High-quality solo, couple & family model images without the need for expensive physical shoots.
                 </p>
              </div>

              {/* Digital Lookbook Creation */}
              <div className="bg-slate-950 p-8 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all group hover:-translate-y-2">
                 <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {/* Gallery/Images Icon */}
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">Digital Lookbook Creation</h3>
                 <p className="text-gray-400 text-sm leading-relaxed">
                   Ready-to-post catalog images. We create cohesive, stunning digital lookbooks for your entire collection.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-950 border-t border-white/5 py-12 scroll-mt-24">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Brand Info */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">GK Model Shoot</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        Elevating brands through AI & Digital Strategy. The future of fashion photography is here.
                    </p>
                    <div className="text-gray-500 text-xs">
                         &copy; 2025 GK Model Shoot. <br/>All rights reserved.
                    </div>
                </div>

                {/* Contact Us */}
                <div>
                    <h4 className="text-lg font-bold text-white mb-4">Contact Us</h4>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li className="flex items-start gap-3">
                            <span className="text-xl">📞</span>
                            <span>Phone: +91 9537202295</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-xl">📧</span>
                            <span>Email: vishna.chainani@gmail.com</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-xl">📍</span>
                            <span>Location: India (Online Digital Studio)</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-white/5 pt-8 mt-12 flex flex-col md:flex-row justify-between text-xs text-gray-600">
                <div className="flex gap-4">
                    <a href="#" className="hover:text-gray-400">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-400">Terms of Service</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;