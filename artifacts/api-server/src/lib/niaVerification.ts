import { logger } from "./logger";

export type NiaStatus = "aktif" | "tidak_aktif" | "pending";

export async function checkNiaStatus(nia: string): Promise<NiaStatus> {
  try {
    const url = `https://api.peradi.or.id/api/v1/member/${encodeURIComponent(nia)}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return "pending";
    const data = await res.json() as { status?: string };
    if (data?.status === "aktif") return "aktif";
    if (data?.status) return "tidak_aktif";
    return "pending";
  } catch (err) {
    logger.warn({ err, nia }, "NIA verification failed, defaulting to pending");
    return "pending";
  }
}
