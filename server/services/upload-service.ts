import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import * as util from 'util';
import { Request } from 'express';
import multer from 'multer';
import { getGCSStorageService } from './gcs-storage';

// Promisify fs functions
const mkdtemp = util.promisify(fs.mkdtemp);
const unlink = util.promisify(fs.unlink);
const rmdir = util.promisify(fs.rmdir);

// Define allowed file types and size limits
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      // Create a temporary directory
      const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'tinypaws-upload-'));
      cb(null, tmpDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: function (req, file, cb) {
    // Sanitize filename
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const randomName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `${randomName}-${sanitizedFilename}`);
  },
});

// Create multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
    }
  },
});

/**
 * Upload Service
 * This service handles file uploads for the application
 */
export class UploadService {
  /**
   * Upload a single image file to GCS
   * @param req Express request
   * @param fieldName Name of the form field containing the file
   * @param destinationPath Path in GCS bucket to store the file
   * @returns Promise resolving to the public URL of the uploaded file
   */
  async uploadSingleImage(req: Request, fieldName: string, destinationPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadMiddleware = upload.single(fieldName);
      
      uploadMiddleware(req, req.res as any, async (err) => {
        if (err) {
          return reject(err);
        }
        
        if (!req.file) {
          return reject(new Error(`No file uploaded for field ${fieldName}`));
        }
        
        try {
          // Upload to GCS
          const gcsService = getGCSStorageService();
          const url = await gcsService.uploadFile(req.file.path, destinationPath);
          
          // Clean up temporary file
          await unlink(req.file.path);
          
          // Clean up temporary directory
          const tmpDir = path.dirname(req.file.path);
          await rmdir(tmpDir);
          
          resolve(url);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
  /**
   * Upload multiple image files to GCS
   * @param req Express request
   * @param fieldName Name of the form field containing the files
   * @param destinationPath Path in GCS bucket to store the files
   * @param maxFiles Maximum number of files allowed (default: 5)
   * @returns Promise resolving to an array of public URLs of the uploaded files
   */
  async uploadMultipleImages(
    req: Request,
    fieldName: string,
    destinationPath: string,
    maxFiles: number = 5
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const uploadMiddleware = upload.array(fieldName, maxFiles);
      
      uploadMiddleware(req, req.res as any, async (err) => {
        if (err) {
          return reject(err);
        }
        
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          return reject(new Error(`No files uploaded for field ${fieldName}`));
        }
        
        try {
          const gcsService = getGCSStorageService();
          const urls: string[] = [];
          let tmpDir: string | null = null;
          
          // Upload each file
          for (const file of req.files) {
            const url = await gcsService.uploadFile(file.path, destinationPath);
            urls.push(url);
            
            // Clean up temporary file
            await unlink(file.path);
            
            // Keep track of tmp directory (should be the same for all files)
            if (!tmpDir) {
              tmpDir = path.dirname(file.path);
            }
          }
          
          // Clean up temporary directory
          if (tmpDir) {
            await rmdir(tmpDir);
          }
          
          resolve(urls);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

// Create singleton instance
let uploadService: UploadService | null = null;

export function getUploadService(): UploadService {
  if (!uploadService) {
    uploadService = new UploadService();
  }
  return uploadService;
}