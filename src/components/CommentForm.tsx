import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="form-group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Напишите ваш комментарий..."
          rows={3}
          className="form-control"
          required
        />
      </div>
      <div className="comment-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Отмена
        </button>
        <button type="submit" className="btn btn-primary">
          Отправить
        </button>
      </div>
    </form>
  );
};

export default CommentForm;