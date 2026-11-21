"use client";

import { useState } from "react";
import { deleteContent } from "./actions";
import { Trash2, Eye } from "lucide-react";
import { toast } from "react-hot-toast";

type ContentItem = {
  id: string;
  title: string;
  toolType: string;
  output: string;
  createdAt: Date;
  user: { email: string };
};

export default function ContentTable({ initialContent }: { initialContent: ContentItem[] }) {
  const [content, setContent] = useState(initialContent);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    try {
      await deleteContent(id);
      setContent(content.filter(c => c.id !== id));
      toast.success("Content deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="bg-white/05 border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-white/05 text-white">
            <tr>
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Tool</th>
              <th className="p-4 font-medium">Title/Snippet</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {content.map((item) => (
              <tr key={item.id} className="hover:bg-white/05 transition-colors group">
                <td className="p-4">{item.user.email}</td>
                <td className="p-4">
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-xs">
                    {item.toolType.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-4">
                  <div className="font-medium text-white mb-1">{item.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                    {item.output}
                  </div>
                </td>
                <td className="p-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 text-gray-500">
                    <button 
                      onClick={() => alert(`Full Output:\n\n${item.output}`)}
                      className="p-2 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="View Full Content"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Content"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {content.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No content generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
