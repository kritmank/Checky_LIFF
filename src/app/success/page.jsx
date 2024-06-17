
import React from 'react'

import { lightGreen } from '@mui/material/colors';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const CautionPage = () => {
    return (
        <div className="h-dvh flex items-center justify-center">
            <div className="w-3/4 h-3/5 flex flex-col justify-around items-center bg-white rounded-xl shadow-md text-center">
                <div className="top p-4">
                    <CheckCircleRoundedIcon sx={{fontSize: 150, color: lightGreen[500]}}/>
                    <h1 className='text-3xl mt-8 mb-4 font-mono'>SUCCESS</h1>
                    <p className='txt-xl font-mono'>You are registered.</p>
                </div>
            </div>
        </div>
    )
}

export default CautionPage