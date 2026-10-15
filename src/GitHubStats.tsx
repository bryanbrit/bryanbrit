import { useEffect, useState } from "react";
import { ArrowUpRight, Github } from "lucide-react";

type GitHubProfile = {
  public_repos: number;
  followers: number;
  following: number;
};

export default function GitHubStats() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://api.github.com/users/bryanbrit", {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`GitHub returned ${response.status}.`);
        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("public_repos" in data) ||
          !("followers" in data) ||
          !("following" in data) ||
          typeof data.public_repos !== "number" ||
          typeof data.followers !== "number" ||
          typeof data.following !== "number"
        ) {
          throw new Error("GitHub profile data had an unexpected shape.");
        }
        setProfile({
          public_repos: data.public_repos,
          followers: data.followers,
          following: data.following,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("Public GitHub data could not be loaded.", error);
        setUnavailable(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <aside className="github-panel" aria-label="Live public GitHub profile data">
      <div className="github-panel-heading"><Github size={18} /><span>GITHUB / LIVE PUBLIC DATA</span></div>
      {profile ? (
        <dl className="github-stats">
          <div><dt>Public repos</dt><dd>{profile.public_repos}</dd></div>
          <div><dt>Followers</dt><dd>{profile.followers}</dd></div>
          <div><dt>Following</dt><dd>{profile.following}</dd></div>
        </dl>
      ) : unavailable ? (
        <p className="github-fallback">Live public data unavailable right now. Visit the profile for current details.</p>
      ) : (
        <p className="github-fallback">Loading public profile data…</p>
      )}
      <a href="https://github.com/bryanbrit" target="_blank" rel="noopener noreferrer">
        github.com/bryanbrit <ArrowUpRight size={14} />
      </a>
    </aside>
  );
}
