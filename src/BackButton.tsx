import React from 'react';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackButton = ({ onClick }) => (
    <IconButton onClick={onClick} style={{ position: 'absolute', top: '10px', left: '10px' }}>
        <ArrowBackIcon />
    </IconButton>
);

export default BackButton;
