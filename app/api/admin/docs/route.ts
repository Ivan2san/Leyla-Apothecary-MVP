import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/auth-helpers"
import { getDocumentContent } from "@/lib/docs/document-service"

export async function GET(request: Request) {
  await requireAdmin()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing document id" }, { status: 400 })
  }
  try {
    const content = await getDocumentContent(id)
    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json({ error: "Unable to load document" }, { status: 404 })
  }
}
