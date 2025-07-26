// VideoTrackingComponents.jsx
// Frontend components to display video tracking stats

import React, { useState, useEffect, useRef } from 'react';

// 1. Component for showing progress in chat messages
const VideoMessageWithTracking = ({ message, currentUserId, token }) => {
  const videoRef = useRef(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch initial tracking info
  useEffect(() => {
    fetchVideoTracking();
  }, [message._id]);

  // initialize and update progress every 5s
  useEffect(() => {
    const video = videoRef.current;
    let interval;
    if (!video) return;
    const handleLoaded = async () => {
      console.log('Video loaded, initializing tracking...');
      // initialize tracking
      const initResponse = await fetch('/backend/v1/video/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageId: message._id,
          videoUrl: message.fileUrl,
          duration: video.duration
        })
      });
      console.log('Initialize response:', await initResponse.json());
      
      // fetch initial tracking
      await fetchVideoTracking();
      
      // start periodic updates
      interval = setInterval(async () => {
        const currentTime = Math.floor(video.currentTime);
        const duration = video.duration;
        console.log('Updating progress:', { currentTime, duration });
        
        const progressResponse = await fetch('/backend/v1/video/progress', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messageId: message._id, currentTime, duration })
        });
        console.log('Progress response:', await progressResponse.json());
        
        await fetchVideoTracking();
      }, 5000);
    };
    video.addEventListener('loadedmetadata', handleLoaded);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
      clearInterval(interval);
    };
  }, [message._id, token]);

  const fetchVideoTracking = async () => {
    try {
      const response = await fetch(`/backend/v1/video/tracking/${message._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Fetched tracking data:', data);
      setTrackingData(data.tracking);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching video tracking:', error);
      setLoading(false);
    }
  };

  const isSender = message.sender === currentUserId;

  return (
    <div className="video-message">
      <video 
        ref={videoRef}
        src={message.fileUrl}
        controls
        className="w-full max-w-md rounded-lg"
      />
    
      {/* Show tracking stats */}
      {!loading && (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
          {trackingData ? (
            <>
              {isSender ? (
                // Sender view - show receiver's progress
                <div className="sender-stats">
                  <h4 className="font-semibold text-sm text-gray-700">📊 Video Stats</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">
                      Watched by {trackingData.receiver?.name || 'Receiver'}:
                    </span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            trackingData.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${trackingData.watchPercentage || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {trackingData.watchPercentage || 0}%
                      </span>
                      {trackingData.isCompleted && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </div>
                  </div>
                  {trackingData.lastWatchedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last watched: {new Date(trackingData.lastWatchedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                // Receiver view - show own progress
                <div className="receiver-stats">
                  <h4 className="font-semibold text-sm text-gray-700">Your Progress</h4>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          trackingData.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${trackingData.watchPercentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {trackingData.watchPercentage || 0}%
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500">
              {loading ? 'Loading tracking data...' : 'No tracking data available'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 2. Sender Dashboard Component
const SenderDashboard = ({ token }) => {
  const [sentVideos, setSentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentVideos();
  }, []);

  const fetchSentVideos = async () => {
    try {
      const response = await fetch('/backend/v1/video/sent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSentVideos(data.sentVideos);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sent videos:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading video analytics...</div>;

  return (
    <div className="sender-dashboard p-6">
      <h2 className="text-2xl font-bold mb-6">📊 Video Analytics Dashboard</h2>
      
      <div className="grid gap-4">
        {sentVideos.map((video) => (
          <div key={video._id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">Video to {video.receiverId.firstname} {video.receiverId.lastname}</h3>
                <p className="text-sm text-gray-600">
                  Sent: {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  video.isCompleted 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {video.isCompleted ? 'Completed' : 'In Progress'}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Watch Progress</span>
                <span>{video.watchPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    video.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${video.watchPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Watch Time:</span>
                <p className="font-medium">{Math.floor(video.totalWatchTime / 60)}m {video.totalWatchTime % 60}s</p>
              </div>
              <div>
                <span className="text-gray-600">Last Watched:</span>
                <p className="font-medium">
                  {video.lastWatchedAt 
                    ? new Date(video.lastWatchedAt).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-600">View Sessions:</span>
                <p className="font-medium">{Math.ceil(video.viewCount / 12)} sessions</p>
              </div>
            </div>

            {/* Video Preview */}
            <div className="mt-3 flex items-center">
              <video 
                src={video.videoUrl} 
                className="w-24 h-16 object-cover rounded mr-3"
                muted
              />
              <div className="flex-1">
                <button 
                  onClick={() => window.open(video.videoUrl, '_blank')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Video →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sentVideos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No videos sent yet</p>
        </div>
      )}
    </div>
  );
};

// 3. Real-time Progress Component (for chat interface)
const VideoProgressIndicator = ({ messageId, token, isSender }) => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Poll for updates every 10 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/backend/v1/video/tracking/${messageId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.tracking) {
          setProgress(data.tracking.watchPercentage);
          setIsCompleted(data.tracking.isCompleted);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [messageId]);

  if (!isSender) return null; // Only show for senders

  return (
    <div className="video-progress-indicator mt-2">
      <div className="flex items-center text-xs text-gray-600">
        <div className="w-16 bg-gray-200 rounded-full h-1 mr-2">
          <div 
            className={`h-1 rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span>{progress}% watched</span>
        {isCompleted && <span className="ml-1 text-green-600">✓</span>}
      </div>
    </div>
  );
};

// 4. Usage in Chat Component
const ChatMessage = ({ message, currentUserId, token }) => {
  const isSender = message.sender === currentUserId;
  
  return (
    <div className={`message ${isSender ? 'sent' : 'received'}`}>
      {message.type === 'video' ? (
        <div>
          <VideoMessageWithTracking 
            message={message}
            currentUserId={currentUserId}
            token={token}
          />
          <VideoProgressIndicator 
            messageId={message._id}
            token={token}
            isSender={isSender}
          />
        </div>
      ) : (
        <div className="text-message">
          {message.text}
        </div>
      )}
    </div>
  );
};

export default VideoMessageWithTracking;
export { 
  VideoMessageWithTracking, 
  SenderDashboard, 
  VideoProgressIndicator, 
  ChatMessage 
};
