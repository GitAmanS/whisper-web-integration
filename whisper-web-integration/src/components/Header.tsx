import React, { ReactNode } from 'react';

type HeaderProps = {
    children?: ReactNode;
  };

const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <header className="sticky top-0 bg-blue-100 text-blue-900 py-4 shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-xl font-bold">Whisper Web</h1>
        <div className='ml-auto'>{children}</div>
      </div>
    </header>
  );
};

export default Header;
