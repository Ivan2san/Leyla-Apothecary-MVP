import { DocumentViewerClient } from "@/components/admin/visual-system/document-viewer-client"
import { DOCUMENTS, getDocumentContent } from "@/lib/docs/document-service"

export async function DocumentViewerPanel() {
  const initialDoc = DOCUMENTS[0]
  const initialContent = await getDocumentContent(initialDoc.id)

  return (
    <DocumentViewerClient
      documents={DOCUMENTS}
      initialDocId={initialDoc.id}
      initialContent={initialContent}
    />
  )
}
