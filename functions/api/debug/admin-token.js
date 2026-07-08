import { adminTokenDebugInfo } from '../../_shared/auth.js';

export async function onRequestGet(context) {
  return Response.json(adminTokenDebugInfo(context.request, context.env));
}
