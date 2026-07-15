import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import ChatBubble from "./ChatBubble";

const ChatWindow = ({
    messages = [],
    loading = false,
}) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    return (
        <div className="flex flex-1 flex-col gap-[14px] overflow-y-auto px-0.5 pb-[18px] pt-1">

            {messages.map((message, index) => (
                <ChatBubble
                    key={message.id || index}
                    message={message}
                />
            ))}

            {loading && (
                <div className="flex max-w-[86%] items-start gap-2.5 self-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-brand-600">
                        <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
                    </div>
                    <div className="rounded-[4px_14px_14px_14px] border border-surface-200 bg-white px-[15px] py-3">
                        <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-surface-300"></span>
                            <span
                                className="h-2 w-2 animate-bounce rounded-full bg-surface-300"
                                style={{ animationDelay: "150ms" }}
                            ></span>
                            <span
                                className="h-2 w-2 animate-bounce rounded-full bg-surface-300"
                                style={{ animationDelay: "300ms" }}
                            ></span>
                        </div>
                    </div>
                </div>
            )}

            <div ref={bottomRef} />

        </div>
    );
};

export default ChatWindow;
