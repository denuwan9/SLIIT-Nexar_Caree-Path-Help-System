import React from 'react';
import { OrangeAuthLayout } from '../features/auth/OrangeAuthLayout';
import AuthModule from '../features/auth/AuthModule';

const LoginPage: React.FC = () => {
    return (
        <OrangeAuthLayout>
            <AuthModule initialView="login" />
        </OrangeAuthLayout>
    );
};

export default LoginPage;
