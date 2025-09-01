import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, onComplete, disabled = false, autoFocus = true }) => {
  const [otp, setOTP] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOTP([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      setOTP([...otp.map((d, idx) => (idx === index ? '' : d))]);
      
      // Focus previous input
      if (e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('').slice(0, length);
    
    if (pasteArray.every(char => !isNaN(char))) {
      const newOTP = [...otp];
      pasteArray.forEach((char, idx) => {
        if (idx < length) {
          newOTP[idx] = char;
        }
      });
      setOTP(newOTP);
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newOTP.findIndex(val => val === '');
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
    }
  };

  // Call onComplete when OTP is fully entered
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  }, [otp, length, onComplete]);

  return (
    <div className="flex space-x-3 justify-center">
      {otp.map((data, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          maxLength="1"
          value={data}
          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
};

export default OTPInput;
