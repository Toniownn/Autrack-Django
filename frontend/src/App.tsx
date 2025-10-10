import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import { Navbar } from "./components/Navbar/Navbar";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
