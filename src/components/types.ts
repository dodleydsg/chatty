export type MessageType = {
  created_at: string;
  response: string;
  prompt: string;
  id: string;
  versionId: string;
};

export type VersionType = {
  id: string;
  topicId: string;
  title: string;
};

export type TopicType = {
  id: string;
  title: string;
  created_at: string;
  user: string;
  versions: Array<VersionType>;
};