// Test API Endpoints for Shared Video Tracking
// This file demonstrates how to use the new video tracking APIs

const API_BASE = 'http://localhost:3000/backend/v1';

// Example usage scenarios:

// 1. When a user opens a shared video for the first time
async function initializeVideoTracking(token, messageId, videoUrl, duration) {
  const response = await fetch(`${API_BASE}/video/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      messageId,
      videoUrl,
      duration
    })
  });
  
  return await response.json();
}

// 2. Update video progress every 5 seconds while watching
async function updateVideoProgress(token, messageId, currentTime, duration) {
  const response = await fetch(`${API_BASE}/video/progress`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      messageId,
      currentTime,
      duration
    })
  });
  
  return await response.json();
}

// 3. Get video tracking info (for both sender and receiver)
async function getVideoTracking(token, messageId) {
  const response = await fetch(`${API_BASE}/video/tracking/${messageId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 4. Get all video tracking for a conversation
async function getConversationVideoTracking(token, conversationId) {
  const response = await fetch(`${API_BASE}/video/conversation/${conversationId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 5. Get videos sent by current user (sender dashboard)
async function getSentVideos(token) {
  const response = await fetch(`${API_BASE}/video/sent`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 6. Get videos received by current user (receiver dashboard)
async function getReceivedVideos(token) {
  const response = await fetch(`${API_BASE}/video/received`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

/* 
FRONTEND INTEGRATION EXAMPLE:

// In your video player component:
let updateInterval;

const VideoPlayer = ({ messageId, videoUrl, token }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchPercentage, setWatchPercentage] = useState(0);
  
  useEffect(() => {
    // Initialize tracking when component mounts
    initializeVideoTracking(token, messageId, videoUrl, duration)
      .then(data => {
        if (data.tracking) {
          setCurrentTime(data.tracking.currentTime);
          setWatchPercentage(data.tracking.watchPercentage);
        }
      });
  }, []);
  
  const handlePlay = () => {
    // Start progress updates every 5 seconds
    updateInterval = setInterval(() => {
      updateVideoProgress(token, messageId, currentTime, duration)
        .then(data => {
          setWatchPercentage(data.watchPercentage);
        });
    }, 5000);
  };
  
  const handlePause = () => {
    // Stop progress updates
    clearInterval(updateInterval);
  };
  
  return (
    <div>
      <video 
        src={videoUrl}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onDurationChange={(e) => setDuration(e.target.duration)}
      />
      <div>Watch Progress: {watchPercentage}%</div>
    </div>
  );
};
*/

console.log('Shared Video Tracking API helpers loaded!');
console.log('Use the functions above to integrate with your frontend.');
