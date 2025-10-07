import React from 'react';
import InputField from './InputField';

const REASONS = ['Наряд', 'Командировка', 'Отпуск', 'Болен', 'Увольнение', 'Прочее'];

const ActionButtons = ({ isEditing, onEdit, onSave, onCancel, onDelete }) => (
  <div className="row-actions">
    {isEditing ? (
      <>
        <button onClick={onSave} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transform hover:scale-110 transition-all">💾</button>
        <button onClick={onCancel} className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transform hover:scale-110 transition-all">❌</button>
      </>
    ) : (
      <>
        <button onClick={onEdit} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transform hover:scale-110 transition-all">✏️</button>
        <button onClick={onDelete} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transform hover:scale-110 transition-all">🗑️</button>
      </>
    )}
  </div>
);

const DataRow = ({ row, index, editingId, editingRow, onEditChange, onEdit, onSave, onCancel, onDelete, isGeneral }) => {
  const isEditing = editingId === row.id;

  return (
    <div className="row-container bg-white rounded-xl shadow-md p-2 mb-2 hover:bg-gray-50 transition-all fade-in">
      <div className="row-content">
        <div className={`table-grid ${isGeneral ? 'table-grid-general' : ''}`}>
          <div className="grid-cell font-medium">{index + 1}.</div>
          {isGeneral && <div className="grid-cell text-gray-700">{`${row.course} курс`}</div>}
          {isEditing ? (
            <>
              <div className="grid-cell">
                <InputField name="rank" value={editingRow.rank} onChange={onEditChange} />
              </div>
              <div className="grid-cell">
                <InputField name="name" value={editingRow.name} onChange={onEditChange} />
              </div>
              <div className="grid-cell">
                <InputField name="destination" value={editingRow.destination} onChange={onEditChange} />
              </div>
              <div className="grid-cell">
                <InputField name="reason" value={editingRow.reason} onChange={onEditChange} type="select" options={REASONS} />
              </div>
              <div className="grid-cell">
                <InputField name="absenceTime" value={editingRow.absenceTime} onChange={onEditChange} type="date" />
              </div>
            </>
          ) : (
            <>
              <div className="grid-cell text-gray-700">{row.rank || '-'}</div>
              <div className="grid-cell text-gray-700">{row.name || '-'}</div>
              <div className="grid-cell text-gray-700">{row.destination || '-'}</div>
              <div className="grid-cell text-gray-700">{row.reason || '-'}</div>
              <div className="grid-cell text-gray-700">{row.absenceTime || '-'}</div>
            </>
          )}
        </div>
      </div>
      <ActionButtons
        isEditing={isEditing}
        onEdit={() => onEdit(row)}
        onSave={() => onSave(row.id)}
        onCancel={onCancel} // Исправлено: заменено onmovement на onCancel
        onDelete={() => onDelete(row.id)}
      />
    </div>
  );
};

export default React.memo(DataRow);