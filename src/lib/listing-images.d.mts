export function listingForImage(id: number): Promise<{
  id: number;
  owner_id: number;
  full_name: string;
  status: string;
  object_key: string | null;
} | null>;
export function saveListingImage(
  id: number,
  ownerId: number,
  input: Buffer,
): Promise<void>;
export function cleanMedia(): Promise<void>;

export function removeListingImage(id: number, ownerId: number): Promise<void>;
