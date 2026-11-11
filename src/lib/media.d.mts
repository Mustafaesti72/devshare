export function storageConfigured():boolean;
export function checkStorage():Promise<void>;
export function readImage(name:string):Promise<{bytes:Uint8Array;etag:string|undefined}>;
export function writeImage(name:string,bytes:Uint8Array):Promise<void>;
