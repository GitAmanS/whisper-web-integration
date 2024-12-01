// components/TranscriberSettingsModal.tsx
import React from 'react';

interface TranscriberSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    model: string;
    multilingual: boolean;
    quantized: boolean;
    language?: string;
    subtask?: string;
  };
  onSave: (newConfig: any) => void;
}

const TranscriberSettingsModal: React.FC<TranscriberSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [localConfig, setLocalConfig] = React.useState(config);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setLocalConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Transcriber Settings</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Model</label>
          <input
            type="text"
            name="model"
            value={localConfig.model}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Multilingual</label>
          <input
            type="checkbox"
            name="multilingual"
            checked={localConfig.multilingual}
            onChange={handleChange}
            className="ml-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Quantized</label>
          <input
            type="checkbox"
            name="quantized"
            checked={localConfig.quantized}
            onChange={handleChange}
            className="ml-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Language</label>
          <input
            type="text"
            name="language"
            value={localConfig.language || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Subtask</label>
          <input
            type="text"
            name="subtask"
            value={localConfig.subtask || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriberSettingsModal;
