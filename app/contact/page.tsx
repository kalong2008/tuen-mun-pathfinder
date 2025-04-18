'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate Hong Kong phone number
  const validatePhone = (phone: string) => {
    // Hong Kong phone numbers can be 8 digits
    // They typically start with 2, 3, 4, 5, 6, 7, 8, 9
    const phoneRegex = /^[2-9]\d{7}$/;
    return phoneRegex.test(phone);
  };

  // Validate form fields
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      message: '',
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = '請輸入您的姓名';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = '請輸入您的電子郵件';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件地址';
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = '請輸入您的電話號碼';
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = '請輸入有效的香港電話號碼';
      isValid = false;
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = '請輸入您的訊息內容';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setStatus('loading');
    
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      setMessage('訊息已成功發送！');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setShowModal(true);
    } catch (error) {
      setStatus('error');
      setMessage('發送訊息時出現錯誤，請稍後再試。');
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Clear errors when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 pt-[64px] pb-14">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="md:text-3xl font-bold leading-6 text-gray-900 text-center md:pt-10 text-xl pt-4">聯絡我們</h1>
          <p className="text-xl text-gray-600 py-2">我們期待聽到您的聲音</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Organization Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">關於我們</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPinIcon className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">地址</h3>
                  <p className="text-gray-600 mt-1">
                    屯門山景邨景榮樓21-30號地下<br />
                    山景綜合青少年服務中心
                  </p>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=屯門山景邨景榮樓21-30號地下山景綜合青少年服務中心" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    在 Google 地圖中查看
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <PhoneIcon className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">電話</h3>
                  <p className="text-gray-600 mt-1">
                    <a href="tel:+85224626122" className="hover:text-blue-600 transition-colors">
                      +852 2462-6122
                    </a>
                    {' / '}
                    <a href="tel:+85265721493" className="hover:text-blue-600 transition-colors">
                      +852 6572-1493
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <EnvelopeIcon className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">電子郵件</h3>
                  <p className="text-gray-600 mt-1">
                    <a href="mailto:info@tuenmunpathfinder.com" className="hover:text-blue-600 transition-colors">
                      info@tuenmunpathfinder.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-3">聚會時間</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700"><span className="font-medium">前鋒會：</span>逢星期六 下午2:30 - 4:30</p>
                <p className="text-gray-700 mt-2"><span className="font-medium">幼鋒會：</span>逢星期六 下午2:30 - 4:30</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">聯絡表單</h2>
            <p className="text-gray-600 mb-6">請填寫以下表格，我們會盡快回覆您。</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div className="mt-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border border-stone-400 ${
                      errors.name ? 'border-red-300' : 'border-stone-400'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    電子郵件 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border border-stone-400 ${
                      errors.email ? 'border-red-300' : 'border-stone-400'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    電話號碼 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border border-stone-400 ${
                      errors.phone ? 'border-red-300' : 'border-stone-400'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    訊息內容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border border-stone-400 ${
                      errors.message ? 'border-red-300' : 'border-stone-400'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-2 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${status === 'loading' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                >
                  {status === 'loading' ? '發送中...' : '發送訊息'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Status Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative ${
              status === 'success' ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'
            }`}
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                status === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {status === 'success' ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              <h3 className={`mt-4 text-lg font-medium ${
                status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {status === 'success' ? '成功' : '錯誤'}
              </h3>
              
              <p className="mt-2 text-gray-600">
                {message}
              </p>
              
              <div className="mt-6">
                <button
                  onClick={closeModal}
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md text-white ${
                    status === 'success' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    status === 'success' 
                      ? 'focus:ring-green-500' 
                      : 'focus:ring-red-500'
                  }`}
                >
                  確定
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 