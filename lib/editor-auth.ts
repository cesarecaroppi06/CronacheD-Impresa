import type { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export function isEditorAuthorized(request: NextRequest): boolean {
  if (isAdminRequest(request)) return true;

  const editorKey = process.env.EDITOR_DASHBOARD_KEY;
  if (!editorKey) return false;

  const provided = request.headers.get("x-editor-key");
  return Boolean(provided && provided === editorKey);
}
