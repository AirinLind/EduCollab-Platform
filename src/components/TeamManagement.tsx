import React, { useState } from 'react';
import { 
  useTeamMembers, 
  useAddTeamMember, 
  useRemoveTeamMember, 
  useCreateTeamInvite,
  useUserInvites 
} from '../hooks/useTeams';
import { useCreateNotification } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import type { Project } from '../types';
import '../styles/TeamManagement.css';

interface TeamManagementProps {
  project: Project;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ project }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: teamMembers, isLoading } = useTeamMembers(project.id);
  const { data: userInvites } = useUserInvites(user?.id || '');
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  const createInviteMutation = useCreateTeamInvite();
  const createNotificationMutation = useCreateNotification();
  
  const [inviteEmail, setInviteEmail] = useState('');

  const isOwner = user && project.ownerId && user.id.toString() === project.ownerId.toString();
  const isAlreadyMember = user && teamMembers?.some(member => 
    member && member.userId && member.userId.toString() === user.id.toString()
  );
  const hasPendingInvite = userInvites?.some(invite => 
    invite && invite.projectId && invite.projectId.toString() === project.id.toString() && invite.status === 'pending'
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !user) return;

    try {
      await createInviteMutation.mutateAsync({
        projectId: project.id,
        inviteeEmail: inviteEmail,
        inviterId: user.id,
      });
      
      const invitedUserResponse = await fetch(`http://localhost:3001/users?email=${inviteEmail}`);
      const invitedUsers = await invitedUserResponse.json();
      
      if (invitedUsers.length > 0) {
        const invitedUser = invitedUsers[0];
        await createNotificationMutation.mutateAsync({
          userId: invitedUser.id,
          type: 'invite',
          title: 'Приглашение в команду',
          message: `Вас пригласили присоединиться к проекту "${project.title}"`,
          relatedId: project.id,
          isRead: false,
        });
      }
      
      setInviteEmail('');
      alert('Приглашение отправлено!');
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Ошибка при отправке приглашения');
    }
  };

  const handleRemoveMember = async (memberId: string | number) => {
    if (window.confirm('Вы уверены, что хотите удалить участника из команды?')) {
      try {
        await removeMemberMutation.mutateAsync(memberId);
        
        queryClient.invalidateQueries({ queryKey: ['team-members', project.id] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['project', project.id] });
        
        alert('Участник удален из команды');
      } catch (error) {
        console.error('Error removing member:', error);
        alert('Ошибка при удалении участника');
      }
    }
  };

  const handleJoinProject = async () => {
    if (!user) return;

    try {
      await addMemberMutation.mutateAsync({
        userId: user.id,
        projectId: project.id,
        role: 'member',
      });
      
      await createNotificationMutation.mutateAsync({
        userId: project.ownerId,
        type: 'system',
        title: 'Новый участник',
        message: `Пользователь ${user.name} присоединился к вашему проекту "${project.title}"`,
        relatedId: project.id,
        isRead: false,
      });
      
      queryClient.invalidateQueries({ queryKey: ['team-members', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['team-invites', user.id] });
      
      alert('Вы успешно присоединились к проекту! Теперь вы можете управлять этапами.');
    } catch (error) {
      console.error('Error joining project:', error);
      alert('Ошибка при присоединении к проекту');
    }
  };

  if (isLoading) return <div className="loading">Загрузка команды...</div>;

  return (
    <div className="team-management">
      <h3>Команда проекта</h3>
      
      <div className="team-members">
        <h4>Участники ({teamMembers?.length || 0})</h4>
        {teamMembers?.map(member => {
          const isCurrentUser = user && member.userId.toString() === user.id.toString();
          const isMemberOwner = member.role === 'owner';
          
          return (
            <div key={member.id} className="team-member-card">
              <div className="member-info">
                <span className="member-name">
                  Участник #{member.userId} 
                  {isMemberOwner}
                  {isCurrentUser && ' (Вы)'}
                </span>
                <span className={`member-role role-${member.role}`}>
                  {member.role === 'owner' && 'Владелец'}
                  {member.role === 'member' && 'Участник'}
                  {member.role === 'mentor' && 'Ментор'}
                </span>
              </div>
              {isOwner && !isMemberOwner && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="btn-remove"
                  title="Удалить из команды"
                  disabled={removeMemberMutation.isPending}
                >
                  {removeMemberMutation.isPending ? '⏳' : '🗑️'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isOwner && project.lookingForMembers && (
        <div className="invite-section">
          <h4>Пригласить в команду</h4>
          <form onSubmit={handleInvite} className="invite-form">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email участника"
              className="invite-input"
              required
            />
            <button 
              type="submit" 
              className="btn-invite"
              disabled={createInviteMutation.isPending}
            >
              {createInviteMutation.isPending ? 'Отправка...' : 'Пригласить'}
            </button>
          </form>
        </div>
      )}

      {!isOwner && project.lookingForMembers && !isAlreadyMember && (
        <div className="join-section">
          <button 
            className="btn-join"
            onClick={handleJoinProject}
            disabled={addMemberMutation.isPending}
          >
            {addMemberMutation.isPending ? 'Присоединение...' : '✅ Присоединиться к проекту'}
          </button>
          <p className="join-info">
            После присоединения вы сможете добавлять и управлять этапами проекта
          </p>
        </div>
      )}

      {isAlreadyMember && (
        <div className="already-member">
          <p>✅ Вы уже являетесь участником этого проекта</p>
          <p className="member-permissions">
            Вы можете добавлять и обновлять этапы проекта
          </p>
        </div>
      )}

      {hasPendingInvite && !isAlreadyMember && (
        <div className="pending-invite">
          <p>📨 У вас есть приглашение в этот проект</p>
          <button 
            className="btn-accept-invite"
            onClick={handleJoinProject}
            disabled={addMemberMutation.isPending}
          >
            {addMemberMutation.isPending ? 'Принятие...' : 'Принять приглашение'}
          </button>
        </div>
      )}

      {!user && (
        <div className="guest-message">
          <p>Войдите в систему, чтобы присоединиться к проекту</p>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;