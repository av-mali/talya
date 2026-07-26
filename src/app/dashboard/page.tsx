"use client";

import { useEffect, useState } from "react";
import TalyaShell from "@/components/TalyaShell";
import OnboardingScreen from "@/components/OnboardingScreen";

export default function Dashboard() {
  const [checking, setChecking] = useState(true);
  const [hasWorkspace, setHasWorkspace] = useState(true);

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => {
        setHasWorkspace(r.ok);
        setChecking(false);
      })
      .catch(() => {
        setHasWorkspace(true);
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <>
        <link rel="stylesheet" href="/talya-original.css" />
        <div style={{ minHeight: "100vh", height: "100vh", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
          <div style={{ fontSize: 13, color: "var(--t3)" }}>Yükleniyor…</div>
        </div>
      </>
    );
  }

  if (!hasWorkspace) {
    return <OnboardingScreen onDone={() => setHasWorkspace(true)} />;
  }

  return <TalyaShell bodyUrl="/home-body.html" scripts={["/modules-index.js", "/cmdk-index.js", "/engine.js"]} />;
}
