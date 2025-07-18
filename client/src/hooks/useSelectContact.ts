import { useSelectedContactStore } from "@/stores/useSelectedContactStore";

export const useSelectedContact = () => {
  const selectedContact = useSelectedContactStore(
    (state) => state.selectedContact
  );
  const setSelectedContact = useSelectedContactStore(
    (state) => state.setSelectedContact
  );
  const isLoading = useSelectedContactStore((state) => state.isLoading);
  const setIsLoading = useSelectedContactStore((state) => state.setIsLoading);
  const isNewSelectedContact = useSelectedContactStore(
    (state) => state.isNewSelectedContact
  );
  const setIsNewSelectedContact = useSelectedContactStore(
    (state) => state.setIsNewSelectedContact
  );
  const newSelectedContact = useSelectedContactStore(
    (state) => state.newSelectedContact
  );
  const setNewSelectedContact = useSelectedContactStore(
    (state) => state.setNewSelectedContact
  );
  const images = useSelectedContactStore((state) => state.images);
  const setImages = useSelectedContactStore((state) => state.setImages);
  const files = useSelectedContactStore((state) => state.files);
  const setFiles = useSelectedContactStore((state) => state.setFiles);
  const links = useSelectedContactStore((state) => state.links);
  const setLinks = useSelectedContactStore((state) => state.setLinks);

  return {
    selectedContact,
    setSelectedContact,
    isLoading,
    setIsLoading,
    isNewSelectedContact,
    setIsNewSelectedContact,
    newSelectedContact,
    setNewSelectedContact,
    images,
    setImages,
    files,
    setFiles,
    links,
    setLinks,
  };
};
