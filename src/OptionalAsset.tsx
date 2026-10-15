import { useEffect, useState } from "react";

function usePublicAsset(path: string, contentType: string) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(path, { method: "HEAD", signal: controller.signal })
      .then((response) => {
        if (response.ok && response.headers.get("content-type")?.startsWith(contentType)) {
          setAvailable(true);
        } else if (response.ok) {
          console.warn(`Optional asset at ${path} has an unexpected file type.`);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn(`Optional asset at ${path} could not be checked.`, error);
      });
    return () => controller.abort();
  }, [path, contentType]);

  return available;
}

// This link only appears after a real PDF is placed in the public folder.
export function CvDownload() {
  const exists = usePublicAsset("/cv.pdf", "application/pdf");
  return exists ? <a className="cv-link" href="/cv.pdf" download>Download CV</a> : null;
}

// Add a real screenshot later; otherwise the sample-labelled preview remains visible.
export function ProjectScreenshot({ path, alt }: { path: string; alt: string }) {
  const exists = usePublicAsset(path, "image/");
  return exists ? <figure className="optional-screenshot"><img src={path} alt={alt} /><figcaption>Project screenshot</figcaption></figure> : null;
}
