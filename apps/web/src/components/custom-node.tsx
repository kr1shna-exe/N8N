import { memo, useRef, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Settings, Trash2, Check } from "lucide-react";

interface CustomNodeProps {
  data: {
    label: string;
    icon?: string;
    type: string;
    configured?: boolean;
    onConfigure?: () => void;
    onDelete?: () => void;
  };
}

const CustomNode = memo(({ data }: CustomNodeProps) => {
  const [showActions, setShowActions] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowActions(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowActions(false);
    }, 300);
  };

  const getNodeIcon = () => {
    if (data.type === "telegram") return "📱";
    if (data.type === "email") return "📧";
    if (data.type === "webhook") return "🌐";
    if (data.type === "manual") return "▶️";
    return data.icon || "⚙️";
  };

  const getNodeDescription = () => {
    if (data.type === "telegram") return "Send messages via Telegram";
    if (data.type === "email") return "Send emails";
    if (data.type === "webhook") return "Webhook trigger";
    if (data.type === "manual") return "Manually trigger the workflow";
    return "";
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Node */}
      <div
        className={`px-6 py-4 shadow-lg rounded-lg bg-gray-800 border-2 min-w-[200px] transition-colors ${
          data.type === "manual" || data.type === "webhook"
            ? "border-gray-600 hover:border-orange-400"
            : "border-orange-500 hover:border-orange-400"
        }`}
      >
        <Handle type="target" position={Position.Top} className="w-3 h-3" />

        <div className="flex items-center gap-3">
          <div className="text-2xl flex-shrink-0">{getNodeIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium text-lg truncate">
              {data.label}
            </div>
            <div className="text-gray-400 text-sm truncate">
              {getNodeDescription()}
            </div>
          </div>
          {/* Configuration Status Indicator */}
          {data.configured && (
            <div className="flex-shrink-0">
              <Check className="w-5 h-5 text-orange-400" />
            </div>
          )}
          {!data.configured &&
            data.type !== "manual" &&
            data.type !== "webhook" && (
              <div className="flex-shrink-0">
                <Settings className="w-5 h-5 text-orange-400" />
              </div>
            )}
        </div>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      </div>

      {/* Hover Actions */}
      {showActions && (data.type === "telegram" || data.type === "email") && (
        <div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-700 rounded-lg p-2 flex gap-2 shadow-lg border border-gray-600 z-10"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onConfigure?.();
            }}
            className="p-2 hover:bg-orange-500 rounded text-white transition-colors"
            title="Configure"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.();
            }}
            className="p-2 hover:bg-red-500 rounded text-white transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
});

CustomNode.displayName = "CustomNode";

export { CustomNode };
