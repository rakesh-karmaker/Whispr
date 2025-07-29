import { useContactAssetsStore } from "@/stores/useContactAssetsStore";

export const useContactAssets = () => {
  const images = useContactAssetsStore((s) => s.images);
  const setImages = useContactAssetsStore((s) => s.setImages);
  const imagePage = useContactAssetsStore((s) => s.imagePage);
  const setImagePage = useContactAssetsStore((s) => s.setImagePage);
  const hasMoreImages = useContactAssetsStore((s) => s.hasMoreImages);
  const setHasMoreImages = useContactAssetsStore((s) => s.setHasMoreImages);
  const imagesCount = useContactAssetsStore((s) => s.imagesCount);
  const setImagesCount = useContactAssetsStore((s) => s.setImagesCount);

  const files = useContactAssetsStore((s) => s.files);
  const setFiles = useContactAssetsStore((s) => s.setFiles);
  const filePage = useContactAssetsStore((s) => s.filePage);
  const setFilePage = useContactAssetsStore((s) => s.setFilePage);
  const hasMoreFiles = useContactAssetsStore((s) => s.hasMoreFiles);
  const setHasMoreFiles = useContactAssetsStore((s) => s.setHasMoreFiles);
  const filesCount = useContactAssetsStore((s) => s.filesCount);
  const setFilesCount = useContactAssetsStore((s) => s.setFilesCount);

  const links = useContactAssetsStore((s) => s.links);
  const setLinks = useContactAssetsStore((s) => s.setLinks);
  const linkPage = useContactAssetsStore((s) => s.linkPage);
  const setLinkPage = useContactAssetsStore((s) => s.setLinkPage);
  const hasMoreLinks = useContactAssetsStore((s) => s.hasMoreLinks);
  const setHasMoreLinks = useContactAssetsStore((s) => s.setHasMoreLinks);
  const linksCount = useContactAssetsStore((s) => s.linksCount);
  const setLinksCount = useContactAssetsStore((s) => s.setLinksCount);

  const reset = () => useContactAssetsStore.getState().reset();

  return {
    images,
    setImages,
    imagePage,
    setImagePage,
    hasMoreImages,
    setHasMoreImages,
    imagesCount,
    setImagesCount,
    files,
    setFiles,
    filePage,
    setFilePage,
    hasMoreFiles,
    setHasMoreFiles,
    filesCount,
    setFilesCount,
    links,
    setLinks,
    linkPage,
    setLinkPage,
    hasMoreLinks,
    setHasMoreLinks,
    linksCount,
    setLinksCount,
    reset,
  };
};
