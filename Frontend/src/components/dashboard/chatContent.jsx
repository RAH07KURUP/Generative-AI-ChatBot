import React, { useEffect, useRef, useState } from "react";
import { BsSend } from "react-icons/bs";
import { axiosClientWithHeaders } from "../../libs/axiosClient.js";
import { formatDate } from "../../utils/helpers.js";
import { useDispatch, useSelector } from "react-redux";
import { setQuestionsData, updateQuestionsData } from "../../redux/slices/questionsSlice.js";
import { useNavigate } from "react-router-dom";
import { updateSessionsData } from "../../redux/slices/sessionsSlice.js";
import './chatContent.scss'

function ChatContent({ id }) {
    const questions = useSelector((state) => state.questions.questions);
    const [question, setQuestion] = useState("");
    const [respErr, setrespErr] = useState(0);const [anim, setAnim] = useState('animate-pulse');
    const [loadingQuestions, setLoadingQuestions] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const getMessages = async () => {
        try {
            const resp = await axiosClientWithHeaders.get(`chat/sessions/${id}`);
            dispatch(setQuestionsData(resp.data.data.chat_history));
        } catch (error) {
            console.error(error);
        }
    };

    const saveMessage = async (cur) => {
        setQuestion(""); // Clear the input field
        if (cur.trim() === '') return; // Check for empty input
        const data = {
            question: cur,
        };
        if (id) {
            data.session_id = id;
        }

        setLoadingQuestions([{ question: cur, response: "Loading...", created_on: new Date() }]);

        try {
            const resp = await axiosClientWithHeaders.post(`chat/messages`, data);
            const respData = resp.data.data;
            if(respData=="Free limit exceeded") {setLoadingQuestions([{ question: cur, response: "You have exceeded the hourly rate limit. Try again after sometime.", created_on: new Date() }]);
            setrespErr(1);setAnim('');return;}
            const sessionData = respData?.session;
            const sessionName = respData?.session_name;

            delete respData.session;
            delete respData?.name;

            setLoadingQuestions((prev) => prev.slice(0, -1));
            dispatch(updateQuestionsData(respData));

            if (sessionName) {
                dispatch(updateSessionsData(sessionData));
                navigate(`/sessions/${respData.session_id}`);
            }
        } catch (error) {
            console.error(error);
            setLoadingQuestions([{ question: cur, response: "Failed to respond", created_on: new Date() }]);
            setrespErr(1);setAnim('');
        }
    };

    const scrollToBottom = () => {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    };

    const handleKeyPress = async (e) => {
        if (e.code === 'Enter' && question.trim() !== '' && loadingQuestions.length === 0) {
            await saveMessage(question);
        }
    };
    

    useEffect(() => {
        setLoadingQuestions([]);setrespErr(0);setAnim('animate-pulse');setQuestion('');
        if (id) {
            getMessages();
        }
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [questions, loadingQuestions]);

    return (
        <div className="flex-grow flex flex-col justify-between p-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <div className="flex items-center flex-col h-[88vh] overflow-auto space-y-4 hide-scroll" ref={containerRef}>
                {!id && <p className="text-center w-full text-gray-400 italic">Start a new chat...</p>}
                {id && questions.map((question, index) => (
                    <div className="w-full flex flex-col space-y-2" key={index}>
                        <div className="flex flex-col bg-gray-700 text-white p-4 rounded-lg shadow-md">
                            <span className="break-words">{question.question}</span>
                            <span className="flex justify-end text-xs text-gray-400">{formatDate(question.created_on)}</span>
                        </div>
                        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-md break-words">
                            {question.response}
                        </div>
                    </div>
                ))}
                {loadingQuestions.map((question, index) => (
                    <div className="w-full flex flex-col space-y-2" key={index}>
                        <div className="flex flex-col bg-gray-700 text-white p-4 rounded-lg shadow-md">
                            <span className="break-words">{question.question}</span>
                            <span className="flex justify-end text-xs text-gray-400">{formatDate(question.created_on)}</span>
                        </div>
                        <div className={`bg-blue-600 text-white p-4 rounded-lg shadow-md break-words ${anim}`}>
                            {question.response}
                        </div>
                    </div>
                ))}
            </div>
            <div className="relative bottom-2 mt-4">
                {respErr===0&&<div className="flex w-full items-center border border-gray-700 px-3 py-2 rounded-lg bg-gray-800 focus-within:ring-2 ring-blue-600">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none"
                        onKeyDown={handleKeyPress}
                    />
                    {loadingQuestions.length === 0 && (
                        <BsSend
                            size={24}
                            className="cursor-pointer text-blue-500 hover:text-blue-400 transition-colors"
                            onClick={() => saveMessage(question)}
                        />
                    )}
                </div>}
                {respErr === 1 && (
                    <p className="mt-2 text-red-500 text-sm text-center">
                        Something went wrong.<br/> <button className="mt-2 text-white text-sm text-center" onClick={() => window.location.reload()}>⟳ </button>
                    </p>
                )}
            </div>
        </div>
    );
}

export default ChatContent;
