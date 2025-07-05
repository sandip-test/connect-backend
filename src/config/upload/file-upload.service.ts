import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { CloudinaryUploadResult, CloudinaryTransformations } from 'src/common/interfaces/cloudinary.interface';

/**
 * Service for handling file uploads with Cloudinary
 * Provides secure file upload with validation and cloud storage
 */
@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(private configService: ConfigService) {
    // Initialize Cloudinary configuration
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Uploads a file to Cloudinary
   * @param file Multer file object
   * @param folder Target folder name in Cloudinary
   * @param allowedMimeTypes Array of allowed MIME types
   * @param maxSize Maximum file size in bytes
   * @returns Promise<CloudinaryUploadResult> Upload result with URL and public_id
   * @throws BadRequestException If file validation fails
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    allowedMimeTypes: string[],
    maxSize: number,
  ): Promise<CloudinaryUploadResult> {
    try {
      // Validate file
      this.validateFile(file, allowedMimeTypes, maxSize);

      // Generate unique public_id
      const fileExtension = path.extname(file.originalname);
      const uniqueId = `${uuidv4()}${fileExtension}`;
      const publicId = `${folder}/${uniqueId}`;

      // Upload to Cloudinary
      const result = await this.uploadToCloudinary(file.buffer, publicId);

      this.logger.log(`File uploaded successfully to Cloudinary: ${result.public_id}`);
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
      };
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('File upload failed');
    }
  }

  /**
   * Uploads multiple files to Cloudinary
   * @param files Array of Multer file objects
   * @param folder Target folder name in Cloudinary
   * @param allowedMimeTypes Array of allowed MIME types
   * @param maxSize Maximum file size in bytes
   * @returns Promise<CloudinaryUploadResult[]> Array of upload results
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string,
    allowedMimeTypes: string[],
    maxSize: number,
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, folder, allowedMimeTypes, maxSize)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Deletes a file from Cloudinary
   * @param publicId Cloudinary public_id
   * @param resourceType Resource type (image, video, raw, auto)
   * @returns Promise<void>
   */
  async deleteFile(publicId: string, resourceType: string = 'auto'): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      
      if (result.result === 'ok') {
        this.logger.log(`File deleted successfully from Cloudinary: ${publicId}`);
      } else {
        this.logger.warn(`File deletion result: ${result.result} for ${publicId}`);
      }
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`, error.stack);
      // Don't throw error for file deletion as it's not critical
    }
  }

  /**
   * Deletes multiple files from Cloudinary
   * @param publicIds Array of Cloudinary public_ids
   * @param resourceType Resource type (image, video, raw, auto)
   * @returns Promise<void>
   */
  async deleteMultipleFiles(publicIds: string[], resourceType: string = 'auto'): Promise<void> {
    const deletePromises = publicIds.map(publicId => 
      this.deleteFile(publicId, resourceType)
    );

    await Promise.all(deletePromises);
  }

  /**
   * Validates file against specified criteria
   * @param file Multer file object
   * @param allowedMimeTypes Array of allowed MIME types
   * @param maxSize Maximum file size in bytes
   * @throws BadRequestException If validation fails
   */
  private validateFile(
    file: Express.Multer.File,
    allowedMimeTypes: string[],
    maxSize: number,
  ): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new BadRequestException(`File size exceeds ${maxSizeMB}MB limit`);
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    // Check file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = this.getMimeTypeExtensions(allowedMimeTypes);
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(`File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }
  }

  /**
   * Uploads buffer to Cloudinary
   * @param buffer File buffer
   * @param publicId Public ID for the file
   * @returns Promise<any> Cloudinary upload result
   */
  private uploadToCloudinary(buffer: Buffer, publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'auto', // Automatically detect resource type
          folder: publicId.split('/')[0], // Extract folder from public_id
          use_filename: false,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      ).end(buffer);
    });
  }

  /**
   * Maps MIME types to file extensions
   * @param mimeTypes Array of MIME types
   * @returns Array of file extensions
   */
  private getMimeTypeExtensions(mimeTypes: string[]): string[] {
    const mimeExtensionMap: Record<string, string[]> = {
      // Images
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff', '.tif'],
      
      // Documents
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      
    };

    const extensions: string[] = [];
    
    mimeTypes.forEach(mimeType => {
      const exts = mimeExtensionMap[mimeType];
      if (exts) {
        extensions.push(...exts);
      }
    });

    return [...new Set(extensions)]; // Remove duplicates
  }

  /**
   * Generates a transformation URL for images
   * @param publicId Cloudinary public_id
   * @param transformations Transformation options
   * @returns string Transformed image URL
   */
  generateTransformationUrl(publicId: string, transformations: CloudinaryTransformations): string {
    return cloudinary.url(publicId, transformations);
  }

  /**
   * Gets file info from Cloudinary
   * @param publicId Cloudinary public_id
   * @param resourceType Resource type (image, video, raw, auto)
   * @returns Promise<any> File information
   */
  async getFileInfo(publicId: string, resourceType: string = 'auto'): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      this.logger.error(`Failed to get file info: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to get file information');
    }
  }
}

