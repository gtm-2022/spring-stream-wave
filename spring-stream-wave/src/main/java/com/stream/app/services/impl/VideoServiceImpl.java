package com.stream.app.services.impl;

import com.stream.app.entities.Video;
import com.stream.app.repositories.VideoRepository;
import com.stream.app.services.VideoService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class VideoServiceImpl implements VideoService {

    @Value("${files.video}")
    private String dir;

    @Value("${file.video.hsl}")
    private String hslDir;

    private final VideoRepository videoRepository;

    public VideoServiceImpl(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    @PostConstruct
    public void init() {
        File directory = new File(dir);
        try {
            Files.createDirectories(Paths.get(hslDir));
        } catch (IOException e) {
            throw new RuntimeException("Failed to create HLS directory", e);
        }

        if (!directory.exists()) {
            if (directory.mkdir()) {
                System.out.println("Folder created!");
            } else {
                throw new RuntimeException("Failed to create video directory");
            }
        } else {
            System.out.println("Folder already created");
        }
    }

    @Override
    public Video save(Video video, MultipartFile file) {
        try {
            String filename = file.getOriginalFilename();
            if (filename == null) {
                throw new IllegalArgumentException("Filename cannot be null");
            }
            String contentType = file.getContentType();
            InputStream inputStream = file.getInputStream();
            String cleanFileName = StringUtils.cleanPath(filename);
            Path path = Paths.get(dir, cleanFileName);

            Files.copy(inputStream, path, StandardCopyOption.REPLACE_EXISTING);

            video.setContentType(contentType);
            video.setFilepath(path.toString());

         Video savedVideo=   videoRepository.save(video);

            processVideo(savedVideo.getVideoId());
                // delete actual video file and database entry if exception

           // metadata save
            return savedVideo;
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to save video file", e);
        }
    }

    @Override
    public Video get(String videoId) {
        return videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));
    }

    @Override
    public Video getByTitle(String title) {
        return null; // Implement if needed
    }

    @Override
    public List<Video> getAll() {
        return videoRepository.findAll();
    }

    @Override
    public String processVideo(String videoId) {
        Video video = get(videoId);
        Path videoPath = Paths.get(video.getFilepath());

        try {
            Path outputPath = Paths.get(hslDir, videoId);
            Files.createDirectories(outputPath);

            // Build FFmpeg command
            String ffmpegCmd = String.format(
                    "ffmpeg -i \"%s\" -c:v libx264 -c:a aac -strict -2 -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename \"%s/segment_%%3d.ts\" \"%s/master.m3u8\"",
                    videoPath.toAbsolutePath(), outputPath.toAbsolutePath(), outputPath.toAbsolutePath()
            );

            // Use cmd.exe for Windows
            ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c", ffmpegCmd);
            processBuilder.inheritIO();
            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg process failed with exit code " + exitCode);
            }

            return videoId;

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt(); // Restore interrupted status
            throw new RuntimeException("Video processing failed", e);
        }
    }

}
