export interface templateRes {
   // error code 1 for successful
   // error code -number for failed 
   status: number;
   data: Record<string, string>;
   errMessage?: string;
}