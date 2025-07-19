"use client";

import { Button } from "@/components/ui/button";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function LandingHeader() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous: any = scrollY.getPrevious();
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else if (latest < previous) {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -100, opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border px-4 md:px-6 py-3 flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          asChild
          className="flex items-center gap-2 text-lg font-semibold text-foreground hover:bg-transparent hover:text-primary"
        >
          <Link href="/">
            <Image
              src="/logo-doc.png"
              alt="Family Docs Logo"
              width={32}
              height={32}
            />
            <span>Family Docs</span>
          </Link>
        </Button>
      </div>
      <nav className="flex items-center gap-4">
        <Button
          asChild
          variant="ghost"
          className="text-foreground hover:bg-muted"
        >
          <Link href="#how-it-works">How It Works</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="text-foreground hover:bg-muted"
        >
          <Link href="#features">Features</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="text-foreground hover:bg-muted"
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/register">Sign Up</Link>
        </Button>
      </nav>
    </motion.header>
  );
}
