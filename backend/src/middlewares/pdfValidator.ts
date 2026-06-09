import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';

/**
 * Express middleware to validate that the uploaded file is a valid PDF
 * by inspecting its magic bytes.
 */
export const validatePDFHeader = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  // If no file was uploaded, let the next handler (like the controller check) manage it
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  let fileHandle: any = null;

  try {
    // Open the file in read-only mode
    fileHandle = await fs.open(filePath, 'r');
    
    // Read the first 5 bytes
    const buffer = Buffer.alloc(5);
    const { bytesRead } = await fileHandle.read(buffer, 0, 5, 0);

    // Close the file handle immediately
    await fileHandle.close();
    fileHandle = null;

    if (bytesRead < 5) {
      throw new Error('File is too small to be a valid PDF.');
    }

    const header = buffer.toString('utf-8');

    // PDF magic bytes check
    if (header !== '%PDF-') {
      // Log the failure details
      console.error(`[Upload Security Alert] [${new Date().toISOString()}] PDF magic bytes check failed for file: ${req.file.originalname}. Expected '%PDF-', got '${header}'. Client IP: ${req.ip}`);

      // Delete the invalid file from disk
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error(`[Upload Security Error] Failed to delete invalid file at ${filePath}:`, unlinkError);
      }

      return res.status(400).json({
        message: 'Security validation failed: The uploaded file is not a valid PDF document (invalid file header).'
      });
    }

    // Header matches %PDF-, proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Close the file handle if it's still open
    if (fileHandle) {
      try {
        await fileHandle.close();
      } catch (closeError) {
        console.error('Error closing file handle during exception:', closeError);
      }
    }

    // Log the failure details
    console.error(`[Upload Security Failure] [${new Date().toISOString()}] Error validating file header for ${req.file?.originalname || 'unknown file'}:`, error);

    // Delete the file if it exists
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      // Ignore if file was not created or already deleted
    }

    return res.status(400).json({
      message: 'Failed to process file. Please ensure it is a valid PDF.'
    });
  }
};
