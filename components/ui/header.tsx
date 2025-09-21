import React from "react";

import { IoChevronBack, IoMenu } from "react-icons/io5";

interface HeaderProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

const Header = ({ left, center, right, children }: HeaderProps) => {
  // If children is provided (compound component pattern)
  if (children) {
    const childrenArray = React.Children.toArray(children);
    const leftChild = childrenArray.find(
      (child) => React.isValidElement(child) && child.type === Header.Left,
    );
    const centerChild = childrenArray.find(
      (child) => React.isValidElement(child) && child.type === Header.Center,
    );
    const rightChild = childrenArray.find(
      (child) => React.isValidElement(child) && child.type === Header.Right,
    );

    return (
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center w-full px-4 py-3 h-13 bg-white">
        <div className="flex-1 flex justify-start">{leftChild}</div>
        <div className="flex-1 flex justify-center">{centerChild}</div>
        <div className="flex-1 flex justify-end">{rightChild}</div>
      </header>
    );
  }

  // Legacy prop-based layout
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center w-full px-4 py-3 h-13 bg-white">
      <div className="flex-1 flex justify-start">{left}</div>
      <div className="flex-1 flex justify-center">{center}</div>
      <div className="flex-1 flex justify-end">{right}</div>
    </header>
  );
};

// Sub-components
Header.Left = ({ children }: { children: React.ReactNode }) => <>{children}</>;
Header.Center = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
Header.Right = ({ children }: { children: React.ReactNode }) => <>{children}</>;

Header.BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
  >
    <IoChevronBack className="w-5 h-5" />
  </button>
);

Header.Title = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-lg font-semibold truncate">{children}</h1>
);

Header.MenuButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors"
  >
    <IoMenu className="w-5 h-5" />
  </button>
);

export default Header;
