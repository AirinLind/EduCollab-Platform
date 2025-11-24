import React from 'react';
import { useUsers } from '../hooks/useUsers';
import type { Comment } from '../types';

interface CommentListProps {
  comments: Comment[];
  projectId: number | string;
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  const { data: users, isLoading } = useUsers();

  const getUserById = (id: number | string) => {
    if (!users) return undefined;
    
    const targetId = id.toString();
    const foundUser = users.find(user => user.id.toString() === targetId);
    
    return foundUser;
  };

  if (isLoading) {
    return <div className="loading">Загрузка комментариев...</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="no-comments">
        <p>Пока нет комментариев. Будьте первым!</p>
      </div>
    );
  }

  return (
    <div className="comment-list">
      {comments.map(comment => {
        const author = getUserById(comment.authorId);
        
        return (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <div className="comment-author">
                <div className="author-info">
                  <strong>{author?.name || `Пользователь`}</strong>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
            <div className="comment-content">
              {comment.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentList;