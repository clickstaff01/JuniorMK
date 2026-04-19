'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-headings:text-white prose-headings:font-semibold
      prose-p:text-slate-300 prose-p:leading-relaxed
      prose-strong:text-white
      prose-ul:text-slate-300 prose-ol:text-slate-300
      prose-li:marker:text-blue-400
      prose-table:text-slate-300 prose-th:text-white prose-th:bg-slate-800
      prose-td:border-slate-700 prose-th:border-slate-700
      prose-code:text-blue-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded
      prose-blockquote:border-blue-500 prose-blockquote:text-slate-400
      prose-hr:border-slate-700
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
