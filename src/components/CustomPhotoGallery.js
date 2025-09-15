import React, { useState } from 'react';

const CustomPhotoGallery = ({ photos, onPhotoClick }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  const PhotoLightbox = ({ photo, onClose }) => (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <img src={photo.url} alt={photo.caption} />
        <button className="lightbox-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
  
  return (
    <>
      <div className="custom-gallery">
        <h3>Our Mood Memories 📸</h3>
        <div className="masonry-grid">
          {photos.map((photo, index) => (
            <div 
              key={photo.id}
              className="gallery-item"
              style={{ '--delay': `${index * 0.1}s` }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <img src={photo.url} alt={photo.caption} loading="lazy" />
              <div className="photo-overlay">
                <span className="photo-caption">{photo.caption}</span>
                <div className="photo-actions">
                  <button className="love-btn" onClick={e => {
                    e.stopPropagation();
                    console.log('Loved photo:', photo.id);
                  }}>💕</button>
                  <button className="share-btn" onClick={e => {
                    e.stopPropagation();
                    if (navigator.share) {
                      navigator.share({
                        title: 'Our Mood Memory',
                        url: photo.url
                      });
                    }
                  }}>📤</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedPhoto && (
        <PhotoLightbox 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
        />
      )}
    </>
  );
};

export default CustomPhotoGallery;
