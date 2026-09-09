"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
            Something broke.
          </h1>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              background: "#0a0a0a",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "12px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
