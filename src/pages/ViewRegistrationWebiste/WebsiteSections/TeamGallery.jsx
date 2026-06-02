export default function TeamGallery({ pagedata }) {
  const galleryImages = pagedata?.galleryImages || [];

  const distributeImages = (images) => {
    const columns = [[], [], [], [], []];
    images.forEach((img, index) => {
      columns[index % 5].push(img);
    });
    return columns;
  };

  const imageColumns = distributeImages(galleryImages);

  return (
    <div className="relative bg-gray-100 overflow-hidden">
      {/* Blue Gradient Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 
        bg-gradient-to-t 
        from-blue-900/90 
        via-blue-900/40 
        to-transparent"
      ></div>

      <div className="relative z-0 max-w-7xl mx-auto py-8 md:py-12">
        {/* HEADING */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Our Gallery
          </h2>
          <p className="text-gray-700 mt-2 md:text-lg">
            Take a look at moments from our events
          </p>
        </div>

        {/* IMAGE COLUMNS */}
        <div className="flex md:gap-6 gap-4 p-4 md:p-12">
          {/* Mobile: Horizontal Scroll */}
          <div className="flex flex-row gap-4 md:hidden overflow-x-auto scrollbar-hide">
            {galleryImages.map((img, i) => (
              <img
                key={i}
                src={img.imageUrl || img}
                alt={`Gallery image ${i + 1}`}
                className="w-48 h-64 object-cover rounded-xl border flex-shrink-0"
              />
            ))}
          </div>

          {/* Desktop: Vertical Columns with animation */}
          <div className="hidden md:flex md:justify-between md:h-[500px] md:overflow-hidden w-full">
            {imageColumns.map((columnImages, colIndex) => (
              <div
                key={colIndex}
                className={`
                  flex flex-col gap-6
                  ${colIndex % 2 === 0 ? 'animate-moveUp' : 'animate-moveDown'}
                  hover:[animation-play-state:paused]
                `}
              >
                {[...columnImages, ...columnImages].map((img, i) => (
                  <img
                    key={i}
                    src={img.imageUrl || img}
                    alt={`Gallery image ${i + 1}`}
                    className="w-48 h-64 object-cover rounded-xl border flex-shrink-0"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}