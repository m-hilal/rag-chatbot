import { SetMetadata } from '@nestjs/common';
import { ThrottlerOptions } from '@nestjs/throttler';

export const Throttle = (options: ThrottlerOptions) => SetMetadata('throttler', options); 