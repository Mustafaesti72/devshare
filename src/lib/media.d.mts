export function storageConfigured(): boolean;
export function checkStorage(): Promise<void>;
export function readImage(
  name: string,
): Promise<{ bytes: Uint8Array; etag: string | undefined }>;
export function writeImage(name: string, bytes: Uint8Array): Promise<void>;

export function readObject(
  key: string,
): Promise<{ bytes: Uint8Array; etag: string | undefined }>;
export function writeObject(
  key: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<void>;
export function deleteObject(key: string): Promise<void>;
