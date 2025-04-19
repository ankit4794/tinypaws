import { Storage, Bucket } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as stream from 'stream';
import { promisify } from 'util';

/**
 * Google Cloud Storage Service
 * This service handles all interactions with Google Cloud Storage
 * for storing and retrieving images and other media assets
 */
export class GCSStorageService {
  private storage: Storage;
  private bucket: Bucket;
  private bucketName: string;
  private pipeline = promisify(stream.pipeline);

  constructor() {
    // Check if we have a JSON key file
    const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    this.bucketName = process.env.GCS_BUCKET_NAME || '';
    
    if (!this.bucketName) {
      throw new Error('GCS_BUCKET_NAME environment variable is required');
    }

    if (keyFilePath) {
      // Initialize with explicit key file
      this.storage = new Storage({
        keyFilename: keyFilePath
      });
    } else {
      // Check if we have JSON credentials directly
      const credentials = process.env.GCS_CREDENTIALS;
      
      if (credentials) {
        try {
          const parsedCredentials = JSON.parse(credentials);
          this.storage = new Storage({
            credentials: parsedCredentials
          });
        } catch (error) {
          throw new Error('Invalid GCS_CREDENTIALS format. Must be a valid JSON string.');
        }
      } else {
        // Fall back to default authentication (useful for local development or when using service accounts)
        this.storage = new Storage();
      }
    }

    // Get bucket reference
    this.bucket = this.storage.bucket(this.bucketName);
    console.log(`GCS Storage initialized with bucket: ${this.bucketName}`);
  }

  /**
   * Generate a unique filename to avoid collisions
   */
  private generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const basename = path.basename(originalFilename, ext);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${basename}-${timestamp}-${randomString}${ext}`;
  }

  /**
   * Upload a file to GCS
   * @param filepath Local file path
   * @param destinationPath Destination path in GCS bucket (folder structure)
   * @returns Public URL of the uploaded file
   */
  async uploadFile(filepath: string, destinationPath: string = ''): Promise<string> {
    try {
      const filename = path.basename(filepath);
      const uniqueFilename = this.generateUniqueFilename(filename);
      const destination = destinationPath ? 
        `${destinationPath}/${uniqueFilename}` : uniqueFilename;

      const [file] = await this.bucket.upload(filepath, {
        destination,
        metadata: {
          cacheControl: 'public, max-age=31536000', // Cache for 1 year
        },
      });

      // Make the file publicly readable
      await file.makePublic();

      // Return public URL
      return file.publicUrl();
    } catch (error) {
      console.error('Error uploading file to GCS:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload a buffer to GCS (useful for in-memory files)
   * @param buffer File data buffer
   * @param filename Original filename (used to determine file extension)
   * @param destinationPath Destination path in GCS bucket (folder structure)
   * @returns Public URL of the uploaded file
   */
  async uploadBuffer(buffer: Buffer, filename: string, destinationPath: string = ''): Promise<string> {
    try {
      const uniqueFilename = this.generateUniqueFilename(filename);
      const destination = destinationPath ? 
        `${destinationPath}/${uniqueFilename}` : uniqueFilename;

      const file = this.bucket.file(destination);
      await file.save(buffer, {
        metadata: {
          contentType: this.getMimeType(filename),
          cacheControl: 'public, max-age=31536000', // Cache for 1 year
        },
      });

      // Make the file publicly readable
      await file.makePublic();

      // Return public URL
      return file.publicUrl();
    } catch (error) {
      console.error('Error uploading buffer to GCS:', error);
      throw new Error(`Failed to upload buffer: ${error.message}`);
    }
  }

  /**
   * Upload from a readable stream
   * @param readableStream Source readable stream
   * @param filename Original filename (used to determine file extension)
   * @param destinationPath Destination path in GCS bucket (folder structure)
   * @returns Public URL of the uploaded file
   */
  async uploadFromStream(readableStream: NodeJS.ReadableStream, filename: string, destinationPath: string = ''): Promise<string> {
    try {
      const uniqueFilename = this.generateUniqueFilename(filename);
      const destination = destinationPath ? 
        `${destinationPath}/${uniqueFilename}` : uniqueFilename;

      const file = this.bucket.file(destination);
      const writeStream = file.createWriteStream({
        metadata: {
          contentType: this.getMimeType(filename),
          cacheControl: 'public, max-age=31536000', // Cache for 1 year
        },
      });

      // Use pipeline for proper error handling
      await this.pipeline(readableStream, writeStream);

      // Make the file publicly readable
      await file.makePublic();

      // Return public URL
      return file.publicUrl();
    } catch (error) {
      console.error('Error uploading stream to GCS:', error);
      throw new Error(`Failed to upload stream: ${error.message}`);
    }
  }

  /**
   * Delete a file from GCS
   * @param fileUrl Public URL or path of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      let filename: string;
      
      // Extract filename from URL or path
      if (fileUrl.startsWith('http')) {
        // Extract path from URL
        const url = new URL(fileUrl);
        const pathParts = url.pathname.split('/');
        // Remove empty strings and get the last part (filename)
        filename = pathParts.filter(Boolean).pop() || '';
      } else {
        // Assume it's a path
        filename = fileUrl;
      }

      // If filename is empty, throw error
      if (!filename) {
        throw new Error(`Could not extract filename from ${fileUrl}`);
      }

      // Delete the file
      await this.bucket.file(filename).delete();
    } catch (error) {
      console.error('Error deleting file from GCS:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get the MIME type based on file extension
   */
  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.tar': 'application/x-tar',
      '.gz': 'application/gzip',
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Create a signed URL for temporary access
   * @param filename File path in the bucket
   * @param expiresInMinutes How long the signed URL should be valid (default: 15 minutes)
   * @returns Signed URL with temporary access
   */
  async getSignedUrl(filename: string, expiresInMinutes: number = 15): Promise<string> {
    try {
      const options = {
        version: 'v4' as const,
        action: 'read' as const,
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      };

      const [url] = await this.bucket.file(filename).getSignedUrl(options);
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }
}

// Singleton instance for use throughout the application
let gcsStorageService: GCSStorageService | null = null;

export function getGCSStorageService(): GCSStorageService {
  if (!gcsStorageService) {
    try {
      gcsStorageService = new GCSStorageService();
    } catch (error) {
      console.error('Failed to initialize GCS storage service:', error);
      throw error;
    }
  }
  return gcsStorageService;
}