import InboxClient from "./inbox.client";

export const metadata = {
  title: "Inbox - Godstime Foods",
  description: "View order notifications and delivery status alerts.",
};

export default function InboxPage() {
  return <InboxClient />;
}
