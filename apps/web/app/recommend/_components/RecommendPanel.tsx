"use client";

import { useState } from "react";

import { Spinner } from "@/components/ui/Spinner";

import styles from "../recommend.module.css";

type RecommendPanelProps = {
  firstName: string;
};

export function RecommendPanel({ firstName }: RecommendPanelProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error: unknown }).error)
            : "Something went wrong";
        setError(message);
        return;
      }

      setResult(JSON.stringify(data, null, 2));
    } catch {
      setError("Unable to reach the recommendation service.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <h1 className={styles.title}>Welcome, {firstName}</h1>
        <p className={styles.subtitle}>
          Tell us what you enjoy and we&apos;ll suggest books, films, and more tailored to your
          taste.
        </p>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label} htmlFor="recommend-input">
              What are you in the mood for?
            </label>
            <textarea
              id="recommend-input"
              className={styles.textarea}
              placeholder="I love sci-fi, philosophical themes, and slow-burn mysteries…"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
              required
            />

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className={styles.submit} disabled={isLoading || !input.trim()}>
              {isLoading ? <Spinner size="sm" label="Getting recommendations" /> : null}
              {isLoading ? "Getting recommendations…" : "Get recommendations"}
            </button>
          </form>

          {result ? (
            <div className={styles.results}>
              <h2 className={styles.resultsTitle}>Results</h2>
              <pre className={styles.resultText}>{result}</pre>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
