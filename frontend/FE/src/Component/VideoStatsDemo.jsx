// VideoStatsDemo.jsx
// Simple demo page to test video tracking functionality

import React, { useState, useEffect } from 'react';

const VideoStatsDemo = () => {
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(''); // You'll need to get this from login

  // Demo function to fetch all shared video tracking
  const fetchAllVideoStats = async () => {
    try {
      // First, get sent videos (as a sender)
      const sentResponse = await fetch('/backend/v1/video/sent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sentData = await sentResponse.json();

      // Then, get received videos (as a receiver)  
      const receivedResponse = await fetch('/backend/v1/video/received', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const receivedData = await receivedResponse.json();

      setTrackingData({
        sent: sentData.sentVideos || [],
        received: receivedData.receivedVideos || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching video stats:', error);
      setLoading(false);
    }
  };

  const fetchSpecificVideoStats = async (messageId) => {
    try {
      const response = await fetch(`/backend/v1/video/tracking/${messageId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Specific video stats:', data);
      return data;
    } catch (error) {
      console.error('Error fetching specific video:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 Video Tracking Dashboard</h1>
      
      {/* Token Input for Testing */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">🔑 Authentication (For Testing)</h3>
        <input
          type="text"
          placeholder="Enter JWT token..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={fetchAllVideoStats}
          disabled={!token}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Fetch Video Stats
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-8">
          
          {/* Sent Videos Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-green-700">
              📤 Videos You Sent ({trackingData.sent?.length || 0})
            </h2>
            <div className="grid gap-4">
              {trackingData.sent?.map((video) => (
                <div key={video._id} className="bg-white p-4 border rounded-lg shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">
                        To: {video.receiverId?.firstname} {video.receiverId?.lastname}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Sent: {new Date(video.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      video.isCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {video.isCompleted ? '✅ Completed' : '⏳ In Progress'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Receiver's Watch Progress:</span>
                      <span className="font-bold text-lg">{video.watchPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full transition-all duration-500 ${
                          video.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${video.watchPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t pt-3">
                    <div>
                      <span className="text-gray-600">Watch Time:</span>
                      <p className="font-medium">
                        {Math.floor(video.totalWatchTime / 60)}m {video.totalWatchTime % 60}s
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <p className="font-medium">
                        {Math.floor(video.duration / 60)}m {video.duration % 60}s
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">First Watched:</span>
                      <p className="font-medium">
                        {video.firstWatchedAt 
                          ? new Date(video.firstWatchedAt).toLocaleDateString()
                          : 'Not started'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Activity:</span>
                      <p className="font-medium">
                        {video.lastWatchedAt 
                          ? new Date(video.lastWatchedAt).toLocaleDateString()
                          : 'No activity'
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchSpecificVideoStats(video.messageId)}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    🔍 View Detailed Stats
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Received Videos Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              📥 Videos You Received ({trackingData.received?.length || 0})
            </h2>
            <div className="grid gap-4">
              {trackingData.received?.map((video) => (
                <div key={video._id} className="bg-white p-4 border rounded-lg shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">
                        From: {video.senderId?.firstname} {video.senderId?.lastname}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Received: {new Date(video.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      video.isCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {video.isCompleted ? '✅ Completed' : '📺 Watching'}
                    </div>
                  </div>

                  {/* Your Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Your Progress:</span>
                      <span className="font-bold text-lg">{video.watchPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full transition-all duration-500 ${
                          video.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${video.watchPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {video.currentTime > 0 && (
                    <div className="text-sm text-gray-600 mb-3">
                      📍 Resume from: {Math.floor(video.currentTime / 60)}:{(video.currentTime % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* No Data Message */}
          {(!trackingData.sent?.length && !trackingData.received?.length) && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-xl">📺 No video tracking data found</p>
              <p className="mt-2">Send or receive some videos to see stats here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoStatsDemo;
