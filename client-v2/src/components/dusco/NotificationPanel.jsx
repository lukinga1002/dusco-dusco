import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/duscoApi";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { formatDateTime } from "@/lib/duscoFormat";
import QueryFeedback from "@/components/dusco/QueryFeedback";

export default function NotificationPanel() {
  const { user } = useDuscoAuth();
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const key = ["dusco", user?.id, "notifications"];
  const query = useQuery({ queryKey: key, queryFn: () => api.getNotifications(), retry: false, refetchInterval: 60000 });
  const list = Array.isArray(query.data) ? query.data : query.data?.notifications || [];
  const isRead = (item) => Boolean(item.read ?? item.isRead);
  const unread = list.filter((item) => !isRead(item)).length;
  const mark = useMutation({ mutationFn: (id) => id ? api.markNotificationRead(id) : api.markAllRead(), onSuccess: () => client.invalidateQueries({ queryKey: key }) });
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="ghost" size="icon" className="relative h-11 w-11" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{unread > 9 ? "9+" : unread}</span>}</Button></DialogTrigger>
    <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl">
      <DialogTitle className="font-display">Notifications</DialogTitle><DialogDescription>Updates about your savings and account.</DialogDescription>
      {query.isPending ? <QueryFeedback label="Loading notifications…" /> : query.isError ? <QueryFeedback error={query.error} onRetry={query.refetch} /> : <>
        {unread > 0 && <Button variant="outline" disabled={mark.isPending} onClick={() => mark.mutate(null)} className="min-h-11">{mark.isPending ? "Updating…" : "Mark all read"}</Button>}
        {mark.isError && <p role="alert" className="text-sm text-destructive">{mark.error.message}</p>}
        {!list.length ? <p className="py-8 text-center text-sm text-muted-foreground">You're all caught up. New updates will appear here.</p> : <ul className="space-y-2">{list.map((item) => <li key={item.id} className={`rounded-xl border p-3 ${isRead(item) ? "bg-card" : "bg-accent"}`}>
          {item.title && <p className="text-sm font-semibold">{item.title}</p>}<p className="text-sm">{item.message || (!item.title ? "Account update" : "")}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
          {!isRead(item) && <Button variant="ghost" className="mt-1 min-h-11 text-xs" disabled={mark.isPending} onClick={() => mark.mutate(item.id)}>Mark as read</Button>}
        </li>)}</ul>}
      </>}
    </DialogContent>
  </Dialog>;
}