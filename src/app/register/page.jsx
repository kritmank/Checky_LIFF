'use client';

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

import { blue } from '@mui/material/colors';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import SchoolIcon from '@mui/icons-material/School';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BedIcon from '@mui/icons-material/Bed';
import Loader from '@/components/Loader';

const RegisterUserLIFF = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [allClass, setAllClass] = useState([])
    const [allDorm, setAllDorm] = useState([])
    const [profile, setProfile] = useState({})
    const [studentInfo, setStudentInfo] = useState({student_id: null, info: null})

    const init = async () => {
        const liffId = "2000606373-GRERPW09";
        const liff = (await import('@line/liff')).default;
        await liff.init({ liffId })
        
        if (!liff.isLoggedIn()) {
            liff.login()
        }
        
        await liff.ready
        const profile = await liff.getProfile()
        setProfile(profile)
        fetchProfile()
    }

    const fetchProfile = async () => {
        try {
            const res = await axios.post("/api/user", {
                user_id: profile.userId,
            })
            if (res.data.code === 200) {
                window.location.href = "/success"
            } else {
                window.location.reload()
            }
        } catch (err) {
            if (err.response) {
                console.log("Error response:", err.response.data)
                if (err.response.data.code === 404) {
                    setIsLoggedIn(true)
                } else {
                    console.error("Error response:", err.response.data)
                }
            } else if (err.request) {
                console.error("Error request:", err.request)
            } else if (err.message) {
                console.error("Error message:", err.message)
            }
        }
    }

    const fetchClass = async () => {
        try {
            const res = await axios.get("/api/class", {
            });
            setAllClass(res.data.map((item) => item.class_name));
        } catch (error) {
            if (error.response) {
				console.error("Error response:", error.response.data.error);
			} else if (error.request) {
				console.error("Error request:", error.request);
			} else {
				console.error("Error message:", error.message);
			}
        }
    }

    const fetchDorm = async () => {
        try {
            const res = await axios.get("/api/dorm", {
            });
            setAllDorm(res.data.map((item) => item.dorm_name));
        } catch (error) {
            if (error.response) {
				console.error("Error response:", error.response.data.error);
			} else if (error.request) {
				console.error("Error request:", error.request);
			} else {
				console.error("Error message:", error.message);
			}
        }
    }
            
    const handleUserSubmit = async(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const student_id = formData.get('student_id');

        try {
            const res = await axios.post("/api/register/user", {
                user_id: profile.userId,
                student_id: student_id,
            })
            if (res.data.code === 201) {
                window.location.href = "/"
            } else {
                window.location.reload()
            }
        } catch (err) {
            if (err.response) {
                if (err.response.data.code === 404) {
                    setStudentInfo({student_id: student_id, info: null})
                    return;
                } else {
                    console.error("Error response:", err.response.data)
                }
            } else if (err.request) {
                console.error("Error request:", err.request)
            } else if (err.message) {
                console.error("Error message:", err.message)
            }
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
        }
    }

    const handleStudentSubmit = async(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const student_id = formData.get('student_id');
        const name = formData.get('name');
        const classroom = formData.get('classroom');
        const dormitory = formData.get('dormitory');
        const dormroom = formData.get('dormroom');

        if (classroom === 'Classroom') {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please select classroom!',
            })
            return;
        }
        if (dormitory === 'Dormitory') {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please select dormitory!',
            })
            return;
        }

        try {
            const res = await axios.post("/api/register/student", {
                user_id: profile.userId,
                student_id: student_id,
                name: name,
                classroom: classroom,
                dormitory: dormitory,
                dormroom: dormroom,
            })
            if (res.data.code === 201) {
                window.location.href = "/"
            } else {
                window.location.reload()
            }
        } catch (err) {
            if (err.response) {
                console.error("Error response:", err.response.data)
            } else if (err.request) {
                console.error("Error request:", err.request)
            } else if (err.message) {
                console.error("Error message:", err.message)
            }
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
        }
    }

    useEffect(() => {
        init();
    })

    useEffect(() => {
        if (allClass.length === 0) fetchClass();
        if (allDorm.length === 0) fetchDorm();
    }, [allClass, allDorm])

    return (
        <>
        {isLoggedIn ? (
            <div className="h-dvh w-full flex justify-center items-center">
                {!studentInfo.student_id && (
                <div className="h-96 px-12 py-5 bg-white rounded-xl flex flex-col justify-center items-center">
                    <div className="flex justify-center">
                        <div className="bg-blue-950 rounded-full p-4 mb-5">
                            <LockOutlinedIcon fontSize='large' sx={{color: blue[50]}}/>
                        </div>
                    </div>
                    <h1 className='text-2xl font-semibold text-center mb-7'>Register</h1>
                    <form onSubmit={(e) => handleUserSubmit(e)}>
                        <div className="flex mb-8">
                            <span className="inline-flex items-center px-2.5 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md ">
                                <AccountCircleIcon color="action" sx={{fontSize: 20}}/>
                            </span>
                            <input 
                                type="tel" id="website-admin" pattern='[0-9]{8}' name='student_id'
                                className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  " 
                                placeholder="student_id"
                                required
                            />
                        </div>
                        <button type="submit" className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 me-2 mb-2 w-full">SUBMIT</button>
                    </form>
                </div>
                )}
                {studentInfo.student_id && !studentInfo.info && (
                <div className="px-12 py-5 bg-white rounded-xl flex flex-col justify-center items-center" style={{height: "30rem"}}>
                    <h1 className='text-2xl font-semibold text-center mb-7'>Register</h1>
                    <form onSubmit={(e) => handleStudentSubmit(e)}>
                            <div className="flex mb-4">
                                <span className="inline-flex items-center px-2.5 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md ">
                                    <AccountCircleIcon color="action" sx={{fontSize: 20}}/>
                                </span>
                                <input 
                                    type="tel" pattern='[0-9]{8}' name='student_id'
                                    className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  " 
                                    value={studentInfo.student_id}
                                    readOnly
                                />
                            </div>
                            <div className="flex mb-4">
                                <span className="inline-flex items-center px-2.5 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md ">
                                    <BorderColorIcon color="action" sx={{fontSize: 20}}/>
                                </span>
                                <input 
                                    type="text" name='name'
                                    className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  " 
                                    placeholder="Name"
                                    required
                                />
                            </div>
                            <div className="flex mb-4">
                                <span className="inline-flex items-center px-2.5 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md ">
                                    <SchoolIcon color="action" sx={{fontSize: 20}}/>
                                </span>
                                <select 
                                    id="classroom" 
                                    name="classroom"
                                    className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 py-2.5 px-1.5" 
                                    style={{height: "2.5rem"}}
                                    defaultValue={'Classroom'}
                                    required
                                >
                                    <option>Classroom</option>
                                    {allClass.map((item, index) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex mb-4">
                                <span className="inline-flex items-center px-2.5 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md">
                                    <ApartmentIcon color="action" sx={{fontSize: 20}}/>
                                </span>
                                <select 
                                    id="dormitory" 
                                    name="dormitory"
                                    className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 py-2.5 px-1.5" 
                                    style={{height: "2.5rem"}}
                                    defaultValue={'Dormitory'}
                                    required
                                >
                                    <option>Dormitory</option>
                                    {allDorm.map((item, index) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex mb-8">
                                <span className="inline-flex items-center px-2.5 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md ">
                                    <BedIcon color="action" sx={{fontSize: 20}}/>
                                </span>
                                <input 
                                    type="tel" pattern='[0-9]{3}' name='dormroom'
                                    className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  " 
                                    placeholder="Room"
                                    required
                                />
                            </div>
                            <button type="submit" className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 me-2 mb-2 w-full">SUBMIT</button>
                        </form>
                </div>
                )}
            </div>
            ):(<>
                <Loader />
            </>
        )}
        </>
    )
}

export default RegisterUserLIFF