import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [form, setForm] = useState({ email: '', firstname: '', lastname: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        axios.post("http://localhost:3000/api/auth/register", {
          email: form.email,
          fullName:{
            firstName:form.firstname,
            lastName:form.lastname
          },
          password: form.password
        },{
          withCredentials:true
        }).then((res)=>{
          console.log(res);
          navigate('/')
        }).catch((err)=>{
          console.log(err);
        }).finally(()=>{
          setSubmitting(false)
        }
      )

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-md p-8" role="main" aria-labelledby="register-heading">
                <header className="mb-6">
                    <h1 id="register-heading" className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create account</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Join us and start exploring.</p>
                </header>
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                        <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 dark:text-gray-200">First name</label>
                            <input id="firstname" name="firstname" placeholder="Jane" value={form.firstname} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Last name</label>
                            <input id="lastname" name="lastname" placeholder="Doe" value={form.lastname} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                        <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Create a password" value={form.password} onChange={handleChange} required minLength={6} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Account'}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</Link></p>
            </div>
        </div>
    );
};

export default Register;