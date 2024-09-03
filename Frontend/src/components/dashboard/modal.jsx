import React from "react";
import { IoCloseOutline } from "react-icons/io5";

const Modal = ({ isOpen, setIsOpen, loading, callback }) => {
    const toggleModal = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            {isOpen && (
                <div className="modal fixed inset-0 flex items-center justify-center z-50">
                    {/* Background overlay */}
                    <div className="fixed inset-0 bg-black bg-opacity-70"></div>

                    {/* Modal content */}
                    <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 bg-[#3A4454] rounded-t-lg">
                            <h2 className="text-xl font-semibold text-white">
                                Delete Session
                            </h2>
                            <span className="cursor-pointer" onClick={toggleModal}>
                                <IoCloseOutline size={24} fill="#fff" />
                            </span>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4">
                            <p className="text-gray-700">
                                Are you sure you want to delete this session?
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end items-center px-6 py-4 bg-gray-100 rounded-b-lg space-x-2">
                            <button
                                className="text-sm text-gray-700 border border-gray-300 rounded px-4 py-2 hover:bg-gray-200 transition-colors duration-200"
                                onClick={toggleModal}
                            >
                                Cancel
                            </button>
                            <button
                                className={`text-sm px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={callback}
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Modal;
