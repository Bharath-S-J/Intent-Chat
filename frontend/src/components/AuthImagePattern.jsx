const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-12 relative overflow-hidden">
      {/* Floating abstract shapes */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-xl"></div>
      <div className="absolute -bottom-10 -right-10 w-80 h-80 rounded-full bg-secondary/10 blur-xl"></div>
      
      {/* Geometric pattern with more interesting design */}
      <div className="max-w-md text-center relative z-10">
        <div className="mb-8">
          <svg 
            viewBox="0 0 200 200" 
            className="w-48 h-48 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Modern geometric pattern */}
            <path 
              d="M40 100 Q100 40 160 100 Q100 160 40 100 Z" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="text-primary/30"
            />
            <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/30" />
            <path 
              d="M100 30 L115 70 L155 70 L120 95 L135 135 L100 110 L65 135 L80 95 L45 70 L85 70 Z" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              className="text-secondary/30"
            />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-base-content/70 text-lg">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;