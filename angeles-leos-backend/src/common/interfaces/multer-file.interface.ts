// Definimos esta interfaz nosotros mismos en vez de usar Express.Multer.File,
// porque @types/multer y @types/express (v5) chocan al fusionar el namespace
// global 'Express.Multer' (error TS2694 "has no exported member 'Multer'").
// Esta interfaz tiene exactamente los mismos campos que Multer coloca en runtime.
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}
