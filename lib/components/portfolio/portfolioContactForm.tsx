"use client";
import React, { useState } from 'react';

const ContactForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name,
            email,
            phoneNumber,
            message,
        };

        try {
            const response = await fetch('https://hooks.zapier.com/hooks/catch/2516557/8m2iei/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                console.log('Form submitted successfully!');
                // Do something with the successful response
            } else {
                console.error('Failed to submit form');
                // Handle the error case
            }
        } catch (error) {
            console.error('Failed to submit form', error);
            // Handle the error case
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Name:
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <br />
            <label>
                Email:
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <br />
            <label>
                Phone Number:
                <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </label>
            <br />
            <label>
                Message:
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            <br />
            <button type="submit">Send</button>
        </form>
    );
};

export default ContactForm;