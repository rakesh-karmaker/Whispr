import * as React from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import "./index.css";
import useMessages from "./hooks/useMessages";
import useGetMessages from "./hooks/useGetMessages";
import Message from "./components/chat/chatWindow/message";

function RowVirtualizerDynamic() {
  const { messages } = useMessages();
  const { isLoading } = useGetMessages(1);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const count = messages.length;
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
  });

  const items = virtualizer.getVirtualItems();

  React.useEffect(() => {
    virtualizer.measure();
    if (count > 0) {
      // wait a frame so element measurements from refs are applied, then scroll to the last item
      requestAnimationFrame(() => {
        virtualizer.scrollToIndex(count - 1, { align: "end" });
      });
    }
  }, [messages]);

  return (
    <div>
      <div
        ref={parentRef}
        className="List w-full h-screen"
        style={{
          overflowY: "auto",
          contain: "strict",
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${items[0]?.start ?? 0}px)`,
            }}
          >
            {items.map((virtualRow) => (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className={virtualRow.index % 2 ? "bg-gray-100" : "bg-white"}
              >
                <div className="py-6">
                  <Message
                    message={messages[virtualRow.index]}
                    willChain={false}
                    isNewChain={false}
                    onImageClick={() => {}}
                    isNewDay={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <RowVirtualizerDynamic />;
}
