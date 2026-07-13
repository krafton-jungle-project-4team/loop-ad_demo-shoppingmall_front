import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/routes";
import { initLoopAdEventSdk } from "@/lib/loop-ad-sdk";

function App() {
  useEffect(() => {
    void initLoopAdEventSdk().catch(() => undefined);
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
