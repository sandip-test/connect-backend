
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Decorator for Swagger file upload documentation
 * @param fieldName Name of the file field
 * @param required Whether the file is required
 * @param description Description for the API documentation
 */
export function ApiFile(fieldName: string, required: boolean = false, description?: string) {
  return applyDecorators(
    ApiProperty({
      name: fieldName,
      type: 'string',
      format: 'binary',
      required,
      description: description || `File upload for ${fieldName}`,
    }),
  );
}