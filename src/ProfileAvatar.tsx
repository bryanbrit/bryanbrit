import { useEffect, useState } from "react";

// Use a real portrait only after it is added to the documented public path.
export default function ProfileAvatar() {
  const [hasPhoto, setHasPhoto] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/images/profile.jpg", { method: "HEAD", signal: controller.signal })
      .then((response) => {
        if (response.ok && response.headers.get("content-type")?.startsWith("image/")) {
          setHasPhoto(true);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("Optional profile image could not be checked.", error);
      });
    return () => controller.abort();
  }, []);

  return hasPhoto
    ? <img className="initials-avatar profile-photo" src="/images/profile.jpg" alt="Bryan" />
    : <div className="initials-avatar" aria-label="Stylised initials avatar">BB<span>.</span></div>;
}
