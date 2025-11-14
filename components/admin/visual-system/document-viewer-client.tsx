"use client"

import { useState, useTransition } from "react"
import ReactMarkdown from "react-markdown"
import type { DocumentDefinition } from "@/lib/docs/document-service"
import { Button } from "@/components/ui/button"

type Props = {
  documents: DocumentDefinition[]
  initialDocId: string
  initialContent: string
}

export function DocumentViewerClient({ documents, initialDocId, initialContent }: Props) {
  const [currentId, setCurrentId] = useState(initialDocId)
  const [content, setContent] = useState(initialContent)
  const [isPending, startTransition] = useTransition()

  const loadDocument = (id: string) => {
    setCurrentId(id)
    startTransition(async () => {
      const response = await fetch(`/api/admin/docs?id=${id}`, { cache: "no-store" })
      if (!response.ok) {
        setContent("Unable to load document. Please try again later.")
        return
      }
      const data = await response.json()
      setContent(data.content ?? "")
    })
  }

  const currentDoc = documents.find((doc) => doc.id === currentId) ?? documents[0]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2 rounded-lg border border-sage/40 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-forest/60">Documents</p>
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id}>
              <button
                className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                  currentId === doc.id
                    ? "border-forest bg-sage/20 text-forest"
                    : "border-sage/30 text-forest/70 hover:bg-sage/10"
                }`}
                onClick={() => loadDocument(doc.id)}
              >
                {doc.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:col-span-2 space-y-3 rounded-lg border border-sage/40 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-forest">{currentDoc?.title}</p>
            <p className="text-xs text-forest/60">{currentDoc?.description}</p>
          </div>
          {currentDoc?.githubHref && (
            <Button asChild variant="outline" size="sm">
              <a href={currentDoc.githubHref} target="_blank" rel="noopener noreferrer">
                Open in GitHub
              </a>
            </Button>
          )}
        </div>
        <div className="prose max-w-none text-forest">
          {isPending ? (
            <p className="text-sm text-forest/60">Loading...</p>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  )
}
