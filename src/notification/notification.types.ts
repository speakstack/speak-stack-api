export const NOTIFICATION_EVENTS = {
  ANSWER_CREATED: "notification.answer.created",
  COMMENT_CREATED: "notification.comment.created",
  ANSWER_ACCEPTED: "notification.answer.accepted",
  VOTE_RECEIVED: "notification.vote.received",
} as const;

export type NotificationType =
  | "answer.created"
  | "comment.created"
  | "answer.accepted"
  | "vote.received";

export interface NotificationEvent {
  type: NotificationType;
  recipientId: string;
  actorId: string;
  actorUsername: string;
  entityId: string;
  entityType: "post" | "answer" | "comment";
  postId: string;
}
