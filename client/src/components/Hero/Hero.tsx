import React, { useEffect, useState } from "react";

const slides = [
  { id: 1, img: "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg" },
  { id: 2, img: "https://images.pexels.com/photos/610945/pexels-photo-610945.jpeg" },
  { id: 3, img: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg" },
];

const Hero: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1)),
      4000 // ⏱ change slide every 4s
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[300px] sm:h-[500px] lg:h-[400px] overflow-hidden">
      {slides.map((slide, index) => (
        <img
          key={slide.id}
          src={slide.img}
          alt={`Slide ${slide.id}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              current === index ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
