import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Custom validator for phone number validation
 * Supports international phone number formats
 */
export function IsPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          
          // Phone number regex pattern
          // Supports formats: +977-9841234567, +977 9841234567, 9841234567, 01-4567890
          const phoneRegex = /^[+]?[\d\s\-\(\)]{10,20}$/;
          
          // Remove all non-digit characters except +
          const digitsOnly = value.replace(/[^\d+]/g, '');
          
          // Check if it matches the pattern and has valid length
          return phoneRegex.test(value) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid phone number`;
        },
      },
    });
  };
}