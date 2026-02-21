import { PipeTransform, ArgumentMetadata, BadRequestException, Injectable } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const parsed = this.schema.safeParse(value);

    if (!parsed.success) {
      const formattedErrors = parsed.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );

      throw new BadRequestException({
        message: 'Error de validación en los datos enviados',
        errors: formattedErrors,
      });
    }

    return parsed.data;
  }
}