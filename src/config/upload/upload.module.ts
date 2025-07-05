import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';

/**
 * Upload Module
 * Handles file upload functionality across the application
 */
@Module({
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class UploadModule {}