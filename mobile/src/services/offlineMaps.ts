import { Platform } from 'react-native';
import type { OfflineManager as OfflineManagerType, OfflinePack, OfflinePackStatus } from '@maplibre/maplibre-react-native';

// MapLibre has no web renderer, and its package unconditionally pulls in
// native-only codegen components at require-time. Loading it lazily (only on
// native platforms) keeps this module importable from screens that are
// statically imported by the navigator regardless of platform.
const OfflineManager: typeof OfflineManagerType | null =
  Platform.OS !== 'web' ? require('@maplibre/maplibre-react-native').OfflineManager : null;

// A real, free, no-API-key hosted vector style (OpenFreeMap). This is deliberately the
// ONLY style used on the Evacuation screen — whatever tiles get downloaded into an
// offline pack must be the exact same style rendered live, or switching layers while
// offline would show blank tiles. (Unlike the web app's 3-layer switcher, which doesn't
// need this constraint since it was never offline-capable in the first place.)
export const EVACUATION_MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

const PACK_NAME = 'evacuation-region';

export function computeBounds(lat: number, lng: number, radiusKm: number): [number, number, number, number] {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return [lng - lngDelta, lat - latDelta, lng + lngDelta, lat + latDelta]; // [west, south, east, north]
}

export interface DownloadProgress {
  percentage: number;
  completedResourceCount: number;
  completedResourceSize: number;
}

/**
 * Downloads a real offline map region (replacing the web app's simulated
 * setTimeout-based "cache downloader"). Deletes any prior pack first, since this
 * screen only ever needs one active cached region at a time.
 */
export async function downloadEvacuationRegion(
  lat: number,
  lng: number,
  radiusKm: number,
  onProgress: (status: DownloadProgress) => void
): Promise<{ pack: OfflinePack; status: OfflinePackStatus }> {
  if (!OfflineManager) throw new Error('Offline map caching is only available on Android/iOS.');

  await deleteExistingPacks();

  const bounds = computeBounds(lat, lng, radiusKm);

  return new Promise((resolve, reject) => {
    OfflineManager!.createPack(
      {
        mapStyle: EVACUATION_MAP_STYLE,
        bounds,
        minZoom: 10,
        maxZoom: radiusKm <= 5 ? 16 : radiusKm <= 10 ? 15 : 14,
        metadata: { name: PACK_NAME, radiusKm, lat, lng, createdAt: Date.now() }
      },
      (pack, status) => {
        onProgress(status);
        if (status.state === 'complete') {
          OfflineManager!.removeListener(pack.id);
          resolve({ pack, status });
        }
      },
      (pack, error) => {
        OfflineManager!.removeListener(pack.id);
        reject(new Error(error.message));
      }
    ).catch(reject);
  });
}

export async function deleteExistingPacks(): Promise<void> {
  if (!OfflineManager) return;
  const packs = await OfflineManager.getPacks();
  for (const pack of packs) {
    if (pack.metadata?.name === PACK_NAME) {
      await OfflineManager.deletePack(pack.id);
    }
  }
}

export async function getExistingPackStatus(): Promise<OfflinePackStatus | null> {
  if (!OfflineManager) return null;
  const packs = await OfflineManager.getPacks();
  const pack = packs.find((p) => p.metadata?.name === PACK_NAME);
  if (!pack) return null;
  return pack.status();
}
