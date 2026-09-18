import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Writes CSV content to a cache file and opens the native share sheet. */
export async function exportCsv(filename: string, csvContent: string): Promise<void> {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(csvContent);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: filename });
  }
}

export function toCsvRow(values: Array<string | number>): string {
  return values
    .map((v) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(',');
}
