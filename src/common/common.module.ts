import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextChunkingUtils } from './utility/text-chunking.utils';

@Global()
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([]),
  ],
  controllers: [],
  providers: [TextChunkingUtils],
  exports: [TextChunkingUtils],
})
export class CommonModule {}

