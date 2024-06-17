'use client';

import React, { useState, useEffect, use } from 'react'
import axios from 'axios'

import { blue, lightGreen } from '@mui/material/colors';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Loader from '@/components/Loader';

const QRCodePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true)
    const [profile, setProfile] = useState({})
    const [student, setStudent] = useState({})

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
    }

    const fetchProfile = async () => {
        try {
            const res = await axios.post("/api/user", {
                user_id: profile.userId,
            })
            if (res.data.code === 200) {
                setIsLoggedIn(true)
                setStudent({studentId: res.data.studentId})
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
        }
    }

    useEffect(() => {
        init();
    })

    useEffect(() => {
        if (profile.userId) fetchProfile()
    }, [profile.userId])

    return (
        <>
        {(isLoggedIn && student.studentId) ? (
            <div className="h-dvh flex items-center justify-center">
                <div className="w-3/4 h-1/2 flex flex-col justify-around items-center bg-white rounded-xl shadow-md text-center">
                    <div className="top p-4">
                        <h1 className='text-3xl mb-2 font-mono font-bold'>QR Code </h1>
                        <h2 className='text-xl font-mono'>{student.studentId}</h2>
                        <img src={`https://pbl.kritmank-domain.pw/api/qrcode/${student.studentId}`} alt="" width={"220px"} height={"220px"}/>
                    </div>
                </div>
            </div>
            ):(<>
                <Loader />
            </>
        )}
        </>
    )
}

export default QRCodePage