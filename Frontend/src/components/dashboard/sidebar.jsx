import React, { useEffect, useState } from 'react';
import { axiosClientWithHeaders } from "../../libs/axiosClient.js";
import { MdDeleteOutline } from "react-icons/md";
import { AiOutlineCheck, AiOutlineEdit } from "react-icons/ai";
import { BsChatLeftDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";import './chatContent.scss'
import { resetQuestionsData } from "../../redux/slices/questionsSlice.js";
import {
    deleteSessionsData,
    modifySessionData,
    resetSessionsData,
    setSessionsData
} from "../../redux/slices/sessionsSlice.js";
import Modal from "./modal.jsx";
import { resetUserData } from "../../redux/slices/userSlice.js";
import { LiaTimesSolid } from "react-icons/lia";

const Sidebar = ({ id }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
    const [deletingSession, setDeletingSession] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingName, setIsEditingName] = useState('');
    const sessions = useSelector((state) => state.sessions.sessions);

    const user = useSelector((state) => state.user.user);

    const getAllSessions = async () => {
        try {
            const resp = await axiosClientWithHeaders.get("/chat/sessions");
            dispatch(setSessionsData(resp.data.data));
        } catch (error) {
            console.error(error);
        }
    }

    const deleteSession = async () => {
        setDeletingSession(true);
        try {
            await axiosClientWithHeaders.delete(`/chat/sessions/${selectedId}`);
            setDeletingSession(false);
            dispatch(deleteSessionsData({ id: selectedId }));
            setIsModalOpen(false);
            navigate('/sessions');
        } catch (error) {
            console.error(error);
            setDeletingSession(false);
        }
    }

    const editSession = async () => {
        try {
            await axiosClientWithHeaders.put(`/chat/sessions/${selectedId}`, {
                name: isEditingName.trim()
            });
            const session = sessions.find((session) => session.id === selectedId);
            dispatch(modifySessionData({ ...session, name: isEditingName.trim() }));
            setIsEditingName("");
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            setDeletingSession(false);
        }
    }

    const handleSessionDelete = (id) => {
        setSelectedId(id);
        setIsModalOpen(true);
    }

    const handleIsEditing = (id, name) => {
        setIsEditing(true);
        setIsEditingName(name);
        setSelectedId(id);
    }

    const handleCancelEdit = () => {
        setIsEditing(false);
        setIsEditingName('');
        setSelectedId(0);
    }

    const handleLogout = () => {
        dispatch(resetQuestionsData());
        dispatch(resetSessionsData());
        dispatch(resetUserData());
    }

    useEffect(() => {
        getAllSessions();
    }, []);

    return (
        <>
            <div className="bg-gray-800 shadow-lg text-gray-100 w-72 h-screen p-6 flex flex-col justify-between border-r-2 border-blue-400">

                <ul className="space-y-6" onClick={() => navigate("/sessions")}>
                        <li className="bg-blue-600 hover:bg-blue-500 transition px-4 py-2 rounded-md text-center cursor-pointer text-lg font-semibold">
                            + New Chat
                        </li>
                    </ul>
                <div className="flex-1 overflow-y-auto hide-scroll border-2 border-white rounded-lg mb-[3px] mt-[14px]">
                    <div className="mt-6">
                        {sessions.map((session, index) =>
                            <div
                                className={`flex ${(Number(id) === session.id) && "bg-blue-500"} items-center justify-between mb-4 px-4 py-2 rounded-md cursor-pointer text-center transition hover:bg-blue-700`}
                                onClick={() => navigate(`/sessions/${session.id}`)}
                                key={index}
                            >
                                <div className="flex items-center">
                                    <span><BsChatLeftDots size={24} /></span>
                                    {isEditing && selectedId === session.id
                                        ?
                                        <input
                                            type="text"
                                            value={isEditingName}
                                            onChange={(e) => setIsEditingName(e.target.value)}
                                            className="ml-3 bg-blue-500 text-gray-100 h-8 w-full focus:outline-none rounded-md px-2"
                                            autoFocus={true}
                                        />
                                        : <>
                                            <span className="ml-3 text-lg font-medium">{session?.name?.substring(0, 18)}</span>
                                            {session?.name?.length > 18 && "..."}
                                        </>
                                    }
                                </div>
                                {(Number(id) === session.id) && <div className="flex items-center space-x-2">
                                    {!isEditing ?
                                        <>
                                            <AiOutlineEdit
                                                size={24}
                                                onClick={() => handleIsEditing(session.id, session.name)}
                                                className="cursor-pointer hover:text-gray-400"
                                            />
                                            <MdDeleteOutline
                                                size={24}
                                                onClick={() => handleSessionDelete(session.id)}
                                                className="cursor-pointer hover:text-red-600"
                                            />
                                        </>
                                        :
                                        <>
                                            <AiOutlineCheck
                                                size={24}
                                                onClick={editSession}
                                                className="cursor-pointer hover:text-green-600"
                                            />
                                            <LiaTimesSolid
                                                size={24}
                                                onClick={handleCancelEdit}
                                                className="cursor-pointer hover:text-red-600"
                                            />
                                        </>
                                    }
                                </div>}
                            </div>
                        )}
                    </div>
                </div>
                <div className='flex flex-col items-center text-center p-4'>
                    <p className="text-lg font-semibold break-words text-center sticky bottom-0 px-4 py-2">
                        Welcome {user?.first_name} {user?.last_name}
                    </p>
                    <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded-md text-white font-medium ">Logout</button>
                </div>
            </div>
            <Modal isOpen={isModalOpen} setIsOpen={setIsModalOpen} loading={deletingSession} callback={deleteSession} />
        </>
    );
};

export default Sidebar;
