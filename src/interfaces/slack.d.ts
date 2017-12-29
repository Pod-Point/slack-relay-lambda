export interface SlackMessage {
    channel: string;
    attachments: SlackMessageAttachment[];
}

export interface SlackMessageAttachment {
    title: string;
    title_link: string;
    fallback: string;
    text: string;
    color: string;
    ts: string;
}
