import React from 'react';

interface LandingScreenProps {
  onStart: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden z-50">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a103c] via-[#2d1b4e] to-[#0f0c29] z-0"></div>
      
      {/* Decorative Floating Elements (Clay Style Stars) */}
      <div className="absolute top-10 left-10 text-yellow-400 text-4xl animate-bounce" style={{ animationDuration: '3s' }}>✦</div>
      <div className="absolute top-20 right-20 text-purple-300 text-2xl animate-pulse">✨</div>
      <div className="absolute bottom-32 left-20 text-pink-300 text-3xl animate-bounce" style={{ animationDuration: '4s' }}>★</div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-12 max-w-md w-full mx-auto">
        
        {/* Title Section with Clay Style */}
        <div className="text-center space-y-2 mt-8 animate-fade-in-up">
          <div className="bg-purple-600/30 backdrop-blur-md border-4 border-purple-400/50 rounded-3xl px-6 py-2 shadow-[0_8px_0_rgba(0,0,0,0.2)] transform -rotate-2 inline-block mb-4">
             <p className="text-yellow-200 font-bold text-sm md:text-base tracking-widest drop-shadow-md">
               당신의 일상을 바꿀
             </p>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-white font-extrabold drop-shadow-[0_4px_0_#4c1d95] tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-200" style={{ textShadow: '0px 4px 10px rgba(139, 92, 246, 0.5)' }}>
              시크릿 카드
            </span>
          </h1>
        </div>

        {/* Character Image Area (Clay Animation Style) */}
        <div className="flex-1 w-full flex items-center justify-center my-6 relative">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
                {/* Glow effect behind character */}
                <div className="absolute inset-0 bg-purple-500/30 blur-[60px] rounded-full animate-pulse"></div>
                
                {/* 
                  NOTE: This uses a placeholder image that resembles a 3D/Clay character. 
                  Replace 'src' with your generated clay animation fortune teller image.
                */}
                <img 
                  src="https://img.freepik.com/free-photo/fun-3d-cartoon-illustration-indian-woman_183399-5832.jpg?w=740&t=st=1708411234~exp=1708411834~hmac=example" 
                  alt="Clay Fortune Teller" 
                  className="w-full h-full object-cover rounded-full border-8 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 mask-image-gradient"
                  style={{ 
                    maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                  }}
                  onError={(e) => {
                    // Fallback to a generic mystical symbol if image fails
                    e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/4752/4752656.png";
                    e.currentTarget.style.padding = "40px";
                  }}
                />
            </div>
        </div>

        {/* Crystal Ball Start Button (Claymorphism) */}
        <div className="relative group cursor-pointer" onClick={onStart}>
          {/* Outer Glow */}
          <div className="absolute -inset-4 bg-purple-500/50 rounded-full blur-xl group-hover:bg-purple-400/60 transition-all duration-500 animate-pulse"></div>
          
          {/* The Ball */}
          <button className="relative w-40 h-40 rounded-full bg-gradient-to-br from-purple-400 via-purple-600 to-indigo-900 border-4 border-purple-300/50 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),inset_10px_10px_20px_rgba(255,255,255,0.4),0_15px_30px_rgba(0,0,0,0.6)] transform transition-transform duration-300 group-hover:scale-105 group-active:scale-95 flex flex-col items-center justify-center overflow-hidden">
            
            {/* Glossy Reflection */}
            <div className="absolute top-4 left-6 w-12 h-6 bg-white/40 rounded-full blur-[2px] transform -rotate-45"></div>
            
            {/* Sparkles inside ball */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-spin-slow" style={{ animationDuration: '20s' }}></div>

            <span className="text-xl font-bold text-white drop-shadow-md z-10 font-display tracking-widest group-hover:text-yellow-200 transition-colors">
              Start
            </span>
            <span className="text-white/70 text-lg mt-[-5px]">›</span>
          </button>

          {/* Pedestal Shadow */}
          <div className="w-32 h-4 bg-black/40 blur-md rounded-[100%] mx-auto mt-4"></div>
        </div>

      </div>
    </div>
  );
};

export default LandingScreen;
