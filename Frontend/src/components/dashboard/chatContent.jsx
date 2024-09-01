import React, {useEffect, useRef, useState} from "react";
import {BsSend} from "react-icons/bs";
import {axiosClientWithHeaders} from "../../libs/axiosClient.js";
import {formatDate} from "../../utils/helpers.js";
import {useDispatch, useSelector} from "react-redux";
import {setQuestionsData, updateQuestionsData} from "../../redux/slices/questionsSlice.js";
import {useNavigate} from "react-router-dom";
import {updateSessionsData} from "../../redux/slices/sessionsSlice.js";

function ChatContent({ id }) {
    const questions = useSelector((state) => state.questions.questions);
    const [question, setQuestion] = useState("");
    const [cur, setCur] = useState("");
    const [loadingQuestions, setLoadingQuestions] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const getMessages = async () => {
        try {
            const resp = await axiosClientWithHeaders.get(`chat/sessions/${id}`);
            console.log(resp);
            dispatch(setQuestionsData(resp.data.data.chat_history));
        } catch (error) {
            console.error(error);
        }
    }

    const saveMessage = async () => {
        setQuestion("");
        if(question.trim() == '') return;
        const data = {
            question,
        }
        if (id) {
            data.session_id = id;
        }

        // Add the question with "Loading..." to the temporary loading state
        setLoadingQuestions( [{ question, response: "Loading...", created_on: new Date() }]); 
        

        try {
            const resp = await axiosClientWithHeaders.post(`chat/messages`, data);
            const respData = resp.data.data;
            const sessionData = respData?.session;
            const sessionName = respData?.session_name;

            delete respData.session;
            delete respData?.name;

            // Update the questions data by replacing the last loading question with the actual response
            setLoadingQuestions((prev) => prev.slice(0, -1));
            dispatch(updateQuestionsData(respData));

            if (sessionName) {
                dispatch(updateSessionsData(sessionData));
                navigate(`/sessions/${respData.session_id}`)
            }
        } catch (error) {
            console.error(error);
            // Remove the "Loading..." entry if the request fails
            setLoadingQuestions([{ question, response: "Failed to respond", created_on: new Date() }]);
        }
    }

    const scrollToBottom = () => {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }

    const handleKeyPress = async (e) => {
        if (e.code === 'Enter' && question.trim() !== ''&&loadingQuestions.length==0) {
            await saveMessage();
        }
    };

    useEffect(() => {
        if (id) {
            getMessages();
        }
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [questions, loadingQuestions]);

    return (
        <div className="flex-grow flex flex-col justify-between p-4 bg-[#3A4454]">
            <div className="flex items-center flex-col h-[88vh] overflow-auto" ref={containerRef}>
                {!id &&  <p className="text-center w-full text-white">New Chat</p>}
                {id && [...questions, ...loadingQuestions].map((question, index) =>
                    <div className="w-full flex flex-col" key={index}>
                        <div className="flex flex-col bg-[#53687E] text-white p-4">
                            <span>{question.question}</span>
                            <span className="flex justify-end text-[10px]">{formatDate(question.created_on)}</span>
                        </div>
                        <div className="text-white p-4">{question.response}</div>
                    </div>
                )}
            </div>
            <div className="relative bottom-2">
                <div className="flex w-full items-center border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500">
                    <input
                        type="text"
                        placeholder="Send question"
                        value={question}
                        onChange={(e) => {setQuestion(e.target.value);
                            if(e.target.value.trim()!='' && loadingQuestions.length==0) setCur(e.target.value);}}
                        className="w-full focus-visible:outline-none bg-inherit text-white"
                        onKeyDown={handleKeyPress}
                    />
                    {loadingQuestions.length==0&&<BsSend size={20} className="cursor-pointer text-white" onClick={saveMessage} />}
                </div>
            </div>
        </div>
    )
}

export default ChatContent;
