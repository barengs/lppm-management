import React from 'react';

export default function Placeholder({ title }) {
    return (
        <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-500">Module under development.</p>
        </div>
    );
}
