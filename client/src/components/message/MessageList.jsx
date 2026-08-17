import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";

function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div
      className="
        flex-1
        overflow-y-auto
        px-4
        md:px-6
        py-6
        flex
        flex-col
        gap-5
        bg-[#f9f9f9]
      "
    >
      {messages.map((message) => (
        <MessageBubble 
          key={message._id || message.id} 
          message={message} 
          currentUserId={currentUserId}
        />
      ))}

      <div ref={bottomRef} className="h-4 shrink-0" />
    </div>
  );
}

export default MessageList;
