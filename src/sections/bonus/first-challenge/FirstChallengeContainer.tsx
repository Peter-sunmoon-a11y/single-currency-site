"use client";

import { Suspense, lazy } from "react";

const FirstChallengeCheck = lazy(() =>
  import("./FirstChallengeCheck").then((module) => ({ default: module.FirstChallengeCheck }))
);

// 容器保持同步挂载，只把活动检测逻辑拆成异步模块，避免抬高主布局首包成本。
export function FirstChallengeContainer() {
  return (
    <Suspense fallback={null}>
      <FirstChallengeCheck />
    </Suspense>
  );
}

export default FirstChallengeContainer;
