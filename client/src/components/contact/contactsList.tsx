import { useContacts } from "@/hooks/useContacts";
import useGetAllContacts from "@/hooks/useGetAllContacts";
import type { QueriedContact } from "@/types/contactTypes";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import ContactPreview from "@/components/ui/contactPreview";
import ContactPreviewSkeleton from "../ui/skeletons/contactPreviewSkeleton";

export default function ContactsList(): React.ReactNode {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { isLoading, hasMore } = useGetAllContacts(pageNumber);
  const { contacts, pinnedContacts } = useContacts();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLAnchorElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("intersecting");
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );
  return (
    <div className="w-full h-full relative overflow-y-hidden bg-pure-white rounded-xl flex-1">
      <div className="w-full h-full relative overflow-y-auto flex flex-col gap-5">
        <ContentsSection
          title="Pinned"
          contacts={pinnedContacts}
          isLoading={contacts.length === 0}
        />
        <ContentsSection
          title="All"
          contacts={contacts}
          lastElementRef={lastElementRef}
          isLoading={isLoading}
        />
      </div>
      <div className="absolute bottom-0 w-full h-30 bg-[linear-gradient(180deg,_rgba(255,_255,_255,_0)_37.97%,_#FFFFFF_100%)] pointer-events-none" />
    </div>
  );
}

function ContentsSection({
  title,
  contacts,
  lastElementRef,
  isLoading,
}: {
  title: string;
  contacts: QueriedContact[];
  lastElementRef?: React.Ref<HTMLAnchorElement>;
  isLoading?: boolean;
}): React.ReactNode {
  return (
    <div className="w-full h-fit flex flex-col gap-2.5">
      <h3 className="pt-[1.375em] pl-[1.375em] font-medium text-light-dark-gray">
        {title}
      </h3>
      <div className="flex flex-col">
        {contacts.map((contact: QueriedContact, index: number) => {
          if (index === contacts.length - 1) {
            return (
              <ContactPreview
                key={contact._id}
                contactData={contact}
                ref={lastElementRef}
              />
            );
          } else {
            return <ContactPreview key={contact._id} contactData={contact} />;
          }
        })}
        {isLoading ? (
          <>
            <ContactPreviewSkeleton />
            <ContactPreviewSkeleton />
          </>
        ) : null}
      </div>
    </div>
  );
}
