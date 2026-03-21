import React from 'react';
import { SplitAuthLayout } from '../features/auth/SplitAuthLayout';
import AuthModule from '../features/auth/AuthModule';

const LoginPage: React.FC = () => {
    return (
        <SplitAuthLayout>
            <AuthModule initialView="login" />
        </SplitAuthLayout>
    );
};

export default LoginPage;
