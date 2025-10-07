import React from 'react';

const TableHeader = ({ isGeneral }) => (
  <div className="overflow-x-auto">
    <div className="bg-white rounded-xl shadow-md p-2 mb-2 min-w-[1000px] hover:bg-gray-50 transition-all">
      <div
        className={`table-grid ${isGeneral ? 'table-grid-general' : ''}`}
      >
        <div className="grid-cell font-semibold text-blue-800">№</div>
        {isGeneral && (
          <div className="grid-cell font-semibold text-blue-800">Курс</div>
        )}
        <div className="grid-cell font-semibold text-blue-800">Звание</div>
        <div className="grid-cell font-semibold text-blue-800">ФИО</div>
        <div className="grid-cell font-semibold text-blue-800">Место убытия</div>
        <div className="grid-cell font-semibold text-blue-800">Причина отсутствия</div>
        <div className="grid-cell font-semibold text-blue-800">Время отсутствия</div>
      </div>
    </div>
  </div>
);

export default React.memo(TableHeader);