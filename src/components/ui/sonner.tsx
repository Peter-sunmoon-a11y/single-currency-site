"use client";

import { Toaster as Sonner } from "sonner";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <Sonner
      theme="dark"
      {...props}
    />,
    document.body
  );
};

export { Toaster };
