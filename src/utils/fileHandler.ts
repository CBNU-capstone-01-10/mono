import { v4 } from 'uuid';
import mime from 'mime-types';

interface generateCompleteFileNameOption {
  name?: string;
  mimeType: string;
}
export function generateCompleteFileName(data: generateCompleteFileNameOption) {
  const extension = mime.extension(data.mimeType);
  return data.name ? data.name + '.' + extension : v4() + '.' + extension;
}
