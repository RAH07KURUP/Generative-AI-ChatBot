import React from 'react';
import Sidebar from "../../components/dashboard/sidebar.jsx";
import ChatContent from "../../components/dashboard/chatContent.jsx";
import { useParams } from "react-router-dom";

function ChatSessionsPage() {
    const { id } = useParams();
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100">
            <Sidebar id={id} />
            <ChatContent id={id} />
        </div>
    )
}

export default ChatSessionsPage;
