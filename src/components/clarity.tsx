"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export default function ClarityInit() {
  useEffect(() => {
    Clarity.init("wi26nve2fx");
  }, []);

  return null;
}
