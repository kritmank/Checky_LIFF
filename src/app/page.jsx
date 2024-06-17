'use client';

import React, { useState, useEffect } from 'react'
import axios from 'axios'

import Loader from '@/components/Loader';

const UserLIFF = () => {
    const [profile, setProfile] = useState({})

    const init = async () => {
        const liffId = "2000606373-GRERPW09";
        const liff = (await import('@line/liff')).default;

        try {
            await liff.init({ liffId })
        } catch (err) {
            console.error("Error initializing LIFF", err)
        }
        
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
                if (err.response.data.code === 404) {
                    window.location.href = "/register"
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

    useEffect(() => {
        init();
    })

    return (
        <Loader />
    )
}

export default UserLIFF