import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import type { MulterFile } from '../common/interfaces/multer-file.interface';

@Injectable()
export class SupabaseService {
  // Usamos ReturnType<typeof createClient> en vez de importar el tipo SupabaseClient
  // por separado: si hay dos copias de @supabase/supabase-js en node_modules (una anidada
  // por alguna otra dependencia), el tipo importado y el que regresa createClient() pueden
  // no coincidir exactamente. Con ReturnType siempre coinciden porque vienen de la misma fuente.
  private readonly client: ReturnType<typeof createClient>;
  // Nombre del bucket de Supabase Storage donde se guardan los archivos clínicos
  private readonly bucket =
    process.env.SUPABASE_STORAGE_BUCKET ?? 'expedientes';

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error(
        'Faltan las variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY',
      );
    }

    // Usamos la Service Role Key porque esto corre en el backend (nunca exponer esta key al frontend)
    this.client = createClient(url, serviceKey);
  }

  /**
   * Sube un archivo al bucket y regresa la URL pública.
   * @param path Ruta dentro del bucket, ej: "expedientes/<id>/<archivo>.pdf"
   */
  async uploadFile(path: string, file: MulterFile): Promise<string> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Error al subir el archivo a Supabase Storage: ${error.message}`,
      );
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // Elimina un archivo del bucket dada su ruta interna
  async deleteFile(path: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      throw new InternalServerErrorException(
        `Error al eliminar el archivo de Supabase Storage: ${error.message}`,
      );
    }
  }

  // Dada una URL pública ya guardada en la BD, extrae el "path" interno del bucket para poder borrarla
  extractPathFromUrl(url: string): string {
    const marker = `/storage/v1/object/public/${this.bucket}/`;
    const idx = url.indexOf(marker);
    return idx === -1 ? url : url.substring(idx + marker.length);
  }
}
