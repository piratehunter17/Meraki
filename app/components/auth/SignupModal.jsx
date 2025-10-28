// /app/components/auth/SignupModal.jsx
'use client';

import { useState } from 'react';
import { createClient } from '../../../lib/supabase/client';
import Modal from '../Modal';

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    // UI control states
    const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'phone'
    const [phoneAuthStep, setPhoneAuthStep] = useState(1); // 1 for entering phone, 2 for entering OTP
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    const handleGoogleSignUp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) {
            alert('Error with Google Sign Up: ' + error.message);
            setLoading(false);
        }
    };

    const handleEmailSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });

        if (error) {
            alert('Error signing up: ' + error.message);
        } else {
            alert('Sign up successful! Please check your email to verify.');
            onClose();
        }
        setLoading(false);
    };
    
    const handlePhoneSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Ensure phone is in E.164 format, e.g., +12223334444
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });

        if (error) {
            alert('Error sending OTP: ' + error.message);
        } else {
            alert('OTP sent successfully!');
            setPhoneAuthStep(2); // Move to OTP verification step
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        const { data, error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: 'sms' });

        if (error) {
            alert('Error verifying OTP: ' + error.message);
        } else {
            alert('Phone number verified successfully! You are now signed in.');
            onClose();
        }
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-3xl font-heading text-center mb-6">Create an Account</h2>
            
            {/* Google Sign Up Button */}
            <div className="mb-4">
                <button
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-3 py-3 px-6 border rounded-md hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50"
                >
                    {/* You can add a Google SVG icon here */}
                    <span>Sign up with Google</span>
                </button>
            </div>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
            </div>

            {/* --- Conditional Form Rendering --- */}

            {signupMethod === 'email' ? (
                // Email/Password Form
                <form onSubmit={handleEmailSignUp}>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="signup-email">Email Address</label>
                            <input type="email" id="signup-email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full p-3 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="signup-password">Password</label>
                            <input type="password" id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" className="mt-1 block w-full p-3 border rounded-md" />
                        </div>
                    </div>
                    <div className="mt-8">
                        <button type="submit" disabled={loading} className="w-full bg-dark text-white uppercase py-3 disabled:opacity-50">Sign Up</button>
                    </div>
                    <div className="mt-4 text-center">
                        <button type="button" onClick={() => setSignupMethod('phone')} className="text-sm text-primary hover:underline">
                            Sign up with phone instead
                        </button>
                    </div>
                </form>
            ) : (
                // Phone OTP Form
                phoneAuthStep === 1 ? (
                    <form onSubmit={handlePhoneSignUp}>
                        <label htmlFor="phone">Phone Number</label>
                        <input type="tel" id="phone" placeholder="+14155552671" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full p-3 border rounded-md" />
                        <div className="mt-8">
                            <button type="submit" disabled={loading} className="w-full bg-dark text-white uppercase py-3 disabled:opacity-50">Send OTP</button>
                        </div>
                         <div className="mt-4 text-center">
                            <button type="button" onClick={() => setSignupMethod('email')} className="text-sm text-primary hover:underline">
                                Sign up with email instead
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <label htmlFor="otp">Enter OTP</label>
                        <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required className="mt-1 block w-full p-3 border rounded-md" />
                        <div className="mt-8">
                            <button type="submit" disabled={loading} className="w-full bg-dark text-white uppercase py-3 disabled:opacity-50">Verify OTP</button>
                        </div>
                    </form>
                )
            )}

            <div className="mt-6 text-center">
                <button onClick={onSwitchToLogin} className="text-sm text-gray-600 hover:underline">
                    Already have an account? Login
                </button>
            </div>
        </Modal>
    );
}