import { defineStore } from "pinia";
import axios from "axios";
import api from "@/api";

export const useVideoStore = defineStore("videoStore", {
  state: () => ({
    videos: [],
    lastUpdated: "-",
    isLoading: false,
    selectedDate: new Date().toISOString().split('T')[0], // Track current date filter with a default value
    currentDate: null, // Keep for compatibility
    hasInitiallyLoaded: false, // Track if data has been initially loaded
  }),
  persist: {
    enabled: true,
    paths: ['videos', 'lastUpdated', 'currentDate', 'selectedDate', 'hasInitiallyLoaded']
  },
  actions: {
    async fetchVideos(date = null, forceRefresh = false) {
      // If data is already loaded and no force refresh, just return
      if (this.hasInitiallyLoaded && !forceRefresh && this.videos.length > 0) {
        console.log("Using cached videos data");
        return this.videos;
      }
      
      this.isLoading = true;
      
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        // Use date parameter if provided, otherwise use the store's selectedDate
        const dateToUse = date || this.selectedDate;
        
        // Update current date tracking
        if (dateToUse) {
          this.currentDate = dateToUse;
        }
        
        // Prepare date parameter
        const params = dateToUse ? { date: dateToUse } : {};
        
        const response = await axios.get(api.getEndpoint("videos"), {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        // Map data and preload video URLs
        this.videos = await Promise.all(response.data.map(async (video) => {
          // Create the base video object
          const videoObj = {
            ...video,
            rawVideoUrl: null,
            processedVideoUrl: null,
            isRawLoaded: false,
            isProcessedLoaded: false,
          };
          
          // Preload both videos if URLs are available
          if (video.raw_video_stream_url) {
            this.loadVideoUrl(video.id, 'raw');
          }
          
          if (video.processed_video_stream_url) {
            this.loadVideoUrl(video.id, 'processed');
          }
          
          return videoObj;
        }));
        
        this.lastUpdated = new Date().toLocaleString("id-ID");
        this.hasInitiallyLoaded = true;
      } catch (error) {
        console.error("Gagal mengambil data video:", error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // Load video on demand
    async loadVideoUrl(videoId, type) {
      try {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return null;

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        // Determine which URL to fetch
        const urlKey = type === 'raw' ? 'raw_video_stream_url' : 'processed_video_stream_url';
        const loadedKey = type === 'raw' ? 'isRawLoaded' : 'isProcessedLoaded';
        const targetUrlKey = type === 'raw' ? 'rawVideoUrl' : 'processedVideoUrl';
        
        // Skip if already loaded or URL doesn't exist
        if (video[loadedKey] || !video[urlKey]) return video[targetUrlKey];
        
        // Fetch the video
        const response = await fetch(video[urlKey], {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error(`Gagal mengambil video ${type}`);
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Update the video object
        video[targetUrlKey] = url;
        video[loadedKey] = true;
        
        return url;
      } catch (error) {
        console.error(`Error loading ${type} video:`, error);
        return null;
      }
    },
    
    // Method to clear old blobs when no longer needed
    clearVideoUrls() {
      this.videos.forEach(video => {
        if (video.rawVideoUrl) {
          URL.revokeObjectURL(video.rawVideoUrl);
          video.rawVideoUrl = null;
          video.isRawLoaded = false;
        }
        if (video.processedVideoUrl) {
          URL.revokeObjectURL(video.processedVideoUrl);
          video.processedVideoUrl = null;
          video.isProcessedLoaded = false;
        }
      });
    },
    
    // Update the selected date
    setSelectedDate(date) {
      this.selectedDate = date;
    },
    
    // Reset date filter
    async resetDateFilter() {
      this.selectedDate = "";
      this.currentDate = null;
      return this.fetchVideos(null, true); // Force refresh
    },
    
    // Set date filter and fetch videos
    async filterByDate(date) {
      // Store the date in the store's state
      this.setSelectedDate(date);
      
      // Only fetch if date is different
      const needsFetch = this.currentDate !== date;
      this.currentDate = date;
      
      if (needsFetch) {
        return this.fetchVideos(date, true); // Force refresh with the new date
      }
      return this.videos;
    }
  },
});