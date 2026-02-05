// Local file storage for BookMe.kz
import fs from 'fs';
import path from 'path';

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean the key and create file path
    const key = relKey.replace(/^\/+/, '');
    const filePath = path.join(uploadsDir, key);
    const fileDir = path.dirname(filePath);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, data);
    
    // Return the URL (relative to public folder)
    const url = '/uploads/' + key;
    console.log('[Storage] File saved to permanent location:', url);
    
    return { key, url };
  } catch (error) {
    console.error('[Storage] Error saving file:', error);
    throw error;
  }
}

export async function storageGet(key: string): Promise<Buffer | null> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, key);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error('[Storage] Error reading file:', error);
    return null;
  }
}

export async function storageDelete(key: string): Promise<void> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, key);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('[Storage] File deleted:', key);
    }
  } catch (error) {
    console.error('[Storage] Error deleting file:', error);
    throw error;
  }
}