import React from 'react';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Welcome' }) => {
  return (
    <header role="banner" className="bg-blue-600 text-white p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
};
