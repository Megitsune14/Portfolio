import profilPicture from '../assets/images/profil_picture.png';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center bg-gradient-to-br from-darker to-dark relative overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jinx rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4">
              <span className="gradient-text">Megitsune</span>
            </h1>
            <p className="text-xl sm:text-2xl text-orange mb-4 font-medium">Developer & Gamer</p>
            <p className="text-lg sm:text-xl text-gray mb-8 max-w-2xl leading-relaxed">
              My username, Megitsune, comes from the Japanese band Babymetal. <br />
              I'm 22 years old and passionate about video games such as League of Legends, Overwatch, and Rocket League. 
              I'm also deeply interested in development and love exploring new ways to create and learn.
            </p>
          </div>
          
          {/* Profile Picture */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img 
                src={profilPicture} 
                alt="Megitsune - Kitsune Mask" 
                className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full object-cover border-4 border-jinx shadow-2xl shadow-jinx/40 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-jinx/50 hover:border-violet"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-0.5 h-8 bg-gradient-primary relative">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 border-r-2 border-b-2 border-jinx rotate-45"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
