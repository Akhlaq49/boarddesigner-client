import React from 'react';

function Header() {
  return (
    <div className="w-full fixed py-2 z-40 top-0 left-0 right-0 transition-opacity hover:opacity-100">
      <div className="x-card bg-white dark:bg-secondary-800 overflow-hidden rounded-md shadow container max-w-6xl mx-auto px-2 pt-2 pb-1">
        <div className="flex flex-col sm:flex-row sm:gap-4 items-start">
          <div className="flex flex-row w-full sm:w-auto sm:block">
            <a href="/" className="inline-block px-5">
              <img 
                className="h-8 sm:h-12" 
                src="data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'?%3e%3csvg%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%201900.25%20501.04'%3e%3cdefs%3e%3clinearGradient%20id='linear-gradient'%20x1='107.6'%20y1='246.02'%20x2='2012.04'%20y2='246.02'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='0'%20stop-color='%232ba74b'/%3e%3cstop%20offset='1'%20stop-color='%23036cb2'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath%20d='M155.9,484.42c0,4.16-3.47,7.62-7.62,7.62H61.76c-4.16,0-7.62-3.47-7.62-7.62l-.08-275.82H7.62c-4.16,0-7.62-3.47-7.62-7.62v-58.21c0-4.17,3.47-7.63,7.62-7.63h46.44v-23.56C54.06,30.49,110.88,0,170.48,0c20.79,0,45.74,3.47,63.06,5.54,4.16.7,7.62,4.86,7.62,9.01v57.51c0,3.47-3.47,6.24-7.62,5.55-10.4-2.08-22.87-3.47-38.8-3.47-22.87,0-38.81,11.09-38.81,47.13v13.85h77.62c4.16,0,7.62,3.47,7.62,7.63v58.21c0,4.16-3.47,7.62-7.62,7.62h-77.62l-.03,275.82Z'%20fill='url(%23linear-gradient)'%20stroke-width='0'/%3e%3c/svg%3e" 
                alt="Future KNX Logo" 
              />
            </a>
            <div className="hidden sm:block">
              <a href="/" className="x-button">
                <i className="fas fa-arrow-left"></i> Home Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;

