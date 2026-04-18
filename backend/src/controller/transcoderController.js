import { exec } from "child_process";
import fs from "fs";
import transcodeModel from "../model/transcode.model.js";
// import { FFmpeg } from "@ffmpeg/ffmpeg";
const transcodeHandler = async (data) => {
  try {
    const { videoId, uploadedVideoPath } = data.data;
    console.log("uploadVideoPath", uploadedVideoPath);
    const outputFolderRootPath = `./hls-outputs/${videoId}`;

    const outputFolderSubDirectoryPath = {
      "360p": `${outputFolderRootPath}/360p/`,
      "480p": `${outputFolderRootPath}/480p/`,
      "720p": `${outputFolderRootPath}/720p/`,
      "1080p": `${outputFolderRootPath}/1080p/`,
    };

    fs.mkdirSync(outputFolderRootPath, { recursive: true });

    Object.values(outputFolderSubDirectoryPath).forEach((dir) => {
      fs.mkdirSync(dir, { recursive: true });
    });

    const executeFFmpegCommand = (cmd) =>
      new Promise((resolve, reject) => {
        exec(cmd, (error) => {
          if (error) return reject(error);
          resolve();
        });
      });

    const ffmpegCommands = [
      `ffmpeg -i ${uploadedVideoPath} -vf "scale=-2:360" -c:v libx264 -b:v 800k -c:a aac -b:a 96k -f hls -hls_time 15 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath["360p"]}/segment%03d.ts" "${outputFolderSubDirectoryPath["360p"]}/index.m3u8"`,

      `ffmpeg -i ${uploadedVideoPath} -vf "scale=-2:480" -c:v libx264 -b:v 1400k -c:a aac -b:a 128k -f hls -hls_time 15 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath["480p"]}/segment%03d.ts" "${outputFolderSubDirectoryPath["480p"]}/index.m3u8"`,

      `ffmpeg -i ${uploadedVideoPath} -vf "scale=-2:720" -c:v libx264 -b:v 2800k -c:a aac -b:a 128k -f hls -hls_time 15 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath["720p"]}/segment%03d.ts" "${outputFolderSubDirectoryPath["720p"]}/index.m3u8"`,

      `ffmpeg -i ${uploadedVideoPath} -vf "scale=-2:1080" -c:v libx264 -b:v 5000k -c:a aac -b:a 192k -f hls -hls_time 15 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath["1080p"]}/segment%03d.ts" "${outputFolderSubDirectoryPath["1080p"]}/index.m3u8"`,

      `ffmpeg -i ${uploadedVideoPath} -ss 1.4 -frames:v 1 ${outputFolderRootPath}/video-poster.png`,
    ];

    for (const cmd of ffmpegCommands) {
      await executeFFmpegCommand(cmd);
    }

    const masterPlaylistPath = `${outputFolderRootPath}/index.m3u8`;

    const masterPlaylistContent = `
        #EXTM3U
    
        #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
        360p/index.m3u8
    
        #EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
        480p/index.m3u8
    
        #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
        720p/index.m3u8
    
        #EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
        1080p/index.m3u8
        `.trim();

    fs.writeFileSync(masterPlaylistPath, masterPlaylistContent);

    const baseUrl = `http://localhost:${process.env.PORT}/hls-outputs/${videoId}`;

    const videoUrls = {
      master: `${baseUrl}/index.m3u8`,
      "360p": `${baseUrl}/360p/index.m3u8`,
      "480p": `${baseUrl}/480p/index.m3u8`,
      "720p": `${baseUrl}/720p/index.m3u8`,
      "1080p": `${baseUrl}/1080p/index.m3u8`,
      poster: `${baseUrl}/video-poster.png`,
    };

    await transcodeModel.updateOne(
      { videoId },
      {
        $set: {
          videoUrls,
          status: "completed",
        },
      },
    );

    console.log("complete transcode video");
    return { success: true };
  } catch (error) {
    console.log("error in transcodeHandler func", error);
    process.exit(1);
  }
};

export default transcodeHandler;
