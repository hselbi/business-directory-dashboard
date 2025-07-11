"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Activity,
  MessageSquare,
  Wifi,
  WifiOff,
  AlertTriangle,
  X,
} from "lucide-react";
import { BusinessData, AutomationLog, AutomationStats } from "@/types/business";

interface AutomationPageProps {
  businesses: BusinessData[];
  accessToken: string;
  onBack: () => void;
}

export default function AutomationPage({
  businesses,
  accessToken,
  onBack,
}: AutomationPageProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [stats, setStats] = useState<AutomationStats>({
    total: businesses.length,
    processed: 0,
    successful: 0,
    failed: 0,
    status: "idle",
  });
  const [selectedLog, setSelectedLog] = useState<AutomationLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [logs]);

  // Initialize WebSocket connection
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket("ws://localhost:3002");

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionError("");
        addLog("info", "Connected to automation server");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          addLog("error", "Received invalid message from server");
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        addLog("warning", "Disconnected from automation server");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError(
          "Failed to connect to automation server at localhost:3002"
        );
        setIsConnected(false);
        addLog("error", "WebSocket connection error");
      };

      wsRef.current = ws;
    } catch (error) {
      setConnectionError("Unable to establish WebSocket connection");
      addLog("error", "Failed to initialize WebSocket connection");
    }
  };

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "log":
        addLog(
          data.logType || "info",
          data.message,
          data.business,
          data.details
        );
        break;
      case "stats":
        setStats((prev) => ({ ...prev, ...data.stats }));
        break;
      case "business_start":
        setStats((prev) => ({ ...prev, currentBusiness: data.business }));
        addLog("info", `Processing: ${data.business}`, data.business);
        break;
      case "business_complete":
        setStats((prev) => ({
          ...prev,
          processed: prev.processed + 1,
          successful: data.success ? prev.successful + 1 : prev.successful,
          failed: data.success ? prev.failed : prev.failed + 1,
        }));
        addLog(
          data.success ? "success" : "error",
          data.success
            ? `✅ Completed: ${data.business}`
            : `❌ Failed: ${data.business}`,
          data.business,
          data.details
        );
        break;
      case "automation_complete":
        setIsProcessing(false);
        setStats((prev) => ({ ...prev, status: "completed" }));
        addLog("success", "🎉 Automation completed successfully!");
        break;
      case "automation_error":
        setIsProcessing(false);
        setStats((prev) => ({ ...prev, status: "error" }));
        addLog(
          "error",
          `❌ Automation failed: ${data.message}`,
          undefined,
          data.details
        );
        break;
      default:
        console.log("Unknown message type:", data);
    }
  };

  // Add log entry
  const addLog = (
    type: AutomationLog["type"],
    message: string,
    business?: string,
    details?: any
  ) => {
    const log: AutomationLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      business,
      message,
      details,
    };
    setLogs((prev) => [...prev, log]);
  };

  // Start automation process
  const startAutomation = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addLog("error", "WebSocket not connected. Please connect first.");
      return;
    }

    setIsProcessing(true);
    setStats((prev) => ({
      ...prev,
      status: "running",
      startTime: new Date().toISOString(),
      processed: 0,
      successful: 0,
      failed: 0,
    }));

    // Send automation request to backend
    const message = {
      type: "start_automation",
      businesses: businesses,
      accessToken: accessToken,
      config: {
        delay: 1000, // 1 second delay between businesses
        retries: 3,
        timeout: 30000, // 30 seconds timeout per business
      },
    };

    wsRef.current.send(JSON.stringify(message));
    addLog(
      "info",
      `🚀 Starting automation for ${businesses.length} businesses...`
    );
  };

  // Stop automation
  const stopAutomation = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop_automation" }));
    }
    setIsProcessing(false);
    setStats((prev) => ({ ...prev, status: "idle" }));
    addLog("warning", "⏹️ Automation stopped by user");
  };

  // Get log type styling
  const getLogTypeStyle = (type: AutomationLog["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  // Get log icon
  const getLogIcon = (type: AutomationLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Calculate progress percentage
  const progressPercentage =
    stats.total > 0 ? (stats.processed / stats.total) * 100 : 0;

  // Initialize WebSocket on component mount
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40">
      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Automation Processing
                </h1>
                <p className="text-slate-600 mt-1">
                  Real-time automation for {businesses.length} businesses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>

          {/* Connection Error */}
          {connectionError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {connectionError}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connectWebSocket}
                  className="ml-3"
                >
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Control Panel */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                Automation Control
              </CardTitle>
              <CardDescription>
                Manage the automation process and monitor real-time progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Progress: {stats.processed} / {stats.total}
                  </span>
                  <span className="text-sm text-slate-600">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.total}
                  </div>
                  <div className="text-sm text-slate-600">Total</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.processed}
                  </div>
                  <div className="text-sm text-blue-600">Processed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.successful}
                  </div>
                  <div className="text-sm text-green-600">Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.failed}
                  </div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {/* Current Business */}
              {stats.currentBusiness && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">
                      Currently Processing:
                    </span>
                    <span className="text-sm text-purple-700">
                      {stats.currentBusiness}
                    </span>
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-3">
                {!isProcessing ? (
                  <Button
                    onClick={startAutomation}
                    disabled={!isConnected || businesses.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Automation
                  </Button>
                ) : (
                  <Button onClick={stopAutomation} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Automation
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setLogs([])}
                  disabled={isProcessing}
                >
                  Clear Logs
                </Button>

                <Button
                  variant="outline"
                  onClick={connectWebSocket}
                  disabled={isConnected}
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Reconnect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Logs */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  Real-time Logs
                </div>
                <Badge variant="outline">{logs.length} entries</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4 bg-slate-50">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No logs yet. Start automation to see real-time updates.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${getLogTypeStyle(
                        log.type
                      )}`}
                      onClick={() => {
                        setSelectedLog(log);
                        setShowLogModal(true);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {getLogIcon(log.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-slate-500">
                              {log.timestamp}
                            </span>
                            {log.business && (
                              <Badge variant="outline" className="text-xs">
                                {log.business}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm">{log.message}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Details Modal */}
      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getLogIcon(selectedLog.type)}
              Log Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Timestamp:</strong> {selectedLog.timestamp}
                </div>
                <div>
                  <strong>Type:</strong>
                  <Badge
                    className={`ml-2 ${getLogTypeStyle(selectedLog.type)}`}
                  >
                    {selectedLog.type}
                  </Badge>
                </div>
                {selectedLog.business && (
                  <div className="col-span-2">
                    <strong>Business:</strong> {selectedLog.business}
                  </div>
                )}
              </div>
              <div>
                <strong>Message:</strong>
                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm">
                  {selectedLog.message}
                </div>
              </div>
              {selectedLog.details && (
                <div>
                  <strong>Details:</strong>
                  <pre className="mt-2 p-3 bg-slate-50 rounded-lg text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
