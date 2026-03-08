import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PlayerBar from "./PlayerBar";
import MobileNav from "./MobileNav";
import Toast from "../common/Toast";

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background-dark">
            {/* Sidebar (desktop always visible, mobile slide-in) */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                {/* Scrollable content area */}
                <main className="flex-1 overflow-y-auto pb-40 lg:pb-28">
                    <Outlet />
                </main>
            </div>

            {/* Mobile bottom nav (above player) */}
            <MobileNav />

            {/* Global audio player */}
            <PlayerBar />

            {/* Toast notifications */}
            <Toast />
        </div>
    );
}
