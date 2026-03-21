import React from 'react';
import { OrangeAuthLayout } from '../features/auth/OrangeAuthLayout';
import AuthModule from '../features/auth/AuthModule';

const SignupPage: React.FC = () => {
    return (
        <OrangeAuthLayout>
            <AuthModule initialView="signup" />
        </OrangeAuthLayout>
    );
};

export default SignupPage;
