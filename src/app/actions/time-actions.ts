"use server";

export async function getServerTime() {
  const now = new Date();
  return {
    timestamp: now.getTime(),
    iso: now.toISOString(),
  };
}
