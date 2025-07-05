import React from 'react';
import { BaseTask, ExpansionTask, SimpleTask } from '../types';
import { SimpleTaskCard } from './SimpleTaskCard';
import { ExpansionTaskCard } from './ExpansionTaskCard';

interface TaskCardProps {
  task: BaseTask;
  size: "lg" | "md" | "sm"
  onClick?: () => void;
  disabled?: boolean;
  ownerDisplayName?: string;
  bigToken?: boolean;
}

function isSimpleTask(task: BaseTask): task is SimpleTask {
  return (
    (task as SimpleTask).card !== undefined
  );
}

function isExpansionTask(task: BaseTask): task is ExpansionTask {
  return (
    (task as ExpansionTask).displayName !== undefined
  );
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  size,
  onClick,
  disabled,
  ownerDisplayName,
  bigToken, 
}) => {

  if (isSimpleTask(task)) return (
    <SimpleTaskCard 
      task={task as SimpleTask}
      size={size}
      onClick={onClick}
      disabled={disabled}
      ownerDisplayName={ownerDisplayName}
      bigToken={bigToken}
    />
  )

  if (isExpansionTask(task)) return (
    <ExpansionTaskCard
      task={task as ExpansionTask}
      size={size}
      onClick={onClick}
      disabled={disabled}
      ownerDisplayName={ownerDisplayName}
      bigToken={bigToken}
    />
  );

  return (
    <>Task error</>
  );
};
