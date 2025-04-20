import React from 'react';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { Separator } from '@/components/ui/separator';

interface SocialLoginProps {
  onSocialLoginStart: () => void;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({ onSocialLoginStart }) => {
  const handleGoogleLogin = () => {
    onSocialLoginStart();
    window.location.href = '/api/auth/google';
  };

  const handleFacebookLogin = () => {
    onSocialLoginStart();
    window.location.href = '/api/auth/facebook';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center space-x-4">
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleLogin}
        >
          <FaGoogle className="h-4 w-4 text-red-500" />
          <span>Google</span>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleFacebookLogin}
        >
          <FaFacebook className="h-4 w-4 text-blue-600" />
          <span>Facebook</span>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
    </div>
  );
};