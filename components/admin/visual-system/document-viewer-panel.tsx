import { DocumentViewerClient } from "@/components/admin/visual-system/document-viewer-client"
import { DOCUMENTS, getDocumentContent } from "@/lib/docs/document-service"

export async function DocumentViewerPanel() {
  const preferredDoc = DOCUMENTS.find((doc) => doc.id === "visual-simplification") ?? DOCUMENTS[0]
  const initialContent = await getDocumentContent(preferredDoc.id)

  return (
    <DocumentViewerClient
      documents={DOCUMENTS}
      initialDocId={preferredDoc.id}
      initialContent={initialContent}
    />
  )
}
