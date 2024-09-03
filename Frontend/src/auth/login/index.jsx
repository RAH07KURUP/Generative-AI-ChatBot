import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { axiosClient } from "../../libs/axiosClient.js";
import { setUserData } from "../../redux/slices/userSlice.js";
import { isRequiredFieldValuesPassed } from "../../utils/helpers.js";

function LoginPage() {
    const navigate = useNavigate();
    const [state, setState] = useState({});
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const dispatch = useDispatch();

    const login = async () => {
        setLoading(true);
        try {
            const resp = await axiosClient.post('/auth/login', state);
            dispatch(setUserData(resp.data.data));
            setLoading(false);
            toast.success("Welcome back!");
            navigate('/sessions');
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error(error.response.data.message);
        }
    }

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    }

    useEffect(() => {
        setDisabled(!isRequiredFieldValuesPassed(state, ["email", "password"], "eq"));
    }, [state]);

    return (
        <div className="h-[100vh] flex justify-center items-center bg-gradient-to-br from-gray-700 to-gray-900 p-6">
            <div className="bg-white max-w-md w-full rounded-lg shadow-lg p-8">
                <h1 className="font-extrabold text-[30px] text-center text-gray-800 mb-6">Sign In</h1>
                <div className="input-group mb-4">
                    <label htmlFor="email" className="text-gray-600 font-semibold block mb-2">Email Address</label>
                    <input
                        type="text"
                        id="email"
                        className="border border-gray-300 w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                        name="email"
                        onChange={handleChange}
                    />
                </div>
                <div className="input-group mb-6">
                    <label htmlFor="password" className="text-gray-600 font-semibold block mb-2">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        className="border border-gray-300 w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="password"
                        onChange={handleChange}
                    />
                </div>
                <button
                    className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
                    disabled={disabled || loading}
                    onClick={login}
                >
                    {loading ? 'Authenticating...' : 'Log In'}
                </button>
                <div className="text-center mt-4">
                    <span className="text-gray-600 text-[14px]">New here?</span>
                    <u className="cursor-pointer text-blue-600 ml-2" onClick={() => navigate('/register')}>
                        Create an account
                    </u>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;
