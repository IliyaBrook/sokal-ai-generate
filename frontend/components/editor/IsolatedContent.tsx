import { useRef, useEffect } from 'react'

interface IsolatedContentProps {
  children: string
  className?: string
}

export const IsolatedContent = ({ children, className = '' }: IsolatedContentProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument
      if (iframeDoc) {
        const contentDiv = iframeDoc.querySelector('.ProseMirror')
        if (contentDiv) {
          contentDiv.innerHTML = children
        }
      }
    }
  }, [children])

  return (
    <iframe
      ref={iframeRef}
      className={`w-full h-96 border-0 ${className}`}
      srcDoc={`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; }
              .ProseMirror {
                padding: 1rem;
                min-height: 100%;
                outline: none;
              }
              .ProseMirror h2 {
                font-size: 1.5rem;
                font-weight: bold;
                margin: 1.5rem 0 1rem;
              }
              .ProseMirror p {
                margin: 1rem 0;
              }
              .ProseMirror ul, .ProseMirror ol {
                padding-left: 2rem;
                margin: 1rem 0;
              }
              .ProseMirror blockquote {
                border-left: 3px solid #ccc;
                padding-left: 1rem;
                margin: 1rem 0;
              }
            </style>
          </head>
          <body>
            <div class="ProseMirror"></div>
          </body>
        </html>
      `}
    />
  )
} 