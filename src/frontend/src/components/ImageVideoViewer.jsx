import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleOvalLeftIcon,
  EllipsisHorizontalIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid 
} from '@heroicons/react/24/solid';

const ImageVideoViewer = ({ attachments, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [zoom, setZoom] = useState(1);

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : attachments.length - 1);
    setZoom(1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < attachments.length - 1 ? prev + 1 : 0);
    setZoom(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'i' || e.key === 'I') setShowInfo(!showInfo);
      if (e.key === '+' || e.key === '=') handleZoom(0.2);
      if (e.key === '-') handleZoom(-0.2);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!attachments || attachments.length === 0) return null;

  const currentAttachment = attachments[currentIndex];

  return (
    <div className={`fixed inset-0 bg-black z-50 flex ${isFullscreen ? 'bg-black' : 'bg-black bg-opacity-95'}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-60 bg-gradient-to-b from-black to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">GS</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Government Issue</p>
              <p className="text-gray-300 text-xs">Public Attachment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              title="Toggle Info (I)"
            >
              <EllipsisHorizontalIcon className="h-6 w-6" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="h-6 w-6" />
              ) : (
                <ArrowsPointingOutIcon className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              title="Close (Esc)"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Media Display */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Navigation buttons */}
          {attachments.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full transition-all z-10"
                title="Previous (←)"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full transition-all z-10"
                title="Next (→)"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Media Content */}
          <div className="max-w-full max-h-full flex items-center justify-center p-16">
            {currentAttachment.attachment_type === 'image' ? (
              <img
                src={currentAttachment.file_url}
                alt={currentAttachment.description || "Attachment"}
                className="max-w-full max-h-full object-contain transition-transform duration-300 cursor-grab active:cursor-grabbing"
                style={{ transform: `scale(${zoom})` }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23374151"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23ffffff" font-size="16">Image not available</text></svg>';
                }}
                onDoubleClick={() => handleZoom(zoom < 2 ? 0.5 : -1)}
              />
            ) : currentAttachment.attachment_type === 'video' ? (
              <video
                src={currentAttachment.file_url}
                controls
                className="max-w-full max-h-full"
                style={{ transform: `scale(${zoom})` }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <div className="text-white text-6xl mb-4">📄</div>
                <p className="text-white text-xl mb-6">Document Preview Not Available</p>
                <a
                  href={currentAttachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Download File
                </a>
              </div>
            )}
          </div>

          {/* Zoom controls for images */}
          {currentAttachment.attachment_type === 'image' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
              <button
                onClick={() => handleZoom(-0.2)}
                className="text-white hover:text-gray-300 p-1"
                disabled={zoom <= 0.5}
                title="Zoom Out (-)"
              >
                <span className="text-lg font-bold">−</span>
              </button>
              <span className="text-white text-sm min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.2)}
                className="text-white hover:text-gray-300 p-1"
                disabled={zoom >= 3}
                title="Zoom In (+)"
              >
                <span className="text-lg font-bold">+</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Info Panel */}
        {showInfo && (
          <div className="w-80 bg-black bg-opacity-90 text-white p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Attachment Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Attachment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Type:</span>
                    <span className="capitalize">{currentAttachment.attachment_type}</span>
                  </div>
                  {currentAttachment.file_size && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Size:</span>
                      <span>{(currentAttachment.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                  {currentAttachment.uploaded_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Uploaded:</span>
                      <span>{new Date(currentAttachment.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                {currentAttachment.description && (
                  <div className="mt-4">
                    <p className="text-gray-300 text-sm mb-2">Description:</p>
                    <p className="text-white">{currentAttachment.description}</p>
                  </div>
                )}
              </div>

              {/* Social Actions */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-md font-medium mb-4">Actions</h4>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      liked 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {liked ? (
                      <HeartIconSolid className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span className="text-sm">Like</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <ShareIcon className="h-5 w-5" />
                    <span className="text-sm">Share</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                    <span className="text-sm">Comment</span>
                  </button>
                </div>
              </div>

              {/* Download Button */}
              <div className="border-t border-gray-700 pt-6">
                <a
                  href={currentAttachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Download Original
                </a>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-md font-medium mb-4">Keyboard Shortcuts</h4>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Next/Previous:</span>
                    <span>← →</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fullscreen:</span>
                    <span>F</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Toggle Info:</span>
                    <span>I</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zoom In/Out:</span>
                    <span>+ / -</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Close:</span>
                    <span>Esc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Thumbnails */}
      {attachments.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex justify-center">
            <div className="flex space-x-2 bg-black bg-opacity-50 p-3 rounded-lg max-w-full overflow-x-auto">
              {attachments.map((attachment, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setZoom(1);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    index === currentIndex 
                      ? 'ring-2 ring-white scale-110' 
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  {attachment.attachment_type === 'image' ? (
                    <img
                      src={attachment.file_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : attachment.attachment_type === 'video' ? (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center relative">
                      <video
                        src={attachment.file_url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-1">
                          <span className="text-white text-xs">▶</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <span className="text-white text-xs">�</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-2">
            <div className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
              {currentIndex + 1} of {attachments.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageVideoViewer;
