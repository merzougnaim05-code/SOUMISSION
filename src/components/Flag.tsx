import React from 'react';

/** قرص العلم الجزائري — نفس شارة ترويسة invantaire */
export function Flag({size = 'w-9 h-9 sm:w-10 sm:h-10'}: {size?: string}) {
  return (
    <div className={`${size} rounded-full border-2 border-white/90 shadow-md relative overflow-hidden shrink-0 flex items-center justify-center bg-white`}>
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full bg-[#006233]"></div>
        <div className="w-1/2 h-full bg-white"></div>
      </div>
      <div className="relative z-10 text-[#d21034] text-xs font-black select-none">★</div>
    </div>
  );
}
