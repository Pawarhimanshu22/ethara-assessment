import clsx from 'clsx'
import { Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function ChatBubble({ message, role, content }) {
  const msgRole = message?.role ?? role
  const text = message?.content ?? content
  const isUser = msgRole === 'user'

  return (
    <div
      className={clsx(
        'flex max-w-[86%] items-start gap-2.5',
        isUser ? 'flex-row-reverse self-end' : 'flex-row self-start'
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-brand-600">
          <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
        </div>
      )}

      <div
        className={clsx(
          'px-[15px] py-3 text-[13.5px] leading-[1.55]',
          isUser
            ? 'rounded-[14px_4px_14px_14px] bg-brand-600 text-white'
            : 'rounded-[4px_14px_14px_14px] border border-surface-200 bg-white text-surface-700'
        )}
      >
        {isUser ? (
          text
        ) : (
          <div className="space-y-1.5 [&_a]:text-brand-600 [&_a]:underline [&_code]:rounded [&_code]:bg-surface-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-surface-900">
            <ReactMarkdown>{String(text ?? '')}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
