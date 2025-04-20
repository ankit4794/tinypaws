import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Initialize Google Cloud Storage
let storage: Storage;

try {
  // Check if GCS credentials are available
  if (!process.env.GCS_CREDENTIALS) {
    console.warn('GCS_CREDENTIALS environment variable not set');
  } else {
    try {
      const credentials = JSON.parse(process.env.GCS_CREDENTIALS);
      storage = new Storage({ credentials });
      console.log('Google Cloud Storage initialized successfully');
    } catch (jsonError) {
      console.warn('GCS_CREDENTIALS is not valid JSON. Using default credentials.');
      // Use default credentials (useful in development environments)
      storage = new Storage();
    }
  }
} catch (error) {
  console.error('Error initializing Google Cloud Storage:', error);
}

/**
 * Uploads a file to Google Cloud Storage
 * @param file File to upload from multer
 * @param folder Folder to upload to (e.g., 'products', 'brands')
 * @returns URL of the uploaded file
 */
export async function uploadToGCS(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
  // Fallback if GCS is not configured
  if (!storage || !process.env.GCS_BUCKET_NAME) {
    console.warn('GCS not configured properly, returning local file path');
    // In a real production environment, this would be a server URL
    return `/local-uploads/${folder}/${file.originalname}`;
  }

  try {
    const bucketName = process.env.GCS_BUCKET_NAME;
    const bucket = storage.bucket(bucketName);
    
    // Generate a unique filename to prevent overwrites
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${folder}/${uuidv4()}${fileExtension}`;
    
    // Create a new blob in the bucket and upload the file data
    const blob = bucket.file(uniqueFilename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Return a promise that resolves with the public URL of the file
    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        console.error('Error uploading to GCS:', error);
        reject(error);
      });

      blobStream.on('finish', async () => {
        // Make the file public
        await blob.makePublic();
        
        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFilename}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error in uploadToGCS:', error);
    throw error;
  }
}