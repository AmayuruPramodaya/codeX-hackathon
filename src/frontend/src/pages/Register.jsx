import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
    user_type: 'citizen',
    phone: '',
    address: '',
    national_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword || !form.first_name || !form.last_name) {
      return t('allFieldsRequired');
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      return t('invalidEmail');
    }
    if (form.password.length < 6) {
      return t('passwordMinLength');
    }
    if (form.password !== form.confirmPassword) {
      return t('passwordsMustMatch');
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/register/', {
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        password_confirm: form.confirmPassword,
        user_type: form.user_type,
        phone: form.phone,
        address: form.address,
        national_id: form.national_id
      });
      setSuccess(t('registrationSuccess'));
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12">
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-lg glass-effect rounded-2xl shadow-2xl p-8 sm:p-12 mx-4">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 text-center gradient-text-primary fade-in-up">
          {t('register')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-slate-700">
                {t('firstName')}
              </label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                value={form.first_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-slate-300 shadow-sm py-3 px-4 text-slate-900 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                required
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-slate-700">
                {t('lastName')}
              </label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                autoComplete="family-name"
                value={form.last_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-slate-300 shadow-sm py-3 px-4 text-slate-900 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700">
              {t('username')}
            </label>
            <input
              type="text"
              name="username"
              id="username"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              className="mt-1 block w-full rounded-xl border border-slate-300 shadow-sm py-3 px-4 text-slate-900 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              {t('email')}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-xl border border-slate-300 shadow-sm py-3 px-4 text-slate-900 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                {t('phone')} ({t('optional')})
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-slate-300 shadow-sm py-3 px-4 text-slate-900 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
              />
            </div>
            <div>
              <label htmlFor="national_id" className="block text-sm font-medium text-slate-700">
                {t('nationalId')} ({t('optional')})
              </label>
              <input
                type="text"
                name="national_id"
                id="national_id"
                value={form.national_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-slate-300 shadow-sm py-3 px-4 text-slate-900 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
              />
            </div>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">
              {t('address')} ({t('optional')})
            </label>
            <textarea
              name="address"
              id="address"
              rows="2"
              value={form.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-xl border border-slate-300 shadow-sm py-3 px-4 text-slate-900 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                {t('password')}
              </label>
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-slate-300 shadow-sm py-3 px-4 text-slate-900 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-slate-300 shadow-sm py-3 px-4 text-slate-900 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                required
              />
            </div>
          </div>
          {error && <div className="text-red-600 text-sm font-medium text-center fade-in-up">{error}</div>}
          {success && <div className="text-green-600 text-sm font-medium text-center fade-in-up">{success}</div>}
          <button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
            disabled={loading}
          >
            {loading ? t('loading') : t('register')}
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </button>
        </form>
        <div className="mt-6 text-center text-slate-600 text-sm">
          {t('alreadyHaveAccount')}{' '}
          <a href="/login" className="text-blue-700 font-semibold hover:underline">
            {t('signIn')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
