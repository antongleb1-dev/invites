import { Router, Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import { storagePut } from "./storage";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for video
  },
  fileFilter: (req, file, cb) => {
    // Accept images, audio, and video
    const allowedTypes = ["image/", "audio/", "video/"];
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    
    console.log(`[Upload] File filter: ${file.originalname}, MIME: ${file.mimetype}, Allowed: ${isAllowed}`);
    
    if (!isAllowed) {
      return cb(new Error("Разрешены только изображения, аудио и видео файлы"));
    }
    cb(null, true);
  },
});

// Error handling middleware for multer
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError) {
    console.error("[Upload] Multer error:", err.code, err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: "Файл слишком большой. Максимум 100MB" });
    }
    return res.status(400).json({ error: `Ошибка загрузки: ${err.message}` });
  } else if (err) {
    console.error("[Upload] Error:", err.message);
    return res.status(400).json({ error: err.message });
  }
  next();
};

router.post("/upload", upload.single("file"), handleMulterError, async (req: Request, res: Response) => {
  try {
    console.log("[Upload] Request received");
    
    if (!req.file) {
      console.error("[Upload] No file in request");
      return res.status(400).json({ error: "Файл не загружен" });
    }

    console.log(`[Upload] Processing: ${req.file.originalname}, Size: ${req.file.size}, MIME: ${req.file.mimetype}`);

    const timestamp = Date.now();
    // Get file extension
    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'bin';
    
    // Determine folder and prefix based on file type
    const isAudio = req.file.mimetype.startsWith("audio/");
    const isVideo = req.file.mimetype.startsWith("video/");
    
    let folder: string;
    let prefix: string;
    
    if (isAudio) {
      folder = "audio";
      prefix = "music";
    } else if (isVideo) {
      folder = "video";
      prefix = "video";
    } else {
      folder = "weddings";
      prefix = "custom-background";
    }
    
    // Generate safe filename without Cyrillic characters
    const filename = `${prefix}-${timestamp}.${ext}`;
    const key = `${folder}/${filename}`;

    console.log(`[Upload] Saving to storage: ${key}`);
    
    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

    console.log(`[Upload] Success: ${url}`);
    
    res.json({ url, key, type: req.file.mimetype });
  } catch (error: any) {
    console.error("[Upload] Storage error:", error);
    res.status(500).json({ error: error.message || "Ошибка сохранения файла" });
  }
});

export default router;

