
import React from 'react'

import { amber } from '@mui/material/colors';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';

const CautionPage = () => {
    return (
        <div className="h-dvh flex items-center justify-center">
            <div className="w-3/4 h-3/5 flex flex-col justify-around items-center bg-white rounded-xl shadow-md text-center">
                <div className="top p-4">
                    <ErrorRoundedIcon sx={{fontSize: 150, color: amber[500]}}/>
                    <h1 className='text-3xl mt-8 mb-4 font-mono'>WARNING</h1>
                    <p className='txt-xl font-mono'>This browser is not supported.</p>
                </div>
            </div>
        </div>
    )
}

export default CautionPage