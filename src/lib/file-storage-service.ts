import { supabase } from './supabase-client';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Validation schemas
const FileMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  size: z.number().positive(),
  type: z.string(),
  uploaded_by: z.string().uuid(),
  uploaded_at: z.string().datetime(),
  associated_entity: z.enum([
    'transaction', 
    'inventory_item', 
    'storeroom', 
    'user_document'
  ]).optional(),
  associated_entity_id: z.string().uuid().optional(),
  access_level: z.enum(['private', 'restricted', 'public']).default('private')
});

const FileUploadOptionsSchema = z.object({
  file: z.instanceof(File),
  associated_entity: FileMetadataSchema.shape.associated_entity.optional(),
  associated_entity_id: z.string().uuid().optional(),
  access_level: FileMetadataSchema.shape.access_level.optional(),
  overwrite: z.boolean().optional().default(false)
});

const FileQuerySchema = z.object({
  entity_type: FileMetadataSchema.shape.associated_entity.optional(),
  entity_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  access_level: FileMetadataSchema.shape.access_level.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
});

export class FileStorageService {
  private static STORAGE_BUCKETS = {
    TRANSACTIONS: 'transaction_documents',
    INVENTORY: 'inventory_files',
    USER_DOCS: 'user_documents'
  };

  // Determine storage bucket based on file type
  private static getBucketForEntity(entity?: string): string {
    switch (entity) {
      case 'transaction':
        return this.STORAGE_BUCKETS.TRANSACTIONS;
      case 'inventory_item':
        return this.STORAGE_BUCKETS.INVENTORY;
      case 'user_document':
        return this.STORAGE_BUCKETS.USER_DOCS;
      default:
        return this.STORAGE_BUCKETS.USER_DOCS;
    }
  }

  // Get current user ID (implement proper authentication)
  private static getCurrentUserId(): string {
    // TODO: Implement actual user authentication
    return 'current-user-id';
  }

  // Upload file with metadata
  static async uploadFile(options: z.infer<typeof FileUploadOptionsSchema>) {
    const validatedOptions = FileUploadOptionsSchema.parse(options);
    const { file } = validatedOptions;

    // Generate unique filename
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${fileId}.${fileExtension}`;

    // Determine bucket
    const bucket = this.getBucketForEntity(validatedOptions.associated_entity);

    // Upload file
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, file, {
        upsert: validatedOptions.overwrite
      });

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Create file metadata
    const fileMetadata = FileMetadataSchema.parse({
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded_by: this.getCurrentUserId(), // Implement user authentication
      uploaded_at: new Date().toISOString(),
      associated_entity: validatedOptions.associated_entity,
      associated_entity_id: validatedOptions.associated_entity_id,
      access_level: validatedOptions.access_level || 'private'
    });

    // Store metadata in database
    const { error: metadataError } = await supabase
      .from('file_metadata')
      .insert(fileMetadata);

    if (metadataError) {
      // Rollback file upload if metadata insertion fails
      await supabase.storage.from(bucket).remove([uniqueFileName]);
      throw new Error(`Metadata storage failed: ${metadataError.message}`);
    }

    return fileMetadata;
  }

  // Download file
  static async downloadFile(fileId: string) {
    // Retrieve file metadata
    const { data: metadataResult, error: metadataError } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('id', fileId)
      .single();

    if (metadataError) {
      throw new Error(`File metadata retrieval failed: ${metadataError.message}`);
    }

    // Check access permissions
    this.checkFileAccessPermissions(metadataResult);

    // Determine bucket
    const bucket = this.getBucketForEntity(metadataResult.associated_entity);

    // Download file
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(`${fileId}.${metadataResult.name.split('.').pop()}`);

    if (error) {
      throw new Error(`File download failed: ${error.message}`);
    }

    return {
      file: data,
      metadata: metadataResult
    };
  }

  // List files with advanced filtering
  static async listFiles(options: z.infer<typeof FileQuerySchema> = {}) {
    const validatedOptions = FileQuerySchema.parse(options);

    // Build query
    let query = supabase.from('file_metadata').select('*');

    if (validatedOptions.entity_type) {
      query = query.eq('associated_entity', validatedOptions.entity_type);
    }

    if (validatedOptions.entity_id) {
      query = query.eq('associated_entity_id', validatedOptions.entity_id);
    }

    if (validatedOptions.user_id) {
      query = query.eq('uploaded_by', validatedOptions.user_id);
    }

    if (validatedOptions.access_level) {
      query = query.eq('access_level', validatedOptions.access_level);
    }

    if (validatedOptions.start_date) {
      query = query.gte('uploaded_at', validatedOptions.start_date);
    }

    if (validatedOptions.end_date) {
      query = query.lte('uploaded_at', validatedOptions.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`File listing failed: ${error.message}`);
    }

    return data;
  }

  // Delete file
  static async deleteFile(fileId: string) {
    // Retrieve file metadata
    const { data: metadataResult, error: metadataError } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('id', fileId)
      .single();

    if (metadataError) {
      throw new Error(`File metadata retrieval failed: ${metadataError.message}`);
    }

    // Check deletion permissions
    this.checkFileDeletionPermissions(metadataResult);

    // Determine bucket
    const bucket = this.getBucketForEntity(metadataResult.associated_entity);

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([`${fileId}.${metadataResult.name.split('.').pop()}`]);

    if (storageError) {
      throw new Error(`File deletion from storage failed: ${storageError.message}`);
    }

    // Delete metadata
    const { error: metadataDeleteError } = await supabase
      .from('file_metadata')
      .delete()
      .eq('id', fileId);

    if (metadataDeleteError) {
      throw new Error(`File metadata deletion failed: ${metadataDeleteError.message}`);
    }

    return { success: true, deletedFile: metadataResult };
  }

  // Check file access permissions
  private static checkFileAccessPermissions(metadata: any) {
    const currentUserId = this.getCurrentUserId();
    
    if (metadata.access_level === 'private' && metadata.uploaded_by !== currentUserId) {
      throw new Error('Insufficient permissions to access this file');
    }
  }

  // Check file deletion permissions
  private static checkFileDeletionPermissions(metadata: any) {
    const currentUserId = this.getCurrentUserId();
    const currentUserRole = this.getCurrentUserRole();

    // Only allow deletion by file owner or admin
    if (
      metadata.uploaded_by !== currentUserId && 
      currentUserRole !== 'admin'
    ) {
      throw new Error('Unauthorized: Cannot delete this file');
    }
  }

  // Get current user role (implement proper authentication)
  private static getCurrentUserRole(): string {
    // TODO: Implement actual role retrieval
    return 'current-user-role';
  }
}

// Export individual methods for easier importing
export const {
  uploadFile,
  downloadFile,
  listFiles,
  deleteFile
} = FileStorageService;
