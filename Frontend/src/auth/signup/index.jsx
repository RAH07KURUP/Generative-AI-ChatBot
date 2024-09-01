import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { axiosClient } from "../../libs/axiosClient.js";
import { setUserData } from "../../redux/slices/userSlice.js";
import { isRequiredFieldValuesPassed } from "../../utils/helpers.js";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function SignupPage() {
    const navigate = useNavigate();
    const [state, setState] = useState({});
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const dispatch = useDispatch();
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
    const register = async () => {
        setLoading(true);
        if (state.password !== state.c_password) {
            toast.error("Password and Confirm Password must be the same");
            setLoading(false);
            return;
        }
        const userInfo = { ...state };
        delete userInfo.c_password;

        try {
            const resp = await axiosClient.post('/auth/register', userInfo);
            dispatch(setUserData(resp.data.data));
            setLoading(false);
            toast.success("Registration Successful");
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
        const requiredFields = ["first_name", "last_name", "email", "password", "c_password"];
        setDisabled(!isRequiredFieldValuesPassed(state, requiredFields, "eq"));
    }, [state]);

    const onGoogleSuccess = async (response) => {
        console.log("or bhai");
        setLoading(true);
        try {
            const googleResp = await axiosClient.post('/auth/google', {
                token: response.credential
            });
            dispatch(setUserData(googleResp.data.data));
            setLoading(false);
            toast.success("Google Sign-Up Successful");
            navigate('/sessions');
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error(error.response.data.message);
        }
    };

    const onGoogleFailure = (error) => {
        console.error('Google Sign Up failed:', error);
        toast.error("Google Sign Up failed. Please try again.");
    };

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="h-[100vh] flex justify-center items-center">
                <div>
                    <h1 className="font-bold text-[25px] text-center mb-5">Signup Page</h1>
                    <div className="input-group">
                        <label htmlFor="first_name">First Name*</label>
                        <input
                            type="text"
                            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500"
                            placeholder="First Name"
                            name="first_name"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="last_name">Last Name*</label>
                        <input
                            type="text"
                            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500"
                            placeholder="Last Name"
                            name="last_name"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email*</label>
                        <input
                            type="email"
                            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500"
                            placeholder="Email"
                            name="email"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password*</label>
                        <input
                            type="password"
                            placeholder="Password"
                            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500"
                            name="password"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="c_password">Confirm Password*</label>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500"
                            name="c_password"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="flex justify-center flex-col">
                        <button
                            className="bg-blue-500 text-white px-3 py-2 rounded-md cursor-pointer"
                            disabled={disabled || loading}
                            onClick={register}
                        >
                            {loading ? "Loading..." : "Register"}
                        </button>
                        <span className="text-[13px] ml-3 text-center mt-4">
                            Already have an account?
                            <u className="cursor-pointer ml-2" onClick={() => navigate('/login')}>
                                Login
                            </u>
                        </span>
                    </div>
                    <div className="flex justify-center items-center mt-4">
                        <p className="text-center">Or Sign Up with Google</p>
                    </div>
                    <div className="flex justify-center mt-2">
                        <GoogleLogin
                            onSuccess={onGoogleSuccess}
                            onFailure={onGoogleFailure}
                            useOneTap
                        />
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}

export default SignupPage;
