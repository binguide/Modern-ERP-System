import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

@UseGuards(AuthGuard('jwt'))
@Controller('upload')
export class UploadController {
  @Post('item-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', '..', 'uploads', 'items'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIMES.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  uploadItemImage(@UploadedFile() file: any, @CurrentUser('companyId') _companyId: string) {
    if (!file) throw new BadRequestException('File is required');
    return { url: `/uploads/items/${file.filename}` };
  }
}
