import { storage } from '../storage';
import { sendOtpEmail } from './emailService';

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (identifier: string, type: 'email' | 'mobile'): Promise<string> => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await storage.createOtpCode({
    identifier,
    code: otp,
    type,
    expiresAt,
  });

  if (type === 'email') {
    await sendOtpEmail(identifier, otp);
  } else {
    // For mobile OTP, you would integrate with SMS service like Twilio
    // For now, we'll just log it
    console.log(`SMS OTP for ${identifier}: ${otp}`);
  }

  return otp;
};

export const verifyOtp = async (identifier: string, type: 'email' | 'mobile', code: string): Promise<boolean> => {
  const otpCode = await storage.getOtpCode(identifier, type);
  
  if (!otpCode || otpCode.code !== code) {
    return false;
  }

  // Mark OTP as used
  await storage.updateOtpCode(otpCode.id, { isUsed: true });
  
  return true;
};
