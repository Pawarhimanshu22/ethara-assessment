import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

import AiFloatingButton from "../ai-assistant/AiFloatingButton";

export default function AppLayout({ title, subtitle, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-canvas">

            {/* Sidebar */}

            <Sidebar
                open={sidebarOpen}
                onNavigate={() => setSidebarOpen(false)}
            />

            {/* Mobile Overlay */}

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-surface-900/30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Layout */}

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">

                {/* Header */}

                <Header
                    title={title}
                    subtitle={subtitle}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                {/* Page Content */}

                <main className="flex-1 p-4 sm:p-7">
                    <div className="animate-fadeup mx-auto max-w-[1180px]">
                        {children}
                    </div>
                </main>

                {/* Footer */}

                <Footer />

            </div>

            {/* AI Floating Assistant */}

            <AiFloatingButton />

        </div>
    );
}