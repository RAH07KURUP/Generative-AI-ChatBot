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

    const register = async () => {
        setLoading(true);
        if (state.password !== state.c_password) {
            toast.error("Passwords do not match.");
            setLoading(false);
            return;
        }
        const userInfo = { ...state };
        delete userInfo.c_password;

        try {
            const resp = await axiosClient.post('/auth/register', userInfo);
            dispatch(setUserData(resp.data.data));
            setLoading(false);
            toast.success("Welcome aboard!");
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
        console.error('Google Sign-Up failed:', error);
        toast.error("Google Sign-Up failed. Please try again.");
    };

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="h-[100vh] flex justify-center items-center bg-gradient-to-br from-gray-700 to-gray-900 p-6">
                <div className="bg-white max-w-md w-full max-h-[90vh] overflow-auto rounded-lg shadow-lg p-8 hide-scroll">
                    <h1 className="font-extrabold text-[30px] text-center text-gray-800 mb-6">Create Your Account</h1>
                    <div className="input-group mb-4">
                        <label htmlFor="first_name" className="text-gray-600 font-semibold block mb-2">First Name*</label>
                        <input
                            type="text"
                            id="first_name"
                            className="border border-gray-300 w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your first name"
                            name="first_name"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group mb-4">
                        <label htmlFor="last_name" className="text-gray-600 font-semibold block mb-2">Last Name*</label>
                        <input
                            type="text"
                            id="last_name"
                            className="border border-gray-300 w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your last name"
                            name="last_name"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group mb-4">
                        <label htmlFor="email" className="text-gray-600 font-semibold block mb-2">Email Address*</label>
                        <input
                            type="email"
                            id="email"
                            className="border border-gray-300 w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            name="email"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group mb-4">
                        <label htmlFor="password" className="text-gray-600 font-semibold block mb-2">Password*</label>
                        <input
                            type="password"
                            id="password"
                            className="border border-gray-300 w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            name="password"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group mb-6">
                        <label htmlFor="c_password" className="text-gray-600 font-semibold block mb-2">Confirm Password*</label>
                        <input
                            type="password"
                            id="c_password"
                            className="border border-gray-300 w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Re-enter your password"
                            name="c_password"
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
                        disabled={disabled || loading}
                        onClick={register}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                    <div className="text-center mt-4">
                        <span className="text-gray-600 text-[14px]">Already a member?</span>
                        <u className="cursor-pointer text-blue-600 ml-2" onClick={() => navigate('/login')}>
                            Log In
                        </u>
                    </div>
                    <div className="flex justify-center items-center mt-4">
                        <p className="text-center text-gray-600">Or sign up with Google</p>
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
