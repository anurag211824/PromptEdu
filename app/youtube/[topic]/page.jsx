"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

function YoutubeRelatedVideos() {
  const { topic } = useParams();
  console.log(topic);
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

    const response = await fetch(`/api/youtube-video?topic=${topic}`);

      const result = await response.json();
      console.log(result);
      
      setVideos(result.items);
      setLoading(false);
    } catch (err) {
      console.error("Failed fetching videos:", err);
      setError(err?.message || "Failed to fetch");
      setVideos([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topic) fetchVideos();
  }, [topic]);
   console.log(videos);
     if(loading){
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"
          role="status"
          aria-label="Loading"
        />
        <span className="text-sm text-gray-700">Loading Courses...</span>
      </div>
    </div>
  );
}
  // helper to render a safe list of only video items
  const renderVideoCards = () => {
    return videos
      .filter((v) => v?.id?.videoId) // skip channels / playlists
      .map((video, idx) => {
        const vid = video.id.videoId;
        const title = video.snippet?.title || "Untitled";
        const channel = video.snippet?.channelTitle || "";
        const thumb = video.snippet?.thumbnails?.medium?.url || "";

        return (
          <div key={vid ?? idx} className="rounded-lg shadow-md overflow-hidden">
            {/* Use thumbnail for perf — iframe only when user opens */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${vid}`}
                title={title}
                allowFullScreen
              />
            </div>

            <div className="p-3">
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{channel}</p>
            </div>
          </div>
        );
      });
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">{decodeURIComponent(topic)
}</h1>

      {loading ? (
        <p>Loading videos...</p>
      ) : error ? (
        <p className="text-red-400">Error: {error}</p>
      ) : videos.length === 0 ? (
        <p>No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderVideoCards()}
        </div>
      )}
    </div>
  );
}

export default YoutubeRelatedVideos;
