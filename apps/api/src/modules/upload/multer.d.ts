declare module 'multer' {
  import { Request } from 'express';
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }
  interface DiskStorageOptions {
    destination?:
      | string
      | ((
          req: Request,
          file: File,
          cb: (error: Error | null, destination: string) => void,
        ) => void);
    filename?: (
      req: Request,
      file: File,
      cb: (error: Error | null, filename: string) => void,
    ) => void;
  }
  interface StorageEngine {
    _handleFile(
      req: Request,
      file: File,
      cb: (error: Error | null, info?: Partial<File>) => void,
    ): void;
    _removeFile(req: Request, file: File, cb: (error: Error) => void): void;
  }
  interface MulterOptions {
    dest?: string;
    storage?: StorageEngine;
    limits?: { fileSize?: number };
    fileFilter?: (
      req: Request,
      file: File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => void;
  }
  function diskStorage(options: DiskStorageOptions): StorageEngine;
  export { diskStorage };
  export default function multer(options?: MulterOptions): any;
}
