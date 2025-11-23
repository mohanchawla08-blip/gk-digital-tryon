import React from 'react';
import { DownloadIcon } from './icons';

interface ImageDisplayProps {
  isLoading: boolean;
  generatedImage: string | null;
  error: string | null;
}

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[500px] animate-fadeIn w-full">
    <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full border-[6px] border-violet-100 dark:border-violet-900/30"></div>
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[6px] border-transparent border-t-violet-600 border-r-fuchsia-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-violet-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
        </div>
    </div>
    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 animate-pulse">
        Designing the Look
    </h3>
    <div className="space-y-2 mt-4 text-center max-w-xs mx-auto">
        <p className="text-sm text-gray-500 dark:text-gray-400">AI is analyzing garment textures...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 delay-75">Setting the lighting and pose...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 delay-150">Rendering high-fashion details...</p>
    </div>
  </div>
);

const InitialState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-8">
    <div className="w-24 h-24 bg-gradient-to-tr from-violet-100 to-pink-100 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <svg className="w-10 h-10 text-violet-400 dark:text-violet-300 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    </div>
    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Your Canvas is Ready</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed text-sm">
      Upload your garments and select a model. Our AI will generate a photorealistic try-on session in seconds.
    </p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-8">
    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    </div>
    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Generation Failed</h3>
    <p className="text-red-500 dark:text-red-400 max-w-md bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg border border-red-100 dark:border-red-800/50 text-sm">
      {message}
    </p>
    <p className="text-gray-400 text-xs mt-4">Please try again with clear images.</p>
  </div>
);

const ImageDisplay: React.FC<ImageDisplayProps> = ({ isLoading, generatedImage, error }) => {
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4 absolute top-0 left-0 right-0 z-20 px-2 pointer-events-none">
          {generatedImage && !isLoading && !error && (
             <span className="px-4 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white shadow-lg text-xs font-bold rounded-full uppercase tracking-wider animate-fadeIn pointer-events-auto">
                ✨ Generated Successfully
             </span>
          )}
      </div>

      <div className="flex-grow relative rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
        {isLoading && <LoadingState />}
        {!isLoading && error && <ErrorState message={error} />}
        {!isLoading && !error && !generatedImage && <InitialState />}
        
        {!isLoading && !error && generatedImage && (
          <div className="relative h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 animate-fadeIn">
             {/* Background Mesh for image presentation */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-200 via-transparent to-transparent"></div>
            <img 
                src={generatedImage} 
                alt="Generated virtual try-on result" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg z-10" 
            />
          </div>
        )}
      </div>

      {generatedImage && !isLoading && !error && (
        <div className="mt-6 animate-slideUp sticky bottom-0 z-30">
            <a
            href={generatedImage}
            download="style-fusion-vton.png"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1 group"
            >
            <DownloadIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-lg">Download High-Res Result</span>
            </a>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;