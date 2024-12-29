import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import Hls from "hls.js";
import "video.js/dist/video-js.css";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Video.js player
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: true,
      muted: true,
      preload: "auto",
      fluid: true, // Make video responsive
    });

    // Set up Hls.js
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });

      // Cleanup Hls.js on component unmount
      return () => {
        hls.destroy();
      };
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
      videoRef.current.addEventListener("canplay", () => {
        videoRef.current.play();
      });

      // Cleanup on component unmount
      return () => {
        videoRef.current.removeEventListener("canplay", () => {
          videoRef.current.play();
        });
      };
    } else {
      console.error("Video format not supported");
      toast.error("Video format not supported");
    }

    // Cleanup Video.js player on component unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [src]);

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        className="video-js vjs-default-skin"
        controls
      ></video>
    </div>
  );
}

VideoPlayer.propTypes = {
  src: PropTypes.string.isRequired,
};

export default VideoPlayer;
