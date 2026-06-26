import { SiteHeader } from "@/components/layout/SiteHeader";
import { ShoppingShell } from "@/components/layout/ShoppingShell";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <ShoppingShell />
    </div>
  );
}

export default App;
