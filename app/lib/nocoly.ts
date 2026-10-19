const NOCOLY_API = "https://www.nocoly.com/api/v3";

export class NocolyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NocolyError";
  }
}

type NocolyPayload = {
  success?: boolean;
  error_msg?: string;
  data?: unknown;
};

export type NocolyFieldWrite = {
  id: string;
  value: unknown;
  type?: string;
};

function nocolyConfig() {
  const appKey = process.env.NOCOLY_APP_KEY;
  const sign = process.env.NOCOLY_SIGN;
  if (!appKey || !sign) {
    throw new NocolyError("Missing NOCOLY_APP_KEY or NOCOLY_SIGN.");
  }
  return { appKey, sign };
}

export async function nocolyRequest(
  path: string,
  init?: RequestInit,
): Promise<NocolyPayload> {
  const { appKey, sign } = nocolyConfig();
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("HAP-Appkey", appKey);
  headers.set("HAP-Sign", sign);

  let response: Response;
  try {
    response = await fetch(`${NOCOLY_API}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new NocolyError("Nocoly request failed.");
  }

  const payload = (await response.json()) as NocolyPayload;
  if (!response.ok || payload.success === false) {
    throw new NocolyError(payload.error_msg || "Nocoly request failed.");
  }
  return payload;
}

export async function listWorksheetRows(
  worksheetId: string,
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let pageIndex = 1;

  while (pageIndex <= 20) {
    const payload = await nocolyRequest(
      `/app/worksheets/${worksheetId}/rows/list`,
      {
        method: "POST",
        body: JSON.stringify({
          pageSize: 200,
          pageIndex,
          includeTotalCount: true,
        }),
      },
    );
    const data = payload.data;
    const pageRows =
      data && typeof data === "object" && Array.isArray((data as { rows?: unknown }).rows)
        ? ((data as { rows: Record<string, unknown>[] }).rows)
        : [];
    rows.push(...pageRows);
    const total =
      data && typeof data === "object" && typeof (data as { total?: unknown }).total === "number"
        ? (data as { total: number }).total
        : rows.length;
    if (pageRows.length === 0 || rows.length >= total) {
      break;
    }
    pageIndex += 1;
  }

  return rows;
}

export async function getWorksheetRow(
  worksheetId: string,
  rowId: string,
): Promise<Record<string, unknown>> {
  const payload = await nocolyRequest(
    `/app/worksheets/${worksheetId}/rows/${rowId}`,
  );
  const data = payload.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new NocolyError("Nocoly row was empty.");
  }
  return data as Record<string, unknown>;
}

export function rowIdFromPayload(payload: NocolyPayload): string {
  const data = payload.data;
  if (typeof data === "string" && data) {
    return data;
  }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const record = data as Record<string, unknown>;
    for (const key of ["rowId", "rowid", "id"]) {
      const value = record[key];
      if (typeof value === "string" && value) {
        return value;
      }
    }
  }
  return "";
}

export async function createWorksheetRow(
  worksheetId: string,
  fields: NocolyFieldWrite[],
): Promise<string> {
  const payload = await nocolyRequest(`/app/worksheets/${worksheetId}/rows`, {
    method: "POST",
    body: JSON.stringify({ fields, triggerWorkflow: false }),
  });
  const rowId = rowIdFromPayload(payload);
  if (!rowId) {
    throw new NocolyError("Nocoly did not return a row id.");
  }
  return rowId;
}

export async function updateWorksheetRow(
  worksheetId: string,
  rowId: string,
  fields: NocolyFieldWrite[],
): Promise<void> {
  await nocolyRequest(`/app/worksheets/${worksheetId}/rows/${rowId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields, triggerWorkflow: false }),
  });
}

export async function deleteWorksheetRow(
  worksheetId: string,
  rowId: string,
): Promise<void> {
  await nocolyRequest(`/app/worksheets/${worksheetId}/rows/${rowId}`, {
    method: "DELETE",
  });
}
