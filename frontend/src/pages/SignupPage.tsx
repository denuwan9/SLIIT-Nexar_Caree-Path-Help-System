import React from 'react';
import { LightAuthLayout } from '../features/auth/LightAuthLayout';
import AuthModule from '../features/auth/AuthModule';

const SignupPage: React.FC = () => {
    return (
        <LightAuthLayout>
            <AuthModule initialView="signup" />
        </LightAuthLayout>
    );
};

export default SignupPage;
