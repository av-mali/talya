"use client";

import TalyaShell from "@/components/TalyaShell";

export default function Dashboard() {
  return (
    <TalyaShell bodyUrl="/home-body.html" scripts={["/cmdk-index.js", "/engine.js"]} />
  );
}
