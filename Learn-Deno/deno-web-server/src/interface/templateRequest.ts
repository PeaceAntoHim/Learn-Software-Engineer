export interface templateReq {
   included_segments: Array<string>,
   data: Record<string, string>,
   contents: Record<string, string>, 
   android_sound: string,
   include_external_user_ids: Array<string>,
}