import React from 'react';
import { LightAuthLayout } from '../features/auth/LightAuthLayout';
import AuthModule from '../features/auth/AuthModule';

const LoginPage: React.FC = () => {
    return (
        <LightAuthLayout>
            <AuthModule initialView="login" />
        </LightAuthLayout>
    );
};

export default LoginPage;
